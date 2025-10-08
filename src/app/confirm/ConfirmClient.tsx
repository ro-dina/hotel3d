'use client';

import { useSearchParams } from 'next/navigation';

export default function ConfirmClient() {
  const params = useSearchParams();
  const status = params.get('status'); // 例: /confirm?status=ok

  return (
    <div>
      <h1>Confirm</h1>
      <p>Status: {status ?? 'none'}</p>
    </div>
  );
}