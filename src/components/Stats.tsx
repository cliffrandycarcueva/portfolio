import { statistics } from '../data';
export function Stats() {
  return (
    <div className="stats grid grid-cols-[.9fr_.9fr_1fr_1.2fr] border-t border-b border-line px-0 py-7.5 max-mobile:grid-cols-[1fr_1fr] max-mobile:gap-y-[25px] max-mobile:px-0 max-mobile:py-[25px]">
      {statistics.map((stat) => (
        <div key={stat.label}>
          <strong>
            {stat.value}
            {stat.suffix && <span>{stat.suffix}</span>}
          </strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
