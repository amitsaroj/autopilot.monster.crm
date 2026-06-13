import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import '@/app/globals.css';



export const metadata: Metadata = {
  title: {
    default: 'AutopilotMonster CRM',
    template: '%s | AutopilotMonster',
  },
  description: 'AI-powered enterprise CRM platform — AutopilotMonster',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
