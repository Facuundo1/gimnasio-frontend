import Card from './Card';

// tone: accent | success | warning | default
export default function StatCard({ label, value, unit, hint, tone = 'default' }) {
  return (
    <Card className="stat">
      <p className="stat__label">{label}</p>
      <p className={`stat__value stat__value--${tone}`}>
        {value}
        {unit && <span className="stat__unit">{unit}</span>}
      </p>
      {hint && <p className="stat__hint">{hint}</p>}
    </Card>
  );
}
