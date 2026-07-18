import { useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { initialClasses, initialOrders } from '../data/initialData';
import { ClassesPage } from '../pages/ClassesPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/OrdersPage';
import type { ClassFormValues, ClassItem, ClassStatus, OrderItem, VerificationValues } from '../types';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isCatalogRoute = location.pathname === '/admin/classes';
  const shellClassName = `${isCatalogRoute ? 'app-shell catalog-shell' : 'app-shell workspace-shell'}${
    isSidebarCollapsed ? ' sidebar-collapsed' : ''
  }`;

  const stats = useMemo(
    () => ({
      pendingPayments: orders.filter((order) => order.status === 'Pending' || order.status === 'Reviewing').length,
      activeClasses: classes.filter((classItem) => classItem.status === 'Active').length,
      fullClasses: classes.filter((classItem) => classItem.status === 'Full').length,
      revenue: orders.filter((order) => order.status === 'Paid').reduce((total, order) => total + order.amount, 0),
    }),
    [classes, orders],
  );

  function saveClass(values: ClassFormValues, classId?: number) {
    if (classId) {
      setClasses((currentClasses) =>
        currentClasses.map((classItem) =>
          classItem.id === classId
            ? {
                ...classItem,
                ...values,
                enrolled: Math.min(values.enrolled ?? classItem.enrolled, values.capacity),
              }
            : classItem,
        ),
      );
      return;
    }

    setClasses((currentClasses) => [
      {
        ...values,
        id: Math.max(0, ...currentClasses.map((classItem) => classItem.id)) + 1,
        enrolled: values.enrolled ?? 0,
      },
      ...currentClasses,
    ]);
  }

  function updateClassStatus(classId: number, status: ClassStatus) {
    setClasses((currentClasses) =>
      currentClasses.map((classItem) => (classItem.id === classId ? { ...classItem, status } : classItem)),
    );
  }

  function verifyOrder(orderId: string, values: VerificationValues) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: values.status,
              notes: values.notes,
              verifiedBy: values.status === 'Paid' || values.status === 'Rejected' ? user?.name ?? user?.email : order.verifiedBy,
              verifiedAt: values.status === 'Paid' || values.status === 'Rejected' ? new Date().toISOString().slice(0, 10) : order.verifiedAt,
            }
          : order,
      ),
    );
  }

  return (
    <div className={shellClassName}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <p className="eyebrow">Paypay Admin</p>
            <h1>Operations</h1>
          </div>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isSidebarCollapsed}
            onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
          >
            {isSidebarCollapsed ? '>' : '<'}
          </button>
        </div>

        <div className="sidebar-copy-wrap">
          <p className="muted sidebar-copy">Manage classes, orders, and bank-transfer reviews from one place.</p>
        </div>

        <nav className="nav">
          <NavLink to="/admin" end aria-label="Dashboard">
            <span className="nav-short">D</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/classes" aria-label="Classes">
            <span className="nav-short">C</span>
            <span className="nav-label">Classes</span>
          </NavLink>
          <NavLink to="/admin/orders" aria-label="Orders">
            <span className="nav-short">O</span>
            <span className="nav-label">Orders</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <p className="muted">Signed in as</p>
            <strong>{user?.email}</strong>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route
            index
            element={<DashboardPage classes={classes} orders={orders} stats={stats} onVerifyOrder={verifyOrder} />}
          />
          <Route
            path="classes"
            element={
              <ClassesPage
                classes={classes}
                onSaveClass={saveClass}
                onDeleteClass={(classId) => setClasses((currentClasses) => currentClasses.filter((classItem) => classItem.id !== classId))}
                onActivateClass={(classId) => updateClassStatus(classId, 'Active')}
                onArchiveClass={(classId) => updateClassStatus(classId, 'Archived')}
              />
            }
          />
          <Route path="orders" element={<OrdersPage orders={orders} onVerifyOrder={verifyOrder} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
