import { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { AppShell } from './layouts/AppShell';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PayPalReturnPage } from './pages/PayPalReturnPage';
import { PublicClassesPage } from './pages/PublicClassesPage';
import { PublicHomePage } from './pages/PublicHomePage';
import type { CartItem } from './types';

export default function App() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  function addToCart(cartItem: CartItem) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.classId === cartItem.classId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.classId === cartItem.classId
            ? { ...item, quantity: item.quantity + cartItem.quantity }
            : item,
        );
      }

      return [...currentItems, cartItem];
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
        <Route
  path="/"
  element={<PublicHomePage cartCount={cartCount} />}
/>

<Route
  path="/classes"
  element={<PublicClassesPage />}
/>
        <Route
          path="/course/:id"
          element={<CourseDetailsPage cartCount={cartCount} onAddToCart={addToCart} />}
        />
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
        <Route path="/checkout/paypal-return" element={<PayPalReturnPage />} />
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
