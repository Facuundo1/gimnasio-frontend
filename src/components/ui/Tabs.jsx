// items: [{ value, label, count? }]
export default function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`tab${item.value === value ? ' tab--active' : ''}`}
          aria-pressed={item.value === value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count != null && <span className="tab__count">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
