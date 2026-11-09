import { EmptyState } from './States';

/**
 * columns: [{ key, header, render?(row), align?: 'right' | 'center' }]
 */
export default function Table({ columns, rows, rowKey, empty = 'No hay resultados.' }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.align ? `is-${c.align}` : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} className={c.align ? `is-${c.align}` : undefined}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
