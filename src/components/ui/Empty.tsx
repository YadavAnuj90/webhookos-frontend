'use client';
import { Package } from 'lucide-react';
export default function Empty({ title = 'Nothing here yet', sub = '', action }: { title?: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <Package size={44} />
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
