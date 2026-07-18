export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/categorias/:path*",
    "/jugadores/:path*",
    "/asistencia/:path*",
    "/nominas/:path*",
    "/usuarios/:path*",
    "/estadisticas/:path*",
  ],
};

