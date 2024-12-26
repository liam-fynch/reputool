import "./globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import SessionProvider from "./components/SessionProvider";
import SideNav from "@/components/SideNav";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="flex">
            <SideNav />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
