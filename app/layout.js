import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NextAuthProvider from './authProvider';

import { Toaster } from "@/components/ui/sonner"

import localFont from 'next/font/local';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const arialFont = localFont({
  src: './fonts/sf.woff2',
  variable: '--font-arial',
});

export const metadata = {
  title: 'InstaChat',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={` ${arialFont.variable} antialiased`}>
<NextAuthProvider>
          {children}
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>

  );
}