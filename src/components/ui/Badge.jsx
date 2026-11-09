// tone: success | warning | danger | accent | neutral
export default function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
