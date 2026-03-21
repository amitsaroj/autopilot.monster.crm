import Link from 'next/link';
import { Construction } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function PagePlaceholder({
  title,
  description,
  backHref,
  backLabel,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {backHref && (
          <Link
            href={backHref}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            ← {backLabel ?? 'Back'}
          </Link>
        )}
      </div>
      <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-border bg-muted/20">
        <div className="p-4 rounded-2xl bg-[hsl(246,80%,60%)]/10 mb-4">
          <Construction className="h-8 w-8 text-[hsl(246,80%,60%)]" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          This page is part of the AutopilotMonster platform and will be fully
          implemented as part of the module build.
        </p>
      </div>
    </div>
  );
}
