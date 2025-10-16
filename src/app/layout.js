import "./globals.css";

export const metadata = { title: "Inventra" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased bg-mist">
        {children}
      </body>
    </html>
  );
}
