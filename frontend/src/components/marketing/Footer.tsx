import Link from 'next/link';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'CRM', href: '/product/crm' },
      { label: 'AI Agents', href: '/product/ai' },
      { label: 'Voice AI', href: '/product/voice' },
      { label: 'WhatsApp', href: '/product/whatsapp' },
      { label: 'Workflows', href: '/product/workflow' },
      { label: 'Analytics', href: '/product/analytics' },
      { label: 'Marketplace', href: '/product/marketplace' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [

      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
      { label: 'Integrations', href: '/product/integrations' },
      { label: 'Changelog', href: '/blog' },
      { label: 'Demo Access', href: '/demo' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'SLA', href: '/sla' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#060a14]">
      {/* Glow */}
      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" /> */}

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="text-gray-900 dark:text-white font-bold text-lg">
                Autopilot<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">Monster</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed max-w-xs">
              The AI-powered autonomous customer engagement OS for modern revenue teams.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {['X', 'In', 'GH', 'YT'].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors text-xs font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">&copy; {new Date().getFullYear()} AutopilotMonster. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
