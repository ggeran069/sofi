import Link from "next/link";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  actions?: {
    edit?: { href: (row: T) => string };
    delete?: { onClick: (row: T) => void };
  };
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  actions,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="text-[13px] text-[var(--color-secondary)]">
        No data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 pr-4 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="text-left py-3 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--color-surface-dim)] hover:bg-[var(--color-surface)]"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 pr-4">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {actions && (
                <td className="py-3 flex gap-3">
                  {actions.edit && (
                    <Link
                      href={actions.edit.href(row)}
                      className="text-[11px] tracking-[0.05em] uppercase font-semibold hover:underline"
                    >
                      Edit
                    </Link>
                  )}
                  {actions.delete && (
                    <button
                      onClick={() => actions.delete!.onClick(row)}
                      className="text-[11px] tracking-[0.05em] uppercase font-semibold text-[var(--color-error)] hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
