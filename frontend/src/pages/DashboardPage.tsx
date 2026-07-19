import { DataTable, Panel, StatCard, StatusBadge } from '../components/ui';
import { OrderVerificationList } from './OrdersPage';
import type { ClassItem, OrderItem, VerificationValues } from '../types';

type DashboardPageProps = {
  classes: ClassItem[];
  orders: OrderItem[];
  stats: {
    pendingPayments: number;
    activeClasses: number;
    fullClasses: number;
    revenue: number;
  };
  onVerifyOrder: (orderId: string, values: VerificationValues) => void;
};

export function DashboardPage({ classes, orders, stats, onVerifyOrder }: DashboardPageProps) {
  const urgentOrders = orders.filter((order) => order.status === 'Pending' || order.status === 'Reviewing').slice(0, 3);
  const recentOrders = orders.slice(0, 4);
  const topClasses = [...classes]
    .sort((firstClass, secondClass) => secondClass.enrolled / secondClass.capacity - firstClass.enrolled / firstClass.capacity)
    .slice(0, 4);
  const totalRevenue = orders.reduce((total, order) => total + order.amount, 0);
  const verifiedOrders = orders.filter((order) => order.status === 'Paid' || order.status === 'Rejected').length;
  const completionRate = orders.length ? Math.round((verifiedOrders / orders.length) * 100) : 0;
  const paidRevenueRate = totalRevenue ? Math.round((stats.revenue / totalRevenue) * 100) : 0;
  const nextOrder = urgentOrders[0];

  return (
    <section className="page">
      <header className="page-header dashboard-hero">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
          <p className="muted">Track payment verification, class status, and admin workload.</p>
        </div>
        <div className="hero-summary">
          <span>Next review</span>
          <strong>{nextOrder ? nextOrder.id : 'Clear'}</strong>
          <small>{nextOrder ? `${nextOrder.customer} - PHP ${nextOrder.amount.toFixed(2)}` : 'No pending transfers'}</small>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard label="Pending payments" value={String(stats.pendingPayments)} helper={`${completionRate}% of orders closed`} />
        <StatCard label="Active classes" value={String(stats.activeClasses)} helper={`${classes.length} total catalog items`} />
        <StatCard label="Full classes" value={String(stats.fullClasses)} helper="Capacity pressure watch" />
        <StatCard label="Paid revenue" value={`PHP ${stats.revenue.toFixed(2)}`} helper={`${paidRevenueRate}% of submitted value`} />
      </div>

      <div className="dashboard-focus-grid">
        <Panel title="Registration queue" subtitle="Newest registrations that need a verification decision.">
          <OrderVerificationList orders={urgentOrders} onVerifyOrder={onVerifyOrder} compact emptyMessage="No pending reviews." />
        </Panel>

        <Panel title="Class capacity" subtitle="A quick look at publication state and enrollment pressure.">
          <DataTable
            columns={['Class', 'Instructor', 'Enrollment', 'Status']}
            rows={topClasses.map((classItem) => (
              <tr key={classItem.id}>
                <td>
                  <strong>{classItem.title}</strong>
                  <div className="muted small-text">{classItem.category}</div>
                </td>
                <td>{classItem.instructor}</td>
                <td>
                  <div className="capacity-cell">
                    <span>
                      {classItem.enrolled}/{classItem.capacity}
                    </span>
                    <div className="capacity-track" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, Math.round((classItem.enrolled / classItem.capacity) * 100))}%` }} />
                    </div>
                  </div>
                </td>
                <td>
                  <StatusBadge status={classItem.status} />
                </td>
              </tr>
            ))}
          />
        </Panel>
      </div>

      <Panel title="Recent activity" subtitle="Latest submitted registrations across every status.">
        <div className="activity-grid">
          {recentOrders.map((order) => (
            <article className="activity-item activity-order" key={order.id}>
              <div>
                <strong>{order.id}</strong>
                <StatusBadge status={order.status} />
              </div>
              <p>{order.customer}</p>
              <small>
                {order.classTitle} - PHP {order.amount.toFixed(2)}
              </small>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}
