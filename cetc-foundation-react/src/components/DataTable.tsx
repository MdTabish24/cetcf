import type { TableSpec } from '../data/siteContent';

type DataTableProps = {
  title: string;
  subtitle?: string;
  table: TableSpec;
};

function DataTable({ title, subtitle, table }: DataTableProps) {
  return (
    <article className="table-card">
      <div className="table-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default DataTable;
