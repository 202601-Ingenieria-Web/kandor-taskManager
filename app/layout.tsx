import type { Metadata } from 'next';
import { Public_Sans, Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gestión de Tareas',
  description: 'Sistema de Gestión de Tareas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={cn('h-full antialiased', geistSans.variable, geistMono.variable, 'font-sans', publicSans.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
