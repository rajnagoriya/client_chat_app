"use client";

// app/layout.js
import SocketProvider from "@/providers/SocketProvider";
import { StateProvider } from "@/providers/StateContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster/>
        <div id="photo-picker-element"></div>
        <StateProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
        </StateProvider>
        
      </body>
    </html>
  );
}




