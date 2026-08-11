'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function MasterDataLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is loaded and there's a user, but they are NOT an Admin, kick them out
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  // If loading or if it's a non-admin (while the redirect is happening), show loading or nothing
  if (isLoading || (user && user.role !== 'ADMIN')) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If we reach here, user is an ADMIN
  return <>{children}</>;
}
