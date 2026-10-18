import "./globals.css";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import ToasterProvider from "@/components/ToasterProvider";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata = {
  title: { default: "Practice - coding problems", template: "%s | Practice" },
  description: "Practice coding problems with an in-browser editor.",
};

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${plex.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
