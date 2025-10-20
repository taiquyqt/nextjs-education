import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/page";
import Providers from "./providers";
import { Bounce, ToastContainer } from "react-toastify";
import "sweetalert2/dist/sweetalert2.js";
import "katex/dist/katex.min.css";
import "mathlive/static.css";
import "./globals.css";
import Notification from "@/components/notification/notification";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Học tập",
  description: "Nền tảng học tập hiện đại cho giáo viên và học sinh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          {" "}
          {/* 👉 Bọc ở đây */}
          {children}
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
          <Notification />
          
        </Providers>
      </body>
    </html>
  );
}
