import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../api';
import type { PublicOrderDetail } from '../types';

export function CheckoutSuccessPage() {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<PublicOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleUploadReceipt() {
    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];

    if (!referenceNumber.trim()) {
      setUploadError('Enter your bank transaction reference number.');
      return;
    }

    if (!file) {
      setUploadError('Select a receipt image to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      await publicApi.submitReceipt(orderId, {
        referenceNumber: referenceNumber.trim(),
        receiptFile: {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        },
      });

      setUploadSuccess(true);
      setUploadError('');

      // Reload the order to get updated status
      const updatedOrder = await publicApi.getOrder(orderId);
      setOrder(updatedOrder);
    } catch (apiError) {
      setUploadError(apiError instanceof Error ? apiError.message : 'Failed to upload receipt.');
    } finally {
      setUploading(false);
    }
  }

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

  const isBankTransfer = order.payment.method?.code === 'bank_transfer';
  const paymentMethodName = order.payment.method?.name ?? order.payment.gateway;
  const alreadySubmitted = Boolean(order.receipt);
  const isUnderReview = order.status === 'Reviewing' || order.status === 'Paid';

  return (
    <section className="storefront-page">
      <header className="storefront-header">
        <div>
          <p className="eyebrow">Payment status</p>
          <h2>{paymentMethodName} payment instructions</h2>
          <p className="muted">Pay using the details below. An admin will verify your payment and approve enrollment.</p>
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
              <dd>PHP {order.amount.toFixed(2)}</dd>
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
                  <span>PHP {item.price.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="storefront-panel">
          {alreadySubmitted ? (
            <>
              <h3>Payment submitted</h3>
              <div className="payment-instructions span-full">
                <strong>Receipt received</strong>
                <p className="muted small-text">
                  Your payment reference <strong>{order.paymentReferenceNumber}</strong> has been submitted.
                </p>
                {order.receipt ? (
                  <p className="muted small-text">
                    File: {order.receipt.name} &middot; Submitted{' '}
                    {new Date(order.receipt.submittedAt).toLocaleString()}
                  </p>
                ) : null}
                <p className="muted small-text">
                  Status: <strong>{order.status}</strong>
                  {order.status === 'Pending' ? ' — awaiting admin review' : ''}
                  {order.status === 'Reviewing' ? ' — admin is reviewing your receipt' : ''}
                  {order.status === 'Paid' ? ' — payment confirmed, enrollment approved' : ''}
                  {order.status === 'Rejected' ? ' — payment was not accepted. Contact the school.' : ''}
                </p>
              </div>
            </>
          ) : (
            <>
              <h3>Where to pay</h3>
              {order.payment.method?.qrImageUrl && !isBankTransfer ? (
                <img
                  className="payment-qr"
                  src={order.payment.method.qrImageUrl}
                  alt={`${paymentMethodName} QR code for ${order.payment.method.accountName}`}
                />
              ) : null}
              <dl className="detail-list">
                <div>
                  <dt>Method</dt>
                  <dd>{paymentMethodName}</dd>
                </div>
                {order.payment.method?.bankName ? (
                  <div>
                    <dt>Bank</dt>
                    <dd>{order.payment.method.bankName}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Account name</dt>
                  <dd>{order.payment.method?.accountName ?? 'School account'}</dd>
                </div>
                <div>
                  <dt>Account number</dt>
                  <dd>{order.payment.method?.accountNumber ?? 'Contact the school for payment details.'}</dd>
                </div>
              </dl>

              <div className="payment-instructions">
                <strong>Next step</strong>
                <p className="muted small-text">
                  {order.payment.instructions ??
                    'Send the exact total and use your order ID as the payment reference when possible.'}
                </p>
                <p className="muted small-text">
                  Use reference <strong>{order.reference}</strong> so the admin can match your payment quickly.
                </p>
              </div>
            </>
          )}

          {isBankTransfer && !alreadySubmitted && !isUnderReview ? (
            <div className="receipt-upload-section">
              <h3>Upload payment receipt</h3>
              <p className="muted small-text">
                After sending the bank transfer, upload your deposit slip or screenshot here so the admin can verify your payment.
              </p>
              <div className="receipt-upload-form">
                <label className="span-full">
                  Bank transaction reference number
                  <input
                    value={referenceNumber}
                    onChange={(event) => setReferenceNumber(event.target.value)}
                    placeholder="e.g. BDO-1234567890"
                    required
                  />
                </label>
                <label className="span-full">
                  Receipt screenshot
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" />
                </label>
                {uploadError ? <p className="error span-full">{uploadError}</p> : null}
                {uploadSuccess ? (
                  <p className="landing-success span-full">Receipt submitted successfully. Admin will review it shortly.</p>
                ) : null}
                <button
                  className="button span-full"
                  type="button"
                  onClick={handleUploadReceipt}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Submit receipt'}
                </button>
              </div>
            </div>
          ) : null}

          {isBankTransfer && alreadySubmitted ? (
            <div className="receipt-upload-section">
              <h3>Receipt</h3>
              {order.receipt?.dataUrl ? (
                <img
                  className="receipt-preview"
                  src={order.receipt.dataUrl}
                  alt={`Receipt for ${order.paymentReferenceNumber}`}
                />
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
