import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Next.js 15+ trata las páginas dinámicas con 0 segundos de
    // frescura en el Router Cache del cliente por default — cada
    // navegación a una ruta ya visitada vuelve a pedir el payload
    // al servidor, sin importar cuán reciente fue la visita anterior.
    // En nuestro caso esto se agrava porque el root layout usa
    // headers() (para detectar mobile/desktop sin flash), lo cual
    // marca TODA la app como dinámica, heredado hacia cada ruta hija.
    // Con esto, las 6 rutas de proceso (Corte/Plegado/etc.) que el
    // usuario alterna constantemente quedan servidas desde el cache
    // del cliente durante 30s tras la primera visita, en vez de
    // pedir un fetch nuevo en cada click.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;