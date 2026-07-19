export type ClassStatus = 'Active' | 'Draft' | 'Full' | 'Archived';
export type PaymentStatus = 'Pending' | 'Reviewing' | 'Paid' | 'Rejected';

export type ClassItem = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  schedule: string;
  price: number;
  capacity: number;
  enrolled: number;
  status: ClassStatus;
  description: string;
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

export type ClassFormValues = Omit<ClassItem, 'id' | 'enrolled'> & {
  enrolled?: number;
};

export type VerificationValues = {
  status: PaymentStatus;
  notes: string;
};

export type PublicClass = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  schedule: string;
  price: number;
  capacity: number;
  enrolled: number;
  status: ClassStatus;
  description: string;
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
  orderId: string;
  amount: number;
  currency: string;
  checkoutUrl: string;
  payment: PaymentSession;
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
