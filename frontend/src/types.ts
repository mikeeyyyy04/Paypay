export type ClassStatus = 'Active' | 'Draft' | 'Full' | 'Archived';
export type PaymentStatus = 'Pending' | 'Reviewing' | 'Paid' | 'Rejected';

export type ClassItem = {
  id: number;
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
  paymentMethod: 'Bank transfer';
  status: PaymentStatus;
  reference: string;
  transferDate: string;
  bankName: string;
  notes: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type ClassFormValues = Omit<ClassItem, 'id' | 'enrolled'> & {
  enrolled?: number;
};

export type VerificationValues = {
  status: PaymentStatus;
  notes: string;
};

export type PublicClass = {
  id: number;
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
  classId: number;
  title: string;
  instructor: string;
  schedule: string;
  price: number;
  quantity: number;
};

export type BankTransferSession = {
  gateway: string;
  sessionId: string;
  paymentUrl: string;
  bankName: string;
  virtualAccountNumber: string;
  amount: number;
  currency: string;
  expiresAt: string;
  payerEmail: string;
  orderId: string;
};

export type CheckoutResponse = {
  orderId: string;
  amount: number;
  currency: string;
  payment: BankTransferSession;
};

export type PublicOrderDetail = {
  id: string;
  customer: string;
  email: string;
  status: PaymentStatus;
  amount: number;
  reference: string;
  items: Array<{
    classId: number;
    title: string;
    price: number;
  }>;
  payment: BankTransferSession;
};
