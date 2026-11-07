import { iniciales } from '../../lib/format';

export default function Avatar({ nombre, apellido, tone = 'muted', size = 'md' }) {
  return (
    <span className={`avatar avatar--${tone} avatar--${size}`} aria-hidden="true">
      {iniciales(nombre, apellido)}
    </span>
  );
}
