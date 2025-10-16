// src/app/layout.jsx
import Navbar from "@/shared/Navbar/Navbar";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";

export const metadata = {
  metadataBase: new URL("https://bitechx-pied.vercel.app"),
  title: { default: "Inventra", template: "%s · Inventra" },
  description:
    "Browse, create, edit, and manage products with a clean, modern UI. Built with Next.js and Redux Toolkit.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Inventra",
    description:
      "Browse, create, edit, and manage products with a clean, modern UI.",
    url: "/",
    siteName: "Inventra",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://i.ibb.co.com/bvZMqPz/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Inventra preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inventra",
    description:
      "Browse, create, edit, and manage products with a clean, modern UI.",
    images: ["https://i.ibb.co.com/bvZMqPz/profile.jpg"],
  },
  robots: { index: true, follow: true },
  themeColor: "#EFF1F3",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-mist">
        <ReduxProvider>
          <Navbar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
