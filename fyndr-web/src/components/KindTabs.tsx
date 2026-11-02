import { formatCount } from '../lib/format';
import type { Kind } from '../types';

export type KindFilter = Kind | 'all';

const TABS: readonly { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'job', label: 'Jobs' },
  { value: 'internship', label: 'Internships' },
  { value: 'course', label: 'Courses' },
];

interface Props {
  value: KindFilter;
  counts: Record<Kind, number>;
  onChange: (value: KindFilter) => void;
}

export function KindTabs({ value, counts, onChange }: Props) {
  const total = counts.job + counts.internship + counts.course;
  return (
    <div className="tabs" role="group" aria-label="Show">
      {TABS.map(t => (
        <button
          key={t.value}
          type="button"
          className="tab"
          data-kind={t.value}
          aria-pressed={value === t.value}
          onClick={() => onChange(t.value)}
        >
          {t.label}
          <span className="tab__count">{formatCount(t.value === 'all' ? total : counts[t.value])}</span>
        </button>
      ))}
    </div>
  );
}
