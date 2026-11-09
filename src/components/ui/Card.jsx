export default function Card({ as: Tag = 'div', highlight = false, flush = false, className = '', children, ...props }) {
  const clases = ['card', highlight && 'card--highlight', flush && 'card--flush', className].filter(Boolean).join(' ');
  return (
    <Tag className={clases} {...props}>
      {children}
    </Tag>
  );
}
