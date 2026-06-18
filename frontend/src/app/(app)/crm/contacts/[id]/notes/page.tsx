'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService } from '@/services/contact.service';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function ContactNotesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ContactSubpage params={params} title="Notes">
      {(contact) => <NotesList contactId={contact.id} />}
    </ContactSubpage>
  );
}

function NotesList({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await contactService.getNotes(contactId);
      setItems((res as { data: { data: Note[] } }).data.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [contactId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await contactService.createNote(contactId, { title, content });
      setTitle('');
      setContent('');
      toast.success('Note added');
      void load();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => void handleCreate(e)} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </form>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between">
                <p className="font-medium">{note.title}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
