import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import type { CartItem, ManualPaymentMethod } from '../types';

type CheckoutPageProps = {
  cartItems: CartItem[];
  onRemoveItem: (classId: string) => void;
  onClearCart: () => void;
};

export function CheckoutPage({ cartItems, onRemoveItem, onClearCart }: CheckoutPageProps) {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<ManualPaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod['code']>('gcash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const total = subtotal;
  const selectedPaymentMethod = paymentMethods.find((method) => method.code === paymentMethod);

  useEffect(() => {
    let mounted = true;

    async function loadPaymentMethods() {
      try {
        const response = await publicApi.listPaymentMethods();
        if (mounted) {
          setPaymentMethods(response.paymentMethods);
          setPaymentMethod('gcash');
        }
      } catch (apiError) {
        if (mounted) {
          setError(apiError instanceof Error ? apiError.message : 'Could not load payment methods.');
        }
      }
    }

    loadPaymentMethods();

    return () => {
      mounted = false;
    };
  }, []);

  async function submitCheckout(event: FormEvent) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError('Add at least one class before checkout.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await publicApi.checkoutManual({
        customerName,
        email,
        paymentMethod,
        items: cartItems.map((item) => ({ classId: item.classId })),
      });

      onClearCart();
      window.location.assign(response.checkoutUrl);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const paymentMethodLabel = paymentMethod === 'gcash' ? 'GCash' : 'Bank transfer';
  const isBankTransfer = paymentMethod === 'bank_transfer';

  return (
    <section className="storefront-page">
      <header className="storefront-header">
        <div>
          <p className="eyebrow">Checkout</p>
          <h2>Cart and {paymentMethodLabel}</h2>
          <p className="muted">Review selected classes, then complete your payment using {paymentMethodLabel}.</p>
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
                  <span>PHP {(item.price * item.quantity).toFixed(2)}</span>
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
              <strong>PHP {subtotal.toFixed(2)}</strong>
            </p>
            <p className="checkout-total">
              <span>Total</span>
              <strong>PHP {total.toFixed(2)}</strong>
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
            <fieldset className="payment-method-field span-full">
              <legend>Payment method</legend>
              <div className="payment-options">
                {paymentMethods.map((method) => (
                  <label key={method.code} className={paymentMethod === method.code ? 'active' : ''}>
                    <input
                      checked={paymentMethod === method.code}
                      name="payment-method"
                      onChange={() => setPaymentMethod(method.code)}
                      type="radio"
                      value={method.code}
                    />
                    <span>{method.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {selectedPaymentMethod ? (
              <div className="payment-instructions span-full">
                <strong>{selectedPaymentMethod.name} payment details</strong>
                {selectedPaymentMethod.qrImageUrl && !isBankTransfer ? (
                  <img
                    className="payment-qr"
                    src={selectedPaymentMethod.qrImageUrl}
                    alt={`${selectedPaymentMethod.name} QR code for ${selectedPaymentMethod.accountName}`}
                  />
                ) : null}
                <dl className="detail-list">
                  {selectedPaymentMethod.bankName ? (
                    <div>
                      <dt>Bank</dt>
                      <dd>{selectedPaymentMethod.bankName}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Account name</dt>
                    <dd>{selectedPaymentMethod.accountName}</dd>
                  </div>
                  <div>
                    <dt>Account number</dt>
                    <dd>{selectedPaymentMethod.accountNumber}</dd>
                  </div>
                </dl>
                <p className="muted small-text">{selectedPaymentMethod.instructions}</p>
              </div>
            ) : null}

            {error ? <p className="error span-full">{error}</p> : null}

            <div className="form-actions span-full">
              <button className="button" type="submit" disabled={submitting || cartItems.length === 0}>
                {submitting
                  ? `Creating ${paymentMethodLabel} order...`
                  : `Continue to ${paymentMethodLabel} details`}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}
