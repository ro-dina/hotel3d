import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ConfirmClient = dynamic(() => import('./ConfirmClient'), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="bg-gray-100 min-h-screen">
          <div className="max-w-xl mx-auto p-6">
            <p>Loading...</p>
          </div>
        </main>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}