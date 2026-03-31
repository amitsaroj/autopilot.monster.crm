"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const navLinks = [
  {
    label: 'Product',
    children: [
      { label: 'CRM', href: '/product/crm' },
      { label: 'AI Agents', href: '/product/ai' },
      { label: 'Voice AI', href: '/product/voice' },
      { label: 'WhatsApp', href: '/product/whatsapp' },
      { label: 'Workflows', href: '/product/workflow' },
      { label: 'Analytics', href: '/product/analytics' },
      { label: 'Marketplace', href: '/product/marketplace' },
      // { label: 'Voice AI', href: '/builder/voice-flows' },
      // { label: 'Campaigns', href: '/crm/campaigns' },
      // { label: 'Knowledge Base', href: '/ai/knowledge-base' },
      { label: 'Call Logs', href: '/voice/logs' },
      { label: 'Analytics', href: '/analytics/voice' },
    ]
  },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },

  { label: 'Blog', href: '/blog' },
];

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06] shadow-lg dark:shadow-2xl dark:shadow-black/20'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">
            Autopilot<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">Monster</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05]">
                  {link.label} <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {openDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#111827]/95 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/[0.08] shadow-2xl dark:shadow-black/40 p-2"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href!}
                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Auth Buttons + Theme Toggle */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle variant="marketing" />
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <ThemeToggle variant="marketing" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/[0.06] overflow-y-auto max-h-[calc(100vh-64px)]"
          >
            <div className="px-4 sm:px-6 py-6 space-y-4">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{link.label}</span>
                    {link.children.map((child) => (
                      <Link key={child.href} href={child.href} className="block pl-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link key={link.label} href={link.href!} className="block py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-4 border-t border-gray-200 dark:border-white/[0.06] flex flex-col gap-3">
                <Link href="/login" className="text-sm text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Log in</Link>
                <Link href="/register" className="text-sm text-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold">Start Free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
