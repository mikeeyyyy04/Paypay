import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicOrderDetail } from '../types';

export function CheckoutSuccessPage() {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<PublicOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        const response = await publicApi.getOrder(orderId);
        if (mounted) {
          setOrder(response);
        }
      } catch (apiError) {
        if (mounted) {
          setError(apiError instanceof Error ? apiError.message : 'Could not load order details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <section className="storefront-page">
        <p className="muted">Loading payment instructions...</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="storefront-page">
        <p className="error">{error || 'Order not found.'}</p>
      </section>
    );
  }

  return (
    <section className="storefront-page">
      <header className="storefront-header">
        <div>
          <p className="eyebrow">Payment created</p>
          <h2>Bank transfer instructions</h2>
          <p className="muted">Use the gateway details below to complete payment before expiration.</p>
        </div>
        <Link className="button button-secondary small-button" to="/classes">
          Back to classes
        </Link>
      </header>

      <div className="checkout-grid">
        <section className="storefront-panel">
          <h3>Order details</h3>
          <dl className="detail-list">
            <div>
              <dt>Order ID</dt>
              <dd>{order.id}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{order.reference}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{order.status}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>${order.amount.toFixed(2)}</dd>
            </div>
          </dl>

          <h4>Classes</h4>
          <ul className="cart-list">
            {order.items.map((item) => (
              <li key={item.classId}>
                <div>
                  <strong>{item.title}</strong>
                </div>
                <div className="cart-right">
                  <span>${item.price.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="storefront-panel">
          <h3>Gateway payment session</h3>
          <dl className="detail-list">
            <div>
              <dt>Gateway</dt>
              <dd>{order.payment.gateway}</dd>
            </div>
            <div>
              <dt>Bank</dt>
              <dd>{order.payment.bankName}</dd>
            </div>
            <div>
              <dt>Virtual account</dt>
              <dd>{order.payment.virtualAccountNumber}</dd>
            </div>
            <div>
              <dt>Expires at</dt>
              <dd>{new Date(order.payment.expiresAt).toLocaleString()}</dd>
            </div>
          </dl>

          <a className="button" href={order.payment.paymentUrl} target="_blank" rel="noreferrer">
            Open gateway payment page
          </a>
          <p className="muted small-text">This is a sandbox gateway URL for development and flow testing.</p>
        </section>
      </div>
    </section>
  );
}
