import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Mi Club de Vóleibol",
  description: "Gestión de categorías, jugadores, asistencia y nóminas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <NavBar />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
