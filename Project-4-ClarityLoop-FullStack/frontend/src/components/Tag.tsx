import { Hash } from 'lucide-react';

export function Tag({ label }: { label: string }) {
  return (
    <span className="chip">
      <Hash size={10} className="opacity-60" />
      {label}
    </span>
  );
}
