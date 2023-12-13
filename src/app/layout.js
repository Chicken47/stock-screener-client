import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Stoked",
  description: "Stoked",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#414141]">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
