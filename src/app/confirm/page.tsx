import { Suspense } from 'react';
import ConfirmClient from './ConfirmClient';

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