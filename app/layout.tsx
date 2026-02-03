import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Secret Valentine Exchange 2026",
  description: "Join the Valentine Exchange and find your secret Valentine!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#E31B23',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
              },
            }}
          />
        </UserProvider>
      </body>
    </html>
  );
}
