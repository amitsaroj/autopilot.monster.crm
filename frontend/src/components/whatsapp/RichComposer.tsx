'use client';
import { useEffect, useState } from 'react';
import { Field, Notice, inputClass, secondaryClass } from './ui';

type ListSection = {
  title: string;
  rows: { id: string; title: string; description: string }[];
};
const initialSections: ListSection[] = [
  { title: '', rows: [{ id: 'option-1', title: '', description: '' }] },
];
const mediaAccept: Record<'image' | 'video' | 'audio' | 'document', string> = {
  image: 'image/jpeg,image/png,.jpg,.jpeg,.png',
  video: 'video/mp4,video/3gpp,.mp4,.3gp',
  audio: 'audio/aac,audio/mp4,audio/mpeg,audio/amr,audio/ogg,.aac,.m4a,.mp3,.amr,.ogg',
  document:
    'application/pdf,text/plain,application/msword,application/vnd.ms-powerpoint,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.pdf,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx',
};
function validText(value: string, limit: number) {
  return !!value.trim() && value.length <= limit && !value.includes('\0');
}

export function RichComposer({
  media,
  interactive,
  onUpload,
  onChange,
}: {
  media: boolean;
  interactive: boolean;
  onUpload?: (file: File, type: 'image' | 'video' | 'audio' | 'document') => Promise<string>;
  onChange: (value: Record<string, unknown> | null) => void;
}) {
  const [type, setType] = useState(media ? 'image' : interactive ? 'interactive' : '');
  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [buttons, setButtons] = useState(['']);
  const [listButton, setListButton] = useState('View options');
  const [sections, setSections] = useState<ListSection[]>(initialSections);
  const [capabilities, setCapabilities] = useState({ media, interactive });
  if (capabilities.media !== media || capabilities.interactive !== interactive) {
    setCapabilities({ media, interactive });
    setType((current) =>
      (current === 'interactive' || current === 'list' ? interactive : media && !!current)
        ? current
        : media
          ? 'image'
          : interactive
            ? 'interactive'
            : '',
    );
    setMediaId('');
    if (!media) {
      setLink('');
      setFilename('');
    }
    if (!interactive) {
      setButtons(['']);
      setListButton('View options');
      setSections(initialSections);
    }
  }
  useEffect(() => {
    onChange(null);
  }, [media, interactive, onChange]);
  function edit(work: () => void) {
    work();
    onChange(null);
  }
  const isInteractive = type === 'interactive' || type === 'list';
  const supported = isInteractive ? interactive : media && !!type;
  const rows = sections.flatMap((section) => section.rows);
  const listErrors: string[] = [];
  if (type === 'list') {
    if (!validText(text, 1024)) listErrors.push('Enter a message of 1–1,024 characters.');
    if (!validText(listButton, 20))
      listErrors.push('Enter a list button label of 1–20 characters.');
    if (!sections.length || sections.length > 10 || !rows.length || rows.length > 10)
      listErrors.push('Use 1–10 sections and at most 10 rows across the entire list.');
    if (new Set(rows.map((row) => row.id.trim())).size !== rows.length)
      listErrors.push('Row IDs must be unique across all sections.');
    sections.forEach((section, sectionIndex) => {
      if ((sections.length > 1 || section.title.trim()) && !validText(section.title, 24))
        listErrors.push(`Section ${sectionIndex + 1} needs a title of 1–24 characters.`);
      if (!section.rows.length)
        listErrors.push(`Section ${sectionIndex + 1} needs at least one row.`);
      section.rows.forEach((row, rowIndex) => {
        const label = `Section ${sectionIndex + 1}, row ${rowIndex + 1}`;
        if (!validText(row.id, 200)) listErrors.push(`${label}: enter an ID of 1–200 characters.`);
        if (!validText(row.title, 24))
          listErrors.push(`${label}: enter a title of 1–24 characters.`);
        if (row.description.trim() && !validText(row.description, 72))
          listErrors.push(
            `${label}: description must be at most 72 characters with no null characters.`,
          );
      });
    });
  }
  const valid =
    supported &&
    (type === 'list'
      ? !listErrors.length
      : type === 'interactive'
        ? validText(text, 1024) &&
          buttons.length > 0 &&
          buttons.length <= 3 &&
          buttons.every((title) => validText(title, 20)) &&
          new Set(buttons.map((title) => title.trim())).size === buttons.length
        : !!mediaId || /^https:\/\//.test(link));
  const listContent = {
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text },
      action: {
        button: listButton.trim(),
        sections: sections.map((section) => ({
          ...(section.title.trim() ? { title: section.title.trim() } : {}),
          rows: section.rows.map((row) => ({
            id: row.id.trim(),
            title: row.title.trim(),
            ...(row.description.trim() ? { description: row.description.trim() } : {}),
          })),
        })),
      },
    },
  };
  function updateSection(index: number, work: (section: ListSection) => ListSection) {
    edit(() =>
      setSections((current) =>
        current.map((section, position) => (position === index ? work(section) : section)),
      ),
    );
  }
  function apply() {
    if (!valid) return;
    onChange(
      type === 'list'
        ? listContent
        : type === 'interactive'
          ? {
              type,
              interactive: {
                type: 'button',
                body: { text },
                action: {
                  buttons: buttons.map((title, index) => ({
                    type: 'reply',
                    reply: { id: `reply-${index + 1}`, title: title.trim() },
                  })),
                },
              },
            }
          : {
              type,
              [type]: {
                ...(mediaId ? { id: mediaId } : { link }),
                ...(type !== 'audio' && text ? { caption: text } : {}),
                ...(type === 'document' && filename ? { filename } : {}),
              },
            },
    );
  }
  if (!media && !interactive)
    return <Notice>This account does not support media or interactive messages.</Notice>;
  return (
    <div className="space-y-3">
      <Field label="Content type">
        <select
          className={inputClass}
          value={type}
          onChange={(event) =>
            edit(() => {
              setType(event.target.value);
              setMediaId('');
              setLink('');
              setUploadError('');
            })
          }
        >
          {media &&
            ['image', 'video', 'audio', 'document'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          {interactive && <option value="interactive">Reply buttons</option>}
          {interactive && <option value="list">Interactive list</option>}
        </select>
      </Field>
      {!isInteractive && supported && (
        <>
          <Field label="Upload media to WhatsApp" hint="Supported WhatsApp media formats; this uploader limits all files to 16 MB. Images are limited to 5 MB.">
            <input
              type="file"
              className={inputClass}
              accept={mediaAccept[type as keyof typeof mediaAccept] ?? ''}
              disabled={!onUpload || uploading}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file || !onUpload) return;
                const mediaType = (['image', 'video', 'audio', 'document'] as const).find(
                  (candidate) => candidate === type,
                );
                if (!mediaType) return;
                setUploading(true);
                setUploadError('');
                try {
                  const id = await onUpload(file, mediaType);
                  setMediaId(id);
                  setLink('');
                  onChange(null);
                } catch {
                  setUploadError('Upload failed. Check the file format and connected WhatsApp account, then try again.');
                } finally {
                  setUploading(false);
                  event.target.value = '';
                }
              }}
            />
          </Field>
          {uploading && <p className="text-xs text-muted-foreground">Uploading to WhatsApp…</p>}
          {mediaId && <p className="text-xs text-emerald-700">Media uploaded and ready to send.</p>}
          {uploadError && <Notice>{uploadError}</Notice>}
          <Field
            label="Or use a public HTTPS media URL"
            hint="WhatsApp fetches this URL directly."
          >
            <input
              type="url"
              className={inputClass}
              value={link}
              onChange={(event) => edit(() => { setLink(event.target.value); setMediaId(''); })}
            />
          </Field>
        </>
      )}
      {type !== 'audio' && (
        <Field label={isInteractive ? 'Message' : 'Caption (optional)'}>
          <textarea
            className={inputClass}
            maxLength={1024}
            rows={2}
            value={text}
            onChange={(event) => edit(() => setText(event.target.value))}
          />
        </Field>
      )}
      {type === 'document' && (
        <Field label="Filename (optional)">
          <input
            className={inputClass}
            maxLength={255}
            value={filename}
            onChange={(event) => edit(() => setFilename(event.target.value))}
          />
        </Field>
      )}
      {type === 'interactive' && (
        <>
          {buttons.map((title, index) => (
            <Field key={index} label={`Button ${index + 1}`}>
              <input
                className={inputClass}
                maxLength={20}
                value={title}
                onChange={(event) =>
                  edit(() =>
                    setButtons((current) =>
                      current.map((value, position) =>
                        position === index ? event.target.value : value,
                      ),
                    ),
                  )
                }
              />
            </Field>
          ))}
          <button
            className={secondaryClass}
            disabled={buttons.length >= 3}
            onClick={() => edit(() => setButtons((current) => [...current, '']))}
          >
            Add button
          </button>
        </>
      )}
      {type === 'list' && interactive && (
        <>
          <Field label="List button" hint="Opens the list; at most 20 characters.">
            <input
              className={inputClass}
              maxLength={20}
              value={listButton}
              onChange={(event) => edit(() => setListButton(event.target.value))}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            {rows.length}/10 rows across {sections.length}/10 sections. Customers select one row;
            its ID is returned with their reply.
          </p>
          {sections.map((section, sectionIndex) => (
            <fieldset key={sectionIndex} className="space-y-3 rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-medium">Section {sectionIndex + 1}</legend>
              <Field label={sections.length > 1 ? 'Section title' : 'Section title (optional)'}>
                <input
                  className={inputClass}
                  maxLength={24}
                  value={section.title}
                  onChange={(event) =>
                    updateSection(sectionIndex, (current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </Field>
              {section.rows.map((row, rowIndex) => (
                <fieldset key={rowIndex} className="space-y-2 rounded-lg border border-border p-3">
                  <legend className="px-1 text-sm">Row {rowIndex + 1}</legend>
                  {(['id', 'title', 'description'] as const).map((key) => (
                    <Field
                      key={key}
                      label={
                        key === 'id'
                          ? 'Reply ID'
                          : key === 'title'
                            ? 'Row title'
                            : 'Description (optional)'
                      }
                      hint={
                        key === 'id'
                          ? 'Unique across this list. Keep this ID stable if workflows use it.'
                          : undefined
                      }
                    >
                      <input
                        className={inputClass}
                        maxLength={key === 'id' ? 200 : key === 'title' ? 24 : 72}
                        value={row[key]}
                        onChange={(event) =>
                          updateSection(sectionIndex, (current) => ({
                            ...current,
                            rows: current.rows.map((value, index) =>
                              index === rowIndex ? { ...value, [key]: event.target.value } : value,
                            ),
                          }))
                        }
                      />
                    </Field>
                  ))}
                  <button
                    type="button"
                    className={secondaryClass}
                    disabled={section.rows.length === 1}
                    onClick={() =>
                      updateSection(sectionIndex, (current) => ({
                        ...current,
                        rows: current.rows.filter((_value, index) => index !== rowIndex),
                      }))
                    }
                  >
                    Remove row
                  </button>
                </fieldset>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={secondaryClass}
                  disabled={rows.length >= 10}
                  onClick={() =>
                    updateSection(sectionIndex, (current) => ({
                      ...current,
                      rows: [
                        ...current.rows,
                        { id: crypto.randomUUID(), title: '', description: '' },
                      ],
                    }))
                  }
                >
                  Add row
                </button>
                <button
                  type="button"
                  className={secondaryClass}
                  disabled={sections.length === 1}
                  onClick={() =>
                    edit(() =>
                      setSections((current) =>
                        current.filter((_value, index) => index !== sectionIndex),
                      ),
                    )
                  }
                >
                  Remove section
                </button>
              </div>
            </fieldset>
          ))}
          <button
            type="button"
            className={secondaryClass}
            disabled={sections.length >= 10 || rows.length >= 10}
            onClick={() =>
              edit(() =>
                setSections((current) => [
                  ...current,
                  { title: '', rows: [{ id: crypto.randomUUID(), title: '', description: '' }] },
                ]),
              )
            }
          >
            Add section
          </button>
          {listErrors.length > 0 && (
            <Notice error>
              <ul className="space-y-1">
                {listErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </Notice>
          )}
          <div
            className="space-y-2 rounded-lg border border-border p-3"
            aria-label="List content review"
          >
            <h3 className="text-sm font-medium">Review list content</h3>
            <p className="whitespace-pre-wrap break-words text-sm">
              {listContent.interactive.body.text || 'Message is empty'}
            </p>
            <p className="whitespace-pre-wrap break-words text-sm">
              List button: {listContent.interactive.action.button || 'Label is empty'}
            </p>
            {listContent.interactive.action.sections.map((section, index) => (
              <div key={index} className="space-y-1">
                {section.title && (
                  <p className="whitespace-pre-wrap break-words text-sm font-medium">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-2">
                  {section.rows.map((row, rowIndex) => (
                    <li key={rowIndex} className="break-words text-sm">
                      <p className="whitespace-pre-wrap">{row.title || 'Row title is empty'}</p>
                      {row.description && (
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {row.description}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                        Reply ID: {row.id || 'ID is empty'}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
      <button className={secondaryClass} disabled={!valid} onClick={apply}>
        Use this content
      </button>
      <Notice>
        Media, reply buttons and lists require an open customer-service window. Review the message
        before sending.
      </Notice>
    </div>
  );
}
