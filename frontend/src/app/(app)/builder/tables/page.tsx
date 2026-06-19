'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmMetadataService, CustomField } from '@/services/crm-metadata.service';

export default function BuilderTablesPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void crmMetadataService.getCustomFields().then((r) => setFields(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Data Tables</h1>
      <p className="text-sm text-muted-foreground">Custom fields available for builder-bound tables.</p>
      <table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Name</th><th>Type</th><th>Entity</th></tr></thead><tbody>{fields.map((f) => <tr key={f.id} className="border-b"><td className="py-2">{f.name}</td><td>{f.fieldType}</td><td>{f.entityType}</td></tr>)}</tbody></table>
    </div>
  );
}
