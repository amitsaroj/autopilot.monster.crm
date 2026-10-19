'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { whatsappConversationService } from '@/services/whatsapp-conversation.service';

export function MessageMediaPreview({
  messageId,
  index,
}: {
  messageId: string;
  index: number;
}) {
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    void whatsappConversationService
      .downloadMedia(messageId, index)
      .then((response) => {
        if (!active || !(response.data instanceof Blob)) return;
        objectUrl = URL.createObjectURL(response.data);
        const contentType = response.headers['content-type'];
        setMedia({ url: objectUrl, type: typeof contentType === 'string' ? contentType : response.data.type });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [index, messageId]);

  if (error) return <p className="mt-2 text-xs text-muted-foreground">Media preview unavailable.</p>;
  if (!media) return <p className="mt-2 text-xs text-muted-foreground">Loading media…</p>;
  if (media.type.startsWith('image/'))
    return (
      <Image
        className="mt-2 max-h-72 max-w-full rounded-lg object-contain"
        src={media.url}
        alt="WhatsApp attachment"
        width={640}
        height={480}
        unoptimized
      />
    );
  if (media.type.startsWith('video/'))
    return <video className="mt-2 max-h-72 max-w-full rounded-lg" src={media.url} controls preload="metadata" />;
  if (media.type.startsWith('audio/'))
    return <audio className="mt-2 max-w-full" src={media.url} controls preload="metadata" />;
  return (
    <a className="mt-2 inline-block text-primary underline" href={media.url} download="whatsapp-attachment">
      Download attachment
    </a>
  );
}
