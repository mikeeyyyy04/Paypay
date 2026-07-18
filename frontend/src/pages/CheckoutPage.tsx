import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../api';
import type { CartItem } from '../types';

type CheckoutPageProps = {
  cartItems: CartItem[];
  onRemoveItem: (classId: number) => void;
  onClearCart: () => void;
};

export function CheckoutPage({ cartItems, onRemoveItem, onClearCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const serviceFee = subtotal * 0.03;
  const total = subtotal + serviceFee;

  async function submitCheckout(event: FormEvent) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError('Add at least one class before checkout.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await publicApi.checkoutBankTransfer({
        customerName,
        email,
        items: cartItems.map((item) => ({ classId: item.classId })),
      });

      onClearCart();
      navigate(`/checkout/${response.orderId}`);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="storefront-page">
      <header className="storefront-header">
        <div>
          <p className="eyebrow">Checkout</p>
          <h2>Cart and bank transfer</h2>
          <p className="muted">Review selected classes, then create a bank transfer payment session.</p>
        </div>
        <Link className="button button-secondary small-button" to="/classes">
          Add more classes
        </Link>
      </header>

      <div className="checkout-grid">
        <section className="storefront-panel">
          <h3>Cart</h3>
          {cartItems.length === 0 ? <p className="muted">Your cart is empty.</p> : null}
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.classId}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted small-text">{item.schedule}</p>
                </div>
                <div className="cart-right">
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <button className="text-button danger" type="button" onClick={() => onRemoveItem(item.classId)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="checkout-summary">
            <p>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </p>
            <p>
              <span>Gateway fee</span>
              <strong>${serviceFee.toFixed(2)}</strong>
            </p>
            <p className="checkout-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </p>
          </div>
        </section>

        <section className="storefront-panel">
          <h3>Customer details</h3>
          <form className="form-grid checkout-form" onSubmit={submitCheckout}>
            <label className="span-full">
              Full name
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
            </label>
            <label className="span-full">
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </label>

            {error ? <p className="error span-full">{error}</p> : null}

            <div className="form-actions span-full">
              <button className="button" type="submit" disabled={submitting || cartItems.length === 0}>
                {submitting ? 'Creating payment session...' : 'Checkout with bank transfer'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}
