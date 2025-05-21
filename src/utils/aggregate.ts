import { CandleData } from '../services/api';
import { getISOWeek, getMonth, getYear } from 'date-fns';

type Granularity = 'week' | 'month' | 'year';

export function aggregate(
  data: CandleData[],
  granularity: Granularity
): { label: string; close: number }[] {
  const map = new Map<string, number>();

  data.forEach(({ time, close }) => {
    const d = new Date(time * 1000);
    let key: string;

    switch (granularity) {
      case 'week':
        key = `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2,'0')}`;
        break;
      case 'month':
        key = `${d.getFullYear()}-${String(getMonth(d)+1).padStart(2,'0')}`;
        break;
      case 'year':
      default:
        key = String(getYear(d));
    }
    map.set(key, close);
  });

  // Chuyển map → array, sort theo key:
  return Array.from(map.entries())
    .map(([label, close]) => ({ label, close }))
    .sort((a, b) => (a.label > b.label ? 1 : -1));
}