import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Users,
  PieChart,
  Plus,
  Minus,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import { Transaction, Staff, Partner, Company, UserSession } from '../types';
import { formatCurrency, toBengaliNumber, formatBengaliDate } from '../utils/formatters';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';

interface DashboardProps {
  transactions: Transaction[];
  staffs: Staff[];
  partners: Partner[];
  company: Company | null;
  currentUser: UserSession;
  onOpenAddModal: (type: 'income' | 'expense') => void;
  onViewAllTransactions: () => void;
  onViewStaff: () => void;
  onViewPartners: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  staffs,
  partners,
  company,
  currentUser,
  onOpenAddModal,
  onViewAllTransactions,
  onViewStaff,
  onViewPartners,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => todayStr.substring(0, 7), [todayStr]);

  // Calculations
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    const categoryExpenseMap: { [cat: string]: number } = {};

    transactions.forEach((tx) => {
      const isIncome = tx.type === 'income';
      if (isIncome) {
        totalIncome += tx.amount;
        if (tx.date === todayStr) todayIncome += tx.amount;
        if (tx.date.startsWith(currentMonthStr)) monthIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        if (tx.date === todayStr) todayExpense += tx.amount;
        if (tx.date.startsWith(currentMonthStr)) monthExpense += tx.amount;

        categoryExpenseMap[tx.category] = (categoryExpenseMap[tx.category] || 0) + tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const monthBalance = monthIncome - monthExpense;

    // Total Partner Investment
    const totalInvestment = partners.reduce((sum, p) => sum + (p.investment || 0), 0);

    // Top expense categories
    const topCategories = Object.entries(categoryExpenseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      todayIncome,
      todayExpense,
      monthIncome,
      monthExpense,
      monthBalance,
      totalInvestment,
      topCategories
    };
  }, [transactions, todayStr, currentMonthStr, partners]);

  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src={company?.logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg'}
                alt={company?.name || 'Dip Bhola network'}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  স্বাগতম, {currentUser.name}
                </span>
                <span className="text-xs text-slate-400">
                  • {formatBengaliDate(todayStr)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {company?.name || 'DIP BHOLA NETWORK'} এর কেন্দ্রীয় হিসাব ড্যাশবোর্ড
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                দৈনিক লাইন রক্ষণাবেক্ষণ, গ্রাহক বিল আদায়, স্টাফ বেতন এবং পার্টনার মূলধনের ক্লাউড হিসাব খাতা।
              </p>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onOpenAddModal('income')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              নতুন জমা / আয়
            </button>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition-transform active:scale-95"
            >
              <Minus className="w-4 h-4" />
              নতুন খরচ / ব্যয়
            </button>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Main KPI Cards Grid - Highly Colorful & Smart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash Balance - Vibrant Emerald & Teal Gradient */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white rounded-2xl p-5 border-2 border-emerald-300/80 shadow-md shadow-emerald-950/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
              ক্যাশ ইন হ্যান্ড / নিট ব্যালেন্স
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              stats.netBalance >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${
              stats.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-600'
            }`}>
              {formatCurrency(stats.netBalance)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                stats.netBalance >= 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}>
                {stats.netBalance >= 0 ? '✓ পজিটিভ ব্যালেন্স' : 'নেগেটিভ ক্যাশ'}
              </span>
              <span className="text-slate-500 text-[11px]">মোট জমা - খরচ</span>
            </div>
          </div>
        </div>

        {/* Total Income - Vibrant Cyan & Blue Gradient */}
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50/60 to-white rounded-2xl p-5 border-2 border-cyan-300/80 shadow-md shadow-cyan-950/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-cyan-900 uppercase tracking-wider">
              সর্বমোট আয় / জমা
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-xs text-cyan-800 font-bold mt-1 flex items-center gap-1">
              <span>চলতি মাসে জমা:</span>
              <span className="text-emerald-700 font-black">{formatCurrency(stats.monthIncome)}</span>
            </p>
          </div>
        </div>

        {/* Total Expense - Vibrant Rose & Coral Gradient */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50/60 to-white rounded-2xl p-5 border-2 border-rose-300/80 shadow-md shadow-rose-950/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-900 uppercase tracking-wider">
              সর্বমোট ব্যয় / খরচ
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {formatCurrency(stats.totalExpense)}
            </div>
            <p className="text-xs text-rose-800 font-bold mt-1 flex items-center gap-1">
              <span>চলতি মাসে ব্যয়:</span>
              <span className="text-rose-700 font-black">{formatCurrency(stats.monthExpense)}</span>
            </p>
          </div>
        </div>

        {/* Today's Activity - Vibrant Indigo & Violet Gradient */}
        <div className="bg-gradient-to-br from-indigo-50 via-violet-50/60 to-white rounded-2xl p-5 border-2 border-indigo-300/80 shadow-md shadow-indigo-950/5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">
              আজকের রিয়েল-টাইম হিসাব
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">আজকের জমা:</span>
              <span className="font-extrabold text-emerald-700">{formatCurrency(stats.todayIncome)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">আজকের খরচ:</span>
              <span className="font-extrabold text-rose-700">{formatCurrency(stats.todayExpense)}</span>
            </div>
            <div className="pt-1 border-t border-indigo-200/80 flex justify-between items-center text-xs font-black">
              <span className="text-indigo-900">আজকের উদ্বৃত্ত:</span>
              <span className={stats.todayIncome - stats.todayExpense >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                {formatCurrency(stats.todayIncome - stats.todayExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Income vs Expense Comparison Bar Chart */}
      <MonthlyComparisonChart transactions={transactions} />

      {/* Partners Equity & Staff Quick Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partner Equity Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  অংশীদার মূলধন ও শেয়ার বণ্টন
                </h3>
                <p className="text-xs text-slate-500">
                  মোট পার্টনার বিনিয়োগ: {formatCurrency(stats.totalInvestment)}
                </p>
              </div>
            </div>
            <button
              onClick={onViewPartners}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              বিস্তারিত <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Equity Progress Bar */}
          <div className="space-y-3">
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
              {partners.map((p, idx) => (
                <div
                  key={p.id}
                  style={{ width: `${p.sharePercentage}%` }}
                  className={`h-full transition-all ${
                    idx === 0 ? 'bg-emerald-600' : 'bg-teal-400'
                  }`}
                  title={`${p.name}: ${toBengaliNumber(p.sharePercentage)}%`}
                />
              ))}
            </div>

            {/* Partner Details Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {partners.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full ${idx === 0 ? 'bg-emerald-600' : 'bg-teal-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900">{formatCurrency(p.investment)}</div>
                    <div className="text-[11px] font-semibold text-emerald-700">{toBengaliNumber(p.sharePercentage)}% শেয়ার</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Quick Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">কেন্দ্রীয় স্টাফ মনিটরিং</h3>
                <p className="text-xs text-slate-500">মোট সক্রিয় স্টাফ: {toBengaliNumber(staffs.length)} জন</p>
              </div>
            </div>
            <button
              onClick={onViewStaff}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              সকল স্টাফ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {staffs.map((st) => (
              <div
                key={st.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-emerald-200">
                    {st.photoUrl && st.photoUrl.startsWith('data:') ? (
                      <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" />
                    ) : (
                      st.name.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-500">{st.designation}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">{formatCurrency(st.salary)}</span>
                  <div className="text-[10px] text-slate-400">মাসিক বেতন</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>সর্বশেষ লেনদেনসমূহ (Recent Transactions)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {toBengaliNumber(transactions.length)} টি রেকর্ড
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              সর্বশেষ খরচ ও আয়ের তথ্য সরাসরি ফায়ারবেস থেকে লাইভ আপডেট হচ্ছে
            </p>
          </div>

          <button
            onClick={onViewAllTransactions}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            সম্পূর্ণ খাতা দেখুন <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              এখনো কোনো লেনদেন যুক্ত করা হয়নি। উপরে বোতামে ক্লিক করে নতুন এন্ট্রি দিন।
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isIncome ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {tx.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>{formatBengaliDate(tx.date)}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">এন্ট্রি: {tx.addedBy}</span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 text-[11px]">"{tx.note}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pl-11 sm:pl-0">
                    <div className={`text-sm sm:text-base font-extrabold ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tx.paymentMethod === 'bkash' ? 'বিকাশ' : tx.paymentMethod === 'nagad' ? 'নগদ' : tx.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ ক্যাশ'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
