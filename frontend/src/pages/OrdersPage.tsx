import { useMemo, useState } from 'react';
import { Panel, StatusBadge } from '../components/ui';
import type { OrderItem, PaymentStatus, VerificationValues } from '../types';

type OrdersPageProps = {
  orders: OrderItem[];
  onVerifyOrder: (orderId: string, values: VerificationValues) => void;
};

export function OrdersPage({ orders, onVerifyOrder }: OrdersPageProps) {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [query, setQuery] = useState('');
  const statusCounts = useMemo(
    () => ({
      All: orders.length,
      Pending: orders.filter((order) => order.status === 'Pending').length,
      Reviewing: orders.filter((order) => order.status === 'Reviewing').length,
      Paid: orders.filter((order) => order.status === 'Paid').length,
      Rejected: orders.filter((order) => order.status === 'Rejected').length,
    }),
    [orders],
  );
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [order.id, order.customer, order.email, order.classTitle, order.reference, order.bankName]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Payments</p>
          <h2>Registration</h2>
          <p className="muted">Review GCash and bank transfer details, then approve or reject registrations.</p>
        </div>
      </header>

      <div className="order-command-bar">
        <label className="order-search">
          <span>Search orders</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Customer, order ID, reference, class"
          />
        </label>
        <div className="status-tabs" aria-label="Filter orders by status">
          {(['All', 'Pending', 'Reviewing', 'Paid', 'Rejected'] as const).map((status) => (
            <button
              className={statusFilter === status ? 'active' : ''}
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              <span>{status}</span>
              <strong>{statusCounts[status]}</strong>
            </button>
          ))}
        </div>
      </div>

      <Panel title="Payment verification" subtitle={`${filteredOrders.length} matching order${filteredOrders.length === 1 ? '' : 's'}.`}>
        <OrderVerificationList orders={filteredOrders} onVerifyOrder={onVerifyOrder} emptyMessage="No orders match the current filters." />
      </Panel>
    </section>
  );
}

export function OrderVerificationList({
  orders,
  onVerifyOrder,
  compact = false,
  emptyMessage = 'No orders to show.',
}: {
  orders: OrderItem[];
  onVerifyOrder: (orderId: string, values: VerificationValues) => void;
  compact?: boolean;
  emptyMessage?: string;
}) {
  if (!orders.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className={compact ? 'order-grid order-grid-compact' : 'order-grid'}>
      {orders.map((order) => (
        <OrderVerificationCard key={order.id} order={order} onVerifyOrder={onVerifyOrder} compact={compact} />
      ))}
    </div>
  );
}

function OrderVerificationCard({
  order,
  onVerifyOrder,
  compact,
}: {
  order: OrderItem;
  onVerifyOrder: (orderId: string, values: VerificationValues) => void;
  compact: boolean;
}) {
  const [status, setStatus] = useState<PaymentStatus>(order.status);
  const hasChanges = status !== order.status;

  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <strong>{order.id}</strong>
          <p className="muted small-text">{order.customer}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-amount-row">
        <div>
          <span className="muted small-text">Amount</span>
          <strong>USD {order.amount.toFixed(2)}</strong>
        </div>
        <div>
          <span className="muted small-text">Reference</span>
          <strong>{order.reference}</strong>
        </div>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Class</dt>
          <dd>{order.classTitle}</dd>
        </div>
        {!compact ? (
          <>
            <div>
              <dt>Bank</dt>
              <dd>{order.bankName}</dd>
            </div>
            <div>
              <dt>Transfer date</dt>
              <dd>{order.transferDate}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{order.email}</dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>{order.paymentMethod}</dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{order.notes}</dd>
            </div>
          </>
        ) : null}
      </dl>

      <form
        className="verification-form"
        onSubmit={(event) => {
          event.preventDefault();
          onVerifyOrder(order.id, { status, notes: order.notes });
        }}
      >
        <label className="status-select-label">
          Update status
          <select value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus)}>
            {(['Pending', 'Reviewing', 'Paid', 'Rejected'] as const).map((paymentStatus) => (
              <option key={paymentStatus} value={paymentStatus}>
                {paymentStatus}
              </option>
            ))}
          </select>
        </label>
        {order.verifiedBy ? (
          <p className="muted small-text">
            Verified by {order.verifiedBy} on {order.verifiedAt}
            {order.enrollmentApproved ? ' · Enrollment approved' : ''}
          </p>
        ) : null}
        <button className="button small-button" type="submit" disabled={!hasChanges}>
          {hasChanges ? 'Save verification' : 'Saved'}
        </button>
      </form>
    </article>
  );
}
