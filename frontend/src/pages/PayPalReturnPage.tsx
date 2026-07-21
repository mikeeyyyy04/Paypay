import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { publicApi } from '../api';

export function PayPalReturnPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function capturePayment() {
      const token = searchParams.get('token') ?? searchParams.get('paypalOrderId');
      const orderNumber = searchParams.get('orderNumber');

      if (!token) {
        setError('PayPal token is missing from the callback URL.');
        setLoading(false);
        return;
      }

      try {
        const response = await publicApi.capturePaypalOrder({ paypalOrderId: token });

        if (!response.success) {
          setError(response.message ?? 'PayPal capture failed.');
          setLoading(false);
          return;
        }

        const targetOrderId = orderNumber ?? response.orderNumber;

        if (!targetOrderId) {
          setError('Could not determine order number for the success page.');
          setLoading(false);
          return;
        }

        navigate(`/checkout/${encodeURIComponent(targetOrderId)}`);
      } catch (captureError) {
        setError(captureError instanceof Error ? captureError.message : 'Unable to capture PayPal order.');
        setLoading(false);
      }
    }

    capturePayment();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <section className="storefront-page">
        <p className="muted">Finalizing your PayPal payment. Please wait...</p>
      </section>
    );
  }

  return (
    <section className="storefront-page">
      <div className="storefront-panel">
        <h2>PayPal return</h2>
        <p className="error">{error}</p>
        <p className="muted">If this page does not redirect automatically, please use the button below.</p>
        <button className="button" type="button" onClick={() => navigate('/checkout')}>
          Back to checkout
        </button>
      </div>
    </section>
  );
}
