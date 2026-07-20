const PAYPAL_API =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal Access Token
 */
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(
    `${PAYPAL_API}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error_description ||
      'Unable to authenticate with PayPal.'
    );
  }

  return data.access_token;
}

/**
 * Create PayPal Order
 */
export async function createPaypalOrder({
  orderId,
  totalAmount,
  currency = 'USD',
}) {
  const token = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: currency,
              value: Number(totalAmount).toFixed(2),
            },
          },
        ],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      'Unable to create PayPal order.'
    );
  }

  return {
    gateway: 'PayPal',
    orderId: data.id,
    status: data.status,
    checkoutUrl:
      data.links.find(
        (link) => link.rel === 'approve'
      )?.href ?? null,
    amount: totalAmount,
    currency,
    raw: data,
  };
}

/**
 * Capture PayPal Order
 */
export async function capturePaypalOrder(
  paypalOrderId
) {
  const token = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      'Unable to capture PayPal payment.'
    );
  }

  return {
    success: true,
    status: data.status,
    paypalOrderId,
    captureId:
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
      null,
    payer:
      data.payer?.email_address ?? null,
    raw: data,
  };
}