export function applyFileNameTemplate(
  template: string,
  originalName: string,
): string {
  const trimmed = (originalName || "archivo").trim() || "archivo"
  const dot = trimmed.lastIndexOf(".")
  const base = dot > 0 ? trimmed.slice(0, dot) : trimmed
  const ext = dot > 0 ? trimmed.slice(dot + 1) : ""
  const tpl = (template || "{name}").trim() || "{name}"
  let out = tpl.replaceAll("{name}", base).replaceAll("{ext}", ext)
  if (ext && !out.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
    out = `${out}.${ext}`
  }
  return out.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").slice(0, 180)
}
