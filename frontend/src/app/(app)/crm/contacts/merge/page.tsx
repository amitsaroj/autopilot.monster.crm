'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactMergeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/crm/duplicates');
  }, [router]);

  return null;
}
