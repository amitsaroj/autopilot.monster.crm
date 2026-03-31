import { Layout, FormInput, Table2, Palette, Globe, Plus } from 'lucide-react';
import Link from 'next/link';

export default function BuilderPage() {
  const sections = [
    { label: 'Pages', href: '/builder/pages', icon: Layout, count: 8, desc: 'Custom page editor' },
    { label: 'Forms', href: '/builder/forms', icon: FormInput, count: 14, desc: 'Form builder & submissions' },
    { label: 'Tables', href: '/builder/tables', icon: Table2, count: 5, desc: 'Custom data tables' },
    { label: 'Themes', href: '/builder/themes', icon: Palette, count: 3, desc: 'Branding & theme editor' },
    { label: 'Published', href: '/builder/publish', icon: Globe, count: 6, desc: 'Live published pages' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">No-Code Builder</h1>
          <p className="page-description">Drag-and-drop pages, forms, and data tables</p>
        </div>
        <Link href="/builder/pages/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Page
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-xl border border-border bg-card p-6 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted group-hover:bg-[hsl(246,80%,60%)]/10 transition-colors">
                <s.icon className="h-5 w-5 text-muted-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors" />
              </div>
              <span className="text-2xl font-bold text-foreground">{s.count}</span>
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">{s.label}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4">Recent Pages</h2>
        <div className="grid grid-cols-3 gap-3">
          {['Lead Capture Form', 'Pricing Page', 'Contact Us', 'Product Catalog', 'Case Study'].map((page) => (
            <Link key={page} href="/builder/pages/1/edit" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[hsl(246,80%,60%)]/50 transition-colors">
              <Layout className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">{page}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
