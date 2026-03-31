import MarketingNavbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-white selection:bg-indigo-500/30">
      <MarketingNavbar />
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <MarketingFooter />
    </div>
  );
}
