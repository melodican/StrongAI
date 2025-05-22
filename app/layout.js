import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContextProvider from "@/contexts/AuthContextProvider";
import { ToastContainer } from "react-toastify";
import ChatContextProvider from "@/contexts/ChatContextProvider";
import SidebarContextProvider from "@/contexts/SidebarContextProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Strong AI",
  description: "Created by Strong AI ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon-image.png" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <AuthContextProvider>
          <ChatContextProvider>
            <SidebarContextProvider>{children}</SidebarContextProvider>
          </ChatContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
