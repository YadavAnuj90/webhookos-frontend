'use client';

/** Shimmer shimmer shimmer — uses .skel from globals.css */

export function SkeletonText({
  width = '100%', height = 13, style = {},
}: { width?: string | number; height?: number; style?: React.CSSProperties }) {
  return (
    <div
      className="skel"
      style={{ height, width, borderRadius: 5, ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="skel" style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <SkeletonText width="55%" height={11} style={{ marginBottom: 6 }} />
          <SkeletonText width="70%" height={22} />
        </div>
      </div>
      <SkeletonText width="45%" height={10} />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  const widths = ['65%', '45%', '30%', '50%', '20%'];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skel" style={{ height: 13, borderRadius: 5, width: widths[i % widths.length] }} />
          {i === 0 && (
            <div className="skel" style={{ height: 9, borderRadius: 4, width: '35%', marginTop: 5 }} />
          )}
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({
  rows = 6, cols = 5,
}: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </tbody>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="ph" style={{ marginBottom: 24 }}>
      <div className="ph-left">
        <SkeletonText width={180} height={26} style={{ marginBottom: 8 }} />
        <SkeletonText width={240} height={12} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skel" style={{ width: 120, height: 36, borderRadius: 9 }} />
        <div className="skel" style={{ width: 120, height: 36, borderRadius: 9 }} />
      </div>
    </div>
  );
}

export function SkeletonDetailPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      <SkeletonText width="60%" height={18} />
      <SkeletonText width="40%" height={11} />
      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
      <SkeletonText width="100%" height={120} style={{ borderRadius: 8 }} />
      <SkeletonText width="80%" height={11} />
      <SkeletonText width="90%" height={11} />
      <SkeletonText width="70%" height={11} />
    </div>
  );
}
