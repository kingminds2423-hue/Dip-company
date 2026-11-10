export interface InvestmentRecord {
  id: string;
  date: string;
  amount: number;
  note: string;
}

export interface Partner {
  id: string;
  name: string;
  phone: string;
  role: string;
  occupation?: string; // কি করে / পেশা
  fatherName?: string; // বাবার নাম
  motherName?: string; // মায়ের নাম
  address?: string; // ঠিকানা
  permanentAddress?: string; // স্থায়ী ঠিকানা
  nidNumber?: string; // NID নাম্বার
  email?: string;
  photoUrl?: string; // অংশীদারের ছবি
  nidPhotoUrl?: string; // অংশীদারের NID কার্ডের ছবি
  fatherNidPhotoUrl?: string; // বাবার NID কার্ডের ছবি
  motherNidPhotoUrl?: string; // মায়ের NID কার্ডের ছবি
  joinedDate?: string; // অংশীদার হিসেবে যোগদানের তারিখ
  investment: number;
  sharePercentage: number;
  investmentHistory: InvestmentRecord[];
  notes?: string;
}

export interface Company {
  id?: string;
  name: string;
  subTitle: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  currencySymbol: string;
  partners?: Partner[];
}

export interface Staff {
  id: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  phone: string;
  email?: string;
  nid?: string;
  address?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  education?: string;
  emergencyContact?: string;
  designation: string;
  salary: number;
  joinedAt: string;
  photoUrl?: string;
  pin: string;
  status?: 'active' | 'inactive';
}

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'bank' | 'rocket';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  addedBy: string;
  addedById?: string;
  note?: string;
  createdAt: string;
}

export interface CustomerDue {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  totalDue: number;
  paidAmount: number;
  currentDue: number;
  notes?: string;
  updatedAt: string;
}

export interface AdminAuth {
  pin: string;
  phone: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  company: Company;
  adminAuth: AdminAuth;
  staffs: Staff[];
  transactions: Transaction[];
  customerDues: CustomerDue[];
}

export interface UserSession {
  role: 'admin' | 'staff';
  id: string;
  name: string;
  designation: string;
  phone?: string;
}

export type DisplayColor = 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'gold' | 'neonblue';
export type DisplayMode = 'scroll' | 'glow' | 'steady';
export type DisplaySpeed = 'slow' | 'normal' | 'fast';
export type DisplayFontSize = 'medium' | 'large' | 'extralarge';

export interface DigitalNotice {
  text: string; // ১ম লাইন: বড় ডিসপ্লে লেখা / প্রধান ঘোষণা
  subText?: string; // ২য় লাইন: সহযোগী বার্তা / লাইভ স্ট্যাটাস / হেল্পলাইন
  showClock?: boolean; // ডিজিটাল ঘড়ি ও সময় প্রদর্শন
  fontSize?: DisplayFontSize; // ফন্টের আকার
  color: DisplayColor;
  mode: DisplayMode;
  speed: DisplaySpeed;
  active: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface AppointedOfficer {
  id: string;
  type: 'manager' | 'auditor';
  name: string;
  designation: string; // শাখা ম্যানেজার, জেনারেল ম্যানেজার, অভ্যন্তরীণ হিসাব নিরীক্ষক ইত্যাদি
  phone: string;
  email?: string;
  nid?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  permanentAddress?: string;
  education?: string;
  appointmentDate: string;
  salaryOrFee?: number;
  scopeOfWork?: string;
  photoUrl?: string;
  status: 'active' | 'previous';
  appointedBy?: string;
  terms?: string[];
  notes?: string;
  updatedAt?: string;
}

export interface OfficersState {
  manager: AppointedOfficer;
  auditor: AppointedOfficer;
  history?: AppointedOfficer[];
}

