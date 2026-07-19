import { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { AppShell } from './layouts/AppShell';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicClassesPage } from './pages/PublicClassesPage';
import { PublicHomePage } from './pages/PublicHomePage';
import type { CartItem, PublicClass } from './types';

export default function App() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  function addToCart(classItem: PublicClass) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.classId === classItem.id);

      if (existingItem) {
        return currentItems;
      }

      return [
        ...currentItems,
        {
          classId: classItem.id,
          title: classItem.title,
          instructor: classItem.instructor,
          schedule: classItem.schedule,
          price: classItem.price,
          quantity: 1,
        },
      ];
    });
  }

  function removeCartItem(classId: string) {
    setCartItems((currentItems) => currentItems.filter((item) => item.classId !== classId));
  }

  const isPublicRoute = !location.pathname.startsWith('/admin');

  return (
    <>
      {isPublicRoute ? (
        <>
          <Navbar />
          <div className="public-nav-offset" aria-hidden="true" />
        </>
      ) : null}

      <Routes>
        <Route path="/" element={<PublicHomePage cartCount={cartCount} onAddToCart={addToCart} />} />
        <Route path="/classes" element={<PublicClassesPage cartCount={cartCount} onAddToCart={addToCart} />} />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cartItems={cartItems}
              onRemoveItem={removeCartItem}
              onClearCart={() => setCartItems([])}
            />
          }
        />
        <Route path="/checkout/:orderId" element={<CheckoutSuccessPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/*" element={<AppShell />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
