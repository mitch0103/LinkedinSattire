import "./globals.css";

export const metadata = {
  title: "LinkedIn Translator",
  description:
    "Paste a LinkedIn post. Get one honest translation of what it actually means.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A66C2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
