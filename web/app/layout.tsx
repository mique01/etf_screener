import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "ETF Rotation Dashboard",
  description: "Value/Growth rotation monitor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
