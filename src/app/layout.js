import Navbar from "@/shared/Navbar/Navbar";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";

export const metadata = { title: "Inventra" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased bg-mist">
        <ReduxProvider>
          {" "}
          <Navbar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
