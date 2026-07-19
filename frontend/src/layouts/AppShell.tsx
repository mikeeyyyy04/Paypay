import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { adminClassesApi, adminOrdersApi } from '../api';
import { initialClasses, initialOrders } from '../data/initialData';
import { ClassesPage } from '../pages/ClassesPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/OrdersPage';
import type { ClassFormValues, ClassItem, ClassStatus, OrderItem, VerificationValues } from '../types';

export function AppShell() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');
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

  useEffect(() => {
    let mounted = true;

    async function loadClasses() {
      if (!token) {
        setClassesLoading(false);
        return;
      }

      try {
        setClassesError('');
        const response = await adminClassesApi.list(token);
        if (mounted) {
          setClasses(response.classes);
        }
      } catch (error) {
        if (mounted) {
          setClassesError(error instanceof Error ? error.message : 'Failed to load classes from the database.');
        }
      } finally {
        if (mounted) {
          setClassesLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      if (!token) {
        return;
      }

      try {
        const response = await adminOrdersApi.list(token);
        if (mounted) {
          setOrders(response.orders);
        }
      } catch {
        // Keep seeded orders visible if the backend is unavailable.
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [token]);

  async function saveClass(values: ClassFormValues, classId?: string) {
    if (!token) {
      setClassesError('Your admin session expired. Please log in again.');
      return;
    }

    if (classId) {
      const response = await adminClassesApi.update(token, classId, values);
      setClasses((currentClasses) => currentClasses.map((classItem) => (classItem.id === classId ? response.classItem : classItem)));
      return;
    }

    const response = await adminClassesApi.create(token, values);
    setClasses((currentClasses) => [response.classItem, ...currentClasses]);
  }

  async function deleteClass(classId: string) {
    if (!token) {
      setClassesError('Your admin session expired. Please log in again.');
      return;
    }

    await adminClassesApi.delete(token, classId);
    setClasses((currentClasses) => currentClasses.filter((classItem) => classItem.id !== classId));
  }

  async function updateClassStatus(classId: string, status: ClassStatus) {
    const classItem = classes.find((candidate) => candidate.id === classId);

    if (!classItem) {
      return;
    }

    await saveClass({ ...classItem, status }, classId);
  }

  async function verifyOrder(orderId: string, values: VerificationValues) {
    if (!token) {
      return;
    }

    const response = await adminOrdersApi.update(token, orderId, values);
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? response.order : order)),
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
          <p className="muted sidebar-copy">Manage classes, registrations, and manual payment reviews from one place.</p>
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
          <NavLink to="/admin/orders" aria-label="Registration">
            <span className="nav-short">R</span>
            <span className="nav-label">Registration</span>
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
                loading={classesLoading}
                error={classesError}
                onSaveClass={saveClass}
                onDeleteClass={deleteClass}
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
