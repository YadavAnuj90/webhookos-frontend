'use client';
export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:'b-green', delivered:'b-green', success:'b-green',
    paused:'b-yellow', pending:'b-yellow', rate_limited:'b-yellow',
    failed:'b-red', dead:'b-red', disabled:'b-red', suspended:'b-red',
    filtered:'b-blue', inactive:'b-gray',
  };
  const cls = map[status?.toLowerCase()] || 'b-gray';
  return <span className={`badge ${cls}`}>{status?.replace(/_/g,' ') || '--'}</span>;
}
