'use client';
export default function Spinner({ size = 16 }: { size?: number }) {
  return <div className="spin" style={{ width: size, height: size }} />;
}
