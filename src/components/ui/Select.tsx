'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  dot?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
  style?: React.CSSProperties;
}

export default function Select({ options, value, onChange, placeholder, width = 160, style }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const label = selected?.label || placeholder || 'Select...';

  const close = useCallback(() => { setOpen(false); setFocusIdx(-1); }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, options.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' && focusIdx >= 0) { e.preventDefault(); onChange(options[focusIdx].value); close(); }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, focusIdx, options, onChange, close]);

  useEffect(() => {
    if (focusIdx >= 0 && listRef.current) {
      const el = listRef.current.children[focusIdx] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusIdx]);

  return (
    <div ref={ref} style={{ position: 'relative', width, ...style }}>
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) { const idx = options.findIndex(o => o.value === value); setFocusIdx(idx >= 0 ? idx : 0); } }}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: 'var(--bg2)',
          border: `1px solid ${open ? 'var(--a)' : 'var(--b2)'}`,
          borderRadius: 'var(--r2)',
          color: selected ? 'var(--t1)' : 'var(--t3)',
          fontFamily: 'var(--sans)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(91,108,248,.12)' : 'none',
        }}
      >
        {selected?.dot && (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: selected.dot, flexShrink: 0,
          }} />
        )}
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <ChevronDown
          size={14}
          style={{
            flexShrink: 0,
            color: 'var(--t3)',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: 140,
            maxHeight: 240,
            overflowY: 'auto',
            background: 'var(--bg2)',
            border: '1px solid var(--b2)',
            borderRadius: 'var(--r2)',
            boxShadow: 'var(--s2), 0 0 0 1px var(--b1)',
            zIndex: 999,
            padding: 4,
            animation: 'selectSlideIn 0.15s ease',
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = i === focusIdx;
            return (
              <div
                key={opt.value + i}
                onClick={() => { onChange(opt.value); close(); }}
                onMouseEnter={() => setFocusIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  color: isSelected ? 'var(--a)' : 'var(--t1)',
                  background: isFocused ? 'var(--abg)' : 'transparent',
                  fontFamily: 'var(--sans)',
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.1s, color 0.1s',
                }}
              >
                {opt.dot && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: opt.dot, flexShrink: 0,
                  }} />
                )}
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--a)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
