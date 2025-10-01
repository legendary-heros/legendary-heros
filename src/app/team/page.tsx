'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new teams page
    router.replace('/teams');
  }, [router]);

  return null;
}

