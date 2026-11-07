import Button from './Button';

export function Loading({ text = 'Cargando…' }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p className="muted">{text}</p>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">No se pudieron cargar los datos</p>
      <p className="muted">{error?.message ?? 'Error desconocido'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
