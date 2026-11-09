export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  type = 'button',
  className = '',
  children,
  disabled,
  ...props
}) {
  const clases = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={clases} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? 'Procesando…' : children}
    </button>
  );
}
