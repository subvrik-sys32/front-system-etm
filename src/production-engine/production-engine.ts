import { XMLParser } from "fast-xml-parser";

export type ProductionFileType = "nsp" | "dxf" | "unknown";

export interface ProductionPoint {
  x: number;
  y: number;
  bulge: number;
}

export interface ProductionGeometry {
  id: string;
  type: "polyline";
  closed: boolean;
  layer?: string;
  name?: string;
  points: ProductionPoint[];
}

export interface ProductionMetadata {
  version?: string;
  author?: string;
  createdAt?: string;
}

export interface ProductionStatistics {
  width: number;
  height: number;
  area: number;
  perimeter: number;
}

export interface ProductionDocument {
  type: ProductionFileType;
  metadata: ProductionMetadata;
  sheets: any[]; // Se puede tipar más adelante
  geometries: ProductionGeometry[];
  statistics: ProductionStatistics;
}

export interface ProductionPiece {
  index: number;
  name: string;
  layer?: string;
  width: number;
  height: number;
  area: number;
  perimeter: number;
  points: number;
  closed: boolean;
  /** Cuántas entidades NSP/DXF crudas (contorno + marcas + agujeros) forman esta pieza */
  entityCount: number;
  /** Cuántos de esos contornos son agujeros internos detectados */
  holeCount: number;
  geometryIds: string[];
}

interface FullBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Distancia (en unidades del documento, normalmente mm) que se usa para decidir
 * si dos entidades pertenecen a la misma pieza física. Los segmentos de un mismo
 * contorno normalmente comparten extremos exactos (gap ~0); dos piezas distintas
 * en un anidado real suelen dejar varios mm de separación entre sí. Si tus piezas
 * reales quedan más pegadas que esto (o el nesting es muy ajustado), baja este valor.
 */
const PIECE_CLUSTER_GAP = 1.5;

export class ProductionEngine {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    trimValues: true,
  });

  private _document: ProductionDocument = this.createEmptyDocument();

  get document() {
    return this._document;
  }

  get geometries() {
    return this._document.geometries;
  }

  clear() {
    this._document = this.createEmptyDocument();
  }

  async load(source: string) {
    this.clear();
    const type = this.detectType(source);
    switch (type) {
      case "nsp":
        this.loadNSP(source);
        break;
      case "dxf":
        this.loadDXF(source);
        break;
      default:
        throw new Error("Unsupported production file.");
    }
  }

  private createEmptyDocument(): ProductionDocument {
    return {
      type: "unknown",
      metadata: {},
      sheets: [],
      geometries: [],
      statistics: { width: 0, height: 0, area: 0, perimeter: 0 },
    };
  }

  private detectType(source: string): ProductionFileType {
    const text = source.trim();
    if (text.startsWith("<?xml") && text.includes("<root")) return "nsp";
    if (text.includes("SECTION") && text.includes("ENTITIES")) return "dxf";
    return "unknown";
  }

  private loadNSP(source: string) {
    const xml = this.xmlParser.parse(source);
    this._document.type = "nsp";
    this.parseNSP(xml);
    this.calculateStatistics();
  }

  private loadDXF(source: string) {
    this._document.type = "dxf";
    this.parseDXF(source);
    this.calculateStatistics();
  }

  // --- Lógica de Parseo NSP ---
  private parseNSP(xml: any) {
    const root = xml.root ?? xml;
    this._document.metadata = { version: root.version?.toString() };
    const polylines = this.findNodes(root, "PolylineNode");
    for (const node of polylines) {
      const geometry = this.createPolylineGeometry(node);
      if (geometry.points.length >= 2) this._document.geometries.push(geometry);
    }
  }

  private findNodes(node: any, name: string): any[] {
    const result: any[] = [];
    if (node == null) return result;
    if (Array.isArray(node)) {
      for (const item of node) result.push(...this.findNodes(item, name));
      return result;
    }
    if (typeof node !== "object") return result;

    for (const key of Object.keys(node)) {
      const value = node[key];
      if (key === name) result.push(...(Array.isArray(value) ? value : [value]));
      result.push(...this.findNodes(value, name));
    }
    return result;
  }

  private createPolylineGeometry(node: any): ProductionGeometry {
    const points = this.extractPoints(node);
    const commonProperty = node?.CommonProperty ?? node?.commonProperty;
    return {
      id: crypto.randomUUID(),
      type: "polyline",
      closed: this.isClosed(points),
      layer: commonProperty?.layer,
      name: node?.name ?? node?.Name ?? commonProperty?.name ?? commonProperty?.Name,
      points,
    };
  }

  private extractPoints(node: any): ProductionPoint[] {
    const list = node?.pListAndBulges?.endNode;
    if (!list) return [];
    const nodes = Array.isArray(list) ? list : [list];
    return nodes.map((p: any) => ({
      x: Number(p.x ?? 0),
      y: Number(p.y ?? 0),
      bulge: Number(p.bul ?? p.bulge ?? 0),
    }));
  }

  // --- Lógica de Parseo DXF ---
  private parseDXF(source: string) {
    const lines = source.replace(/\r/g, "").split("\n");
    let index = 0;
    while (index < lines.length) {
      const code = lines[index]?.trim();
      const value = lines[index + 1]?.trim();
      if (code === "0" && value === "LWPOLYLINE") {
        const res = this.readLWPolyline(lines, index);
        this._document.geometries.push(res.geometry);
        index = res.nextIndex;
      } else if (code === "0" && value === "POLYLINE") {
        const res = this.readPolyline(lines, index);
        this._document.geometries.push(res.geometry);
        index = res.nextIndex;
      } else {
        index += 2;
      }
    }
  }

  private readLWPolyline(lines: string[], start: number) {
    const points: ProductionPoint[] = [];
    let layer: string | undefined, closed = false, x: number | undefined, y: number | undefined, bulge = 0;
    let i = start + 2;
    while (i < lines.length && lines[i]?.trim() !== "0") {
      const code = lines[i]?.trim();
      const val = lines[i + 1]?.trim();
      if (code === "8") layer = val;
      if (code === "70") closed = (Number(val) & 1) === 1;
      if (code === "10") x = Number(val);
      if (code === "20") {
        y = Number(val);
        if (x !== undefined) {
          points.push({ x, y, bulge });
          x = undefined; y = undefined; bulge = 0;
        }
      }
      if (code === "42") bulge = Number(val);
      i += 2;
    }
    return { nextIndex: i, geometry: { id: crypto.randomUUID(), type: "polyline", closed, layer, points } as ProductionGeometry };
  }

  private readPolyline(lines: string[], start: number) {
    const points: ProductionPoint[] = [];
    let layer: string | undefined, closed = false;
    let i = start + 2;
    while (i < lines.length) {
      if (lines[i]?.trim() === "0" && lines[i + 1]?.trim() === "SEQEND") { i += 2; break; }
      if (lines[i]?.trim() === "8") layer = lines[i + 1]?.trim();
      if (lines[i]?.trim() === "70") closed = (Number(lines[i + 1]?.trim()) & 1) === 1;
      if (lines[i]?.trim() === "0" && lines[i + 1]?.trim() === "VERTEX") {
        const v = this.readVertex(lines, i);
        points.push(v.point);
        i = v.nextIndex;
      } else {
        i += 2;
      }
    }
    return { nextIndex: i, geometry: { id: crypto.randomUUID(), type: "polyline", closed, layer, points } as ProductionGeometry };
  }

  private readVertex(lines: string[], start: number) {
    let x = 0, y = 0, bulge = 0;
    let i = start + 2;
    while (i < lines.length && lines[i]?.trim() !== "0") {
      const code = lines[i]?.trim();
      const val = lines[i + 1]?.trim();
      if (code === "10") x = Number(val);
      if (code === "20") y = Number(val);
      if (code === "42") bulge = Number(val);
      i += 2;
    }
    return { nextIndex: i, point: { x, y, bulge } };
  }

  // --- Estadísticas y Utilidades ---
  private calculateStatistics() {
    const allPoints = this._document.geometries.flatMap((g) => g.points);
    if (allPoints.length === 0) return;

    const bounds = this.getBounds();
    let perimeter = 0;
    for (const g of this._document.geometries) {
      perimeter += this.geometryPerimeter(g);
    }

    this._document.statistics = { width: bounds.width, height: bounds.height, area: this.calculateArea(), perimeter };
  }

  private getBounds() {
    const points = this._document.geometries.flatMap((g) => g.points);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  private geometryBounds(points: ProductionPoint[]) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    }
    if (!isFinite(minX)) return { width: 0, height: 0 };
    return { width: maxX - minX, height: maxY - minY };
  }

  private geometryPerimeter(g: ProductionGeometry) {
    let perimeter = 0;
    for (let i = 1; i < g.points.length; i++) perimeter += this.distance(g.points[i - 1], g.points[i]);
    if (g.closed && g.points.length > 2) perimeter += this.distance(g.points[g.points.length - 1], g.points[0]);
    return perimeter;
  }

  private distance(a: ProductionPoint, b: ProductionPoint) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  private calculateArea() {
    return Math.abs(this._document.geometries.reduce((acc, g) => acc + (g.closed ? this.polyArea(g.points) : 0), 0));
  }

  private polyArea(points: ProductionPoint[]) {
    let a = 0;
    for (let i = 0; i < points.length; i++) {
      const c = points[i], n = points[(i + 1) % points.length];
      a += c.x * n.y - n.x * c.y;
    }
    return a / 2;
  }

  private isClosed(points: ProductionPoint[]): boolean {
    if (points.length < 3) return false;
    const f = points[0], l = points[points.length - 1];
    return Math.abs(f.x - l.x) < 0.001 && Math.abs(f.y - l.y) < 0.001;
  }

  // --- Exportación SVG ---
  toSVG(): string {
    if (this._document.geometries.length === 0) return "";
    const b = this.getBounds();
    const pad = 20, w = b.width + pad * 2, h = b.height + pad * 2;
    const paths = this._document.geometries.map(g => {
      if (g.points.length === 0) return "";
      let d = `M ${g.points[0].x - b.minX + pad} ${h - (g.points[0].y - b.minY) - pad}`;
      for (let i = 1; i < g.points.length; i++) d += ` L ${g.points[i].x - b.minX + pad} ${h - (g.points[i].y - b.minY) - pad}`;
      if (g.closed) d += " Z";
      return `<path d="${d}" fill="none" stroke="white" stroke-width="1.5" />`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths}</svg>`;
  }

  summary() {
    return {
      type: this.document.type,
      geometries: this.document.geometries.length,
      points: this.document.geometries.reduce((t, g) => t + g.points.length, 0),
      width: this.document.statistics.width,
      height: this.document.statistics.height,
      area: this.document.statistics.area,
      perimeter: this.document.statistics.perimeter,
    };
  }

  private fullBounds(points: ProductionPoint[]): FullBounds {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  private boundsIntersect(a: FullBounds, b: FullBounds, margin: number) {
    return (
      a.minX - margin <= b.maxX &&
      a.maxX + margin >= b.minX &&
      a.minY - margin <= b.maxY &&
      a.maxY + margin >= b.minY
    );
  }

  private boundsContains(outer: FullBounds, inner: FullBounds, tolerance = 0.05) {
    return (
      inner.minX >= outer.minX - tolerance &&
      inner.maxX <= outer.maxX + tolerance &&
      inner.minY >= outer.minY - tolerance &&
      inner.maxY <= outer.maxY + tolerance
    );
  }

  /**
   * Agrupa entidades crudas (contornos de corte, marcas, agujeros, microjoints...)
   * en piezas físicas reales, usando proximidad espacial: todo lo que está pegado
   * o solapado pertenece a la misma pieza; el espacio de separación del anidado
   * es lo que distingue una pieza de la siguiente. Devuelve una fila por pieza real,
   * no por línea suelta.
   */
  pieces(clusterGap: number = PIECE_CLUSTER_GAP): ProductionPiece[] {
    const geoms = this._document.geometries;
    const n = geoms.length;
    if (n === 0) return [];

    const bounds = geoms.map((g) => this.fullBounds(g.points));

    // Union-Find para agrupar por proximidad de bounding box.
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    const union = (a: number, b: number) => {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent[ra] = rb;
    };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.boundsIntersect(bounds[i], bounds[j], clusterGap)) union(i, j);
      }
    }

    const groups = new Map<number, number[]>();
    for (let i = 0; i < n; i++) {
      const root = find(i);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root)!.push(i);
    }

    // Orden estable de izquierda a derecha / arriba a abajo para que la
    // numeración sea predecible en vez de depender del orden de aparición en el XML.
    const clusters = Array.from(groups.values()).sort((a, b) => {
      const ba = this.fullBounds(a.flatMap((i) => geoms[i].points));
      const bb = this.fullBounds(b.flatMap((i) => geoms[i].points));
      if (Math.abs(ba.minY - bb.minY) > 1e-6) return ba.minY - bb.minY;
      return ba.minX - bb.minX;
    });

    return clusters.map((indices, clusterIdx) => {
      const members = indices.map((i) => geoms[i]);
      const clusterBounds = this.fullBounds(members.flatMap((g) => g.points));

      // El contorno exterior real de la pieza = el polígono cerrado de mayor área.
      let outer: ProductionGeometry | null = null;
      let outerArea = -Infinity;
      for (const g of members) {
        if (!g.closed) continue;
        const a = Math.abs(this.polyArea(g.points));
        if (a > outerArea) {
          outerArea = a;
          outer = g;
        }
      }

      // Agujeros: contornos cerrados contenidos dentro del exterior (no son piezas aparte).
      let holesArea = 0;
      let holeCount = 0;
      if (outer) {
        const outerBounds = this.fullBounds(outer.points);
        for (const g of members) {
          if (g === outer || !g.closed) continue;
          const b = this.fullBounds(g.points);
          if (this.boundsContains(outerBounds, b)) {
            holesArea += Math.abs(this.polyArea(g.points));
            holeCount++;
          }
        }
      }

      const totalPoints = members.reduce((t, g) => t + g.points.length, 0);
      const totalPerimeter = members.reduce((t, g) => t + this.geometryPerimeter(g), 0);
      const netArea = outer ? Math.max(outerArea - holesArea, 0) : 0;

      const nameSource = outer ?? members[0];
      const name = nameSource.name || nameSource.layer || `Pieza ${clusterIdx + 1}`;

      return {
        index: clusterIdx + 1,
        name,
        layer: nameSource.layer,
        width: clusterBounds.width,
        height: clusterBounds.height,
        area: netArea,
        perimeter: totalPerimeter,
        points: totalPoints,
        closed: !!outer,
        entityCount: members.length,
        holeCount,
        geometryIds: members.map((g) => g.id),
      };
    });
  }

  toJSON() { return JSON.stringify(this.document, null, 2); }
}