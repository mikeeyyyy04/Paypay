import type { ReactNode } from 'react';
import type { ClassStatus, PaymentStatus } from '../types';

export function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="panel panel-spaced">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p className="muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export function TableActions({ children }: { children: ReactNode }) {
  return <div className="table-actions">{children}</div>;
}

export function StatusBadge({ status }: { status: ClassStatus | PaymentStatus }) {
  return <span className={`status status-${status.toLowerCase().replace(' ', '-')}`}>{status}</span>;
}

export function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <article className="stat-card">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}
