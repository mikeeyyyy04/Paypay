import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api';
import type {
  CartItem,
  CheckoutResponse,
  ManualPaymentMethod,
} from '../types';
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

const [checkoutResult, setCheckoutResult] =
  useState<CheckoutResponse | null>(null);
const [receiptFile, setReceiptFile] = useState<File | null>(null);
const [receiptPreview, setReceiptPreview] = useState<string>('');
const [referenceNumber, setReferenceNumber] = useState('');
const [uploadingReceipt, setUploadingReceipt] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');

const subtotal = useMemo(
  () =>
    cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),
  [cartItems],
);

const total = subtotal;

const selectedPaymentMethod =
  paymentMethods.find(
    (method) => method.code === paymentMethod,
  ) ?? null;

  useEffect(() => {
  let mounted = true;

  async function loadPaymentMethods() {
    try {
      const response = await publicApi.listPaymentMethods();

      if (mounted) {
        setPaymentMethods(response.paymentMethods);

        if (response.paymentMethods.length > 0) {
          setPaymentMethod(response.paymentMethods[0].code);
        }
      }
    } catch (apiError) {
      if (mounted) {
        setError(
          apiError instanceof Error
            ? apiError.message
            : 'Could not load payment methods.',
        );
      }
    }
  }

  loadPaymentMethods();

  return () => {
    mounted = false;
  };
}, []);

  async function submitReceipt() {
    if (!checkoutResult) {
      return;
    }

    if (!receiptFile) {
      setError('Please choose a receipt image.');
      return;
    }

    if (!referenceNumber.trim()) {
      setError('Please enter your GCash reference number.');
      return;
    }

    setUploadingReceipt(true);
    setError('');

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(receiptFile);
      });

      await publicApi.submitReceipt(checkoutResult.orderId, {
        referenceNumber,
        receiptFile: {
          name: receiptFile.name,
          type: receiptFile.type,
          size: receiptFile.size,
          dataUrl,
        },
      });

      alert('Receipt uploaded successfully. Please wait for admin verification.');
      setReceiptFile(null);
      setReceiptPreview('');
      setReferenceNumber('');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Receipt upload failed.');
    } finally {
      setUploadingReceipt(false);
    }
  }

  async function submitCheckout(event: FormEvent) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError('Add at least one class before checkout.');
      return;
    }

    setSubmitting(true);
    setError('');
    setCheckoutResult(null);

    try {
      const payload = {
        customerName,
        email,
        paymentMethod,
        items: cartItems.map((item) => ({
          classId: item.classId,
        })),
      };

      if (paymentMethod === 'paypal') {
        const response = await publicApi.checkoutPaypal({
          ...payload,
          paymentMethod: 'paypal',
        });

        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
          return;
        }

        throw new Error('PayPal checkout URL was not returned.');
      }

      const response = await publicApi.checkoutManual({
        ...payload,
        paymentMethod,
      });

      setCheckoutResult(response);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const paymentMethodLabel =
    paymentMethod === 'paypal'
      ? 'PayPal'
      : paymentMethod === 'bank_transfer'
      ? 'Bank transfer'
      : 'GCash';

  const isGcashSelected = paymentMethod === 'gcash';
  const isManualPayment = paymentMethod !== 'paypal';

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
                  <span>USD {(item.price * item.quantity).toFixed(2)}</span>
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
              <strong>USD {subtotal.toFixed(2)}</strong>
            </p>
            <p className="checkout-total">
              <span>Total</span>
              <strong>USD {total.toFixed(2)}</strong>
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
                {isGcashSelected && checkoutResult?.payment?.method?.qrImageUrl ? (
                  <img
                    className="payment-qr"
                    src={checkoutResult.payment.method.qrImageUrl}
                    alt="GCash QR Code"
                  />
                ) : null}
                <dl className="detail-list">
                  {(checkoutResult?.payment?.method?.accountName || selectedPaymentMethod.accountName) ? (
                    <div>
                      <dt>Account Name</dt>
                      <dd>
                        {checkoutResult?.payment?.method?.accountName ?? selectedPaymentMethod.accountName}
                      </dd>
                    </div>
                  ) : null}

                  {(checkoutResult?.payment?.method?.accountNumber || selectedPaymentMethod.accountNumber) ? (
                    <div>
                      <dt>Account Number</dt>
                      <dd>
                        {checkoutResult?.payment?.method?.accountNumber ?? selectedPaymentMethod.accountNumber}
                      </dd>
                    </div>
                  ) : null}

                  <div>
                    <dt>Amount</dt>
                    <dd>${checkoutResult?.amount?.toFixed(2) ?? total.toFixed(2)}</dd>
                  </div>
                </dl>

                {checkoutResult ? (
                  <div className="checkout-success">
                    <strong>Order Number</strong>
                    <p>{checkoutResult.orderId}</p>
                  </div>
                ) : null}

                {checkoutResult?.paymentMethod !== 'paypal' ? (
                  <div className="receipt-upload">
                    <h4>Upload Payment Receipt</h4>

                    <label className="span-full">
                      Reference Number
                      <input
                        value={referenceNumber}
                        onChange={(event) => setReferenceNumber(event.target.value)}
                        placeholder={
                          checkoutResult?.paymentMethod === 'bank_transfer'
                            ? 'Bank transfer reference number'
                            : 'GCash Reference Number'
                        }
                      />
                    </label>

                    <input
                      accept="image/*"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) return;

                        setReceiptFile(file);
                        setReceiptPreview(URL.createObjectURL(file));
                      }}
                    />

                    {receiptPreview && (
                      <img
                        className="receipt-preview"
                        src={receiptPreview}
                        alt="Receipt Preview"
                      />
                    )}

                    <button
                      className="button"
                      type="button"
                      disabled={uploadingReceipt || !receiptFile || !referenceNumber.trim()}
                      onClick={submitReceipt}
                    >
                      {uploadingReceipt ? 'Uploading...' : 'Submit Receipt'}
                    </button>
                  </div>
                ) : null}

                <p className="muted small-text">
                  {checkoutResult?.payment?.instructions ?? selectedPaymentMethod.instructions}
                </p>
              </div>
            ) : null}

            {error ? <p className="error span-full">{error}</p> : null}

            <div className="form-actions span-full">
              <button className="button" type="submit" disabled={submitting || cartItems.length === 0}>
                {submitting ? `Creating ${paymentMethodLabel} order...` : `Continue to ${paymentMethodLabel} details`}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

