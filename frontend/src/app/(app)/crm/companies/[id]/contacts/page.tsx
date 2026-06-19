'use client';

import { useEffect, useState, use } from 'react';
import { ArrowLeft, Loader2, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { companyService, CompanyContact } from '@/services/company.service';

export default function CompanyContactsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await companyService.getContacts(id);
        setContacts(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/crm/companies/${id}`} className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="page-title">Company Contacts</h1>
          <p className="page-description">{contacts.length} contacts linked</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No contacts for this company.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-t border-border">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {contact.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {contact.phone}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
