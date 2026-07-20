export type ClassStatus = 'Active' | 'Draft' | 'Full' | 'Archived';
export type PaymentStatus = 'Pending' | 'Reviewing' | 'Paid' | 'Rejected';

export type ClassItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  instructor: string;
  schedule: string;
  price: number;
  capacity: number;
  enrolled: number;
  status: ClassStatus;
  description: string;
  coverImage?: string | null;
};

export type OrderItem = {
  id: string;
  customer: string;
  email: string;
  classTitle: string;
  amount: number;
  paymentMethod: 'GCash' | 'Bank transfer' | 'Manual payment';
  status: PaymentStatus;
  reference: string;
  transferDate: string;
  bankName: string;
  notes: string;
  verifiedBy?: string;
  verifiedAt?: string;
  enrollmentApproved?: boolean;
  paymentReferenceNumber?: string;
  receipt?: ReceiptSubmission;
};

export type ClassFormValues = {
  title: string;
  category: string;
  instructor: string;
  schedule: string;
  price: number;
  capacity: number;
  status: ClassStatus;
  description: string;
  enrolled?: number;
  coverImage?: File | null;
};

export type VerificationValues = {
  status: PaymentStatus;
  notes: string;
};

export type PublicClass = {
  id: string;
  slug: string;
  title: string;
  category: string;
  instructor: string;
  schedule: string;
  price: number;
  capacity: number;
  enrolled: number;
  status: ClassStatus;
  description: string;

  coverImage?: string | null;
};

export type CartItem = {
  classId: string;
  title: string;
  instructor: string;
  schedule: string;
  price: number;
  quantity: number;
};

export type PaymentSession = {
  gateway: string;
  sessionId: string;
  checkoutSessionId?: string;
  paymentUrl: string;
  checkoutUrl?: string;
  bankName?: string;
  virtualAccountNumber?: string;
  amount: number;
  subtotal?: number;
  serviceFee?: number;
  currency: string;
  expiresAt: string | null;
  payerEmail: string;
  orderId: string;
  method?: ManualPaymentMethod;
  instructions?: string;
};

export type ManualPaymentMethod = {
  code: 'gcash' | 'bank_transfer';
  name: 'GCash' | 'Bank transfer';
  bankName?: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  qrImageUrl?: string;
  instructions: string;
};

export type ReceiptSubmission = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  submittedAt: string;
};

export type CheckoutResponse = {
  success: boolean;
  paymentMethod: 'gcash' | 'paypal';

  orderId: string;

  amount: number;

  currency: string;

  checkoutUrl?: string;

  paypalOrderId?: string;

  classTitle?: string;

  items?: Array<{
    classId: string;
    title: string;
    price: number;
  }>;

  payment?: {
    gateway: string;

    sessionId: string;

    paymentUrl: string;

    amount: number;

    currency: string;

    payerEmail: string;

    expiresAt: string | null;

    orderId: string;

    instructions: string;

    method: {
      code: string;

      name: string;

      accountName: string;

      accountNumber: string;

      qrImageUrl?: string;

      instructions: string;
    };
  };
};

export type PublicOrderDetail = {
  id: string;
  customer: string;
  email: string;
  status: PaymentStatus;
  amount: number;
  reference: string;
  items: Array<{
    classId: string;
    title: string;
    price: number;
  }>;
  payment: PaymentSession;
  paymentReferenceNumber?: string;
  receipt?: ReceiptSubmission;
};



