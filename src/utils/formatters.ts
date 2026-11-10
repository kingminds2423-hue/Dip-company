// Convert English numerals to Bengali numerals
export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

// Format Currency with ৳ Symbol
export function formatCurrency(amount: number | undefined | null, useBengali = true): string {
  if (amount === undefined || amount === null) return '৳ ০';
  const formatted = amount.toLocaleString('en-US');
  if (useBengali) {
    return `৳ ${toBengaliNumber(formatted)}`;
  }
  return `৳ ${formatted}`;
}

// Format Date YYYY-MM-DD to Bengali friendly
export function formatBengaliDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBengaliNumber(parseInt(parts[2], 10));
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const year = toBengaliNumber(parts[0]);
    return `${day} ${month}, ${year}`;
  }
  return dateStr;
}

export const CATEGORIES_EXPENSE = [
  'যাতায়াত ও ডেলিভারি খরচ',
  'বিদ্যুৎ ও ইন্টারনেট বিল',
  'স্টাফ বেতন ও ভাতা',
  'পাইকারি পণ্য / কাঁচামাল ক্রয়',
  'আপ্যায়ন ও নাস্তা খরচ',
  'অফিস ভাড়া ও ইউটিলিটি',
  'লাইন মেরামত ও সরঞ্জাম ক্রয়',
  'যন্ত্রপাতি ও হার্ডওয়্যার পার্টস',
  'প্রচার ও মার্কেটিং',
  'অন্যান্য ব্যয়'
];

export const CATEGORIES_INCOME = [
  'গ্রাহক মাসিক বিল কালেকশন',
  'নতুন লাইন সংযোগ ফি',
  'ব্যাংক মুনাফা / কমিশন',
  'রাউটার / অনু / ডিভাইস বিক্রি',
  'অন্যান্য আয়'
];
