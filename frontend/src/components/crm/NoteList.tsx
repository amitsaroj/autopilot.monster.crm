'use client';

import { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Tag as TagIcon,
  User,
  Calendar,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { noteService, Note } from '@/services/note.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface NoteListProps {
  notes: Note[];
  onNoteCreated: () => void;
  entityId: string;
  entityType: 'contactId' | 'dealId' | 'companyId';
}

export function NoteList({ notes, onNoteCreated, entityId, entityType }: NoteListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await noteService.createNote({
        ...newNote,
        [entityType]: entityId,
      });
      toast.success('Note added');
      setNewNote({ title: '', content: '' });
      setIsCreating(false);
      onNoteCreated();
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await noteService.deleteNote(id);
      toast.success('Note deleted');
      onNoteCreated();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" /> Internal Notes
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateNote}
          className="bg-white dark:bg-card p-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5 space-y-4"
        >
          <input
            required
            placeholder="Note Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full bg-transparent border-none text-sm font-semibold focus:ring-0 placeholder:text-gray-300"
          />
          <textarea
            required
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-300 min-h-[100px] resize-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {notes.length === 0 && !isCreating ? (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-border rounded-3xl opacity-40">
            <FileText className="w-8 h-8 mb-2 text-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              No notes found
            </span>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group bg-white dark:bg-card p-5 rounded-2xl border border-gray-100 dark:border-border hover:border-blue-100 dark:hover:border-blue-900/50 shadow-soft transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {note.title}
                  </h4>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1.5 text-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-50 dark:border-border mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <User className="w-3 h-3" />
                  John Doe
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <TagIcon className="w-3 h-3 text-blue-400" />
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold text-blue-500 uppercase tracking-tighter"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
