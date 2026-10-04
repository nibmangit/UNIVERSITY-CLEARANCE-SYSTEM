import { cx } from './styles';

const COLUMNS = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

function isEmpty(value) {
  return value === null || value === undefined || value === '';
}


export default function DetailList({ items, columns = 2, className }) {
  return (
    <dl className={cx('grid gap-x-8 gap-y-4', COLUMNS[columns] ?? COLUMNS[2], className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm text-slate-500">{item.label}</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-900">
            {isEmpty(item.value) ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}