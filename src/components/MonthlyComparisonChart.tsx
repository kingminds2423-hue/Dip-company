import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils/formatters';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';

interface MonthlyComparisonChartProps {
  transactions: Transaction[];
}

interface MonthlyDataPoint {
  monthKey: string;     // e.g. "2026-10"
  monthLabel: string;   // e.g. "অক্টোবর ২৬"
  income: number;
  expense: number;
  net: number;
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ transactions }) => {
  const [rangeFilter, setRangeFilter] = useState<'6m' | 'all'>('6m');

  const monthNamesBangla: { [key: string]: string } = {
    '01': 'জানু',
    '02': 'ফেব্রু',
    '03': 'মার্চ',
    '04': 'এপ্রিল',
    '05': 'মে',
    '06': 'জুন',
    '07': 'জুলাই',
    '08': 'আগস্ট',
    '09': 'সেপ্টে',
    '10': 'অক্টো',
    '11': 'নভে',
    '12': 'ডিসে'
  };

  const chartData = useMemo(() => {
    const monthlyMap: { [month: string]: { income: number; expense: number } } = {};

    transactions.forEach((tx) => {
      if (!tx.date || tx.date.length < 7) return;
      const monthKey = tx.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        monthlyMap[monthKey].income += tx.amount;
      } else {
        monthlyMap[monthKey].expense += tx.amount;
      }
    });

    // If no transactions yet or single month, ensure current month and last month exist
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (!monthlyMap[currentMonth]) {
      monthlyMap[currentMonth] = { income: 0, expense: 0 };
    }

    // Sort months chronologically
    const sortedKeys = Object.keys(monthlyMap).sort();

    const result: MonthlyDataPoint[] = sortedKeys.map((k) => {
      const [year, month] = k.split('-');
      const banglaMonth = monthNamesBangla[month] || month;
      const shortYear = year.substring(2);
      const label = `${banglaMonth} '${toBengaliNumber(shortYear)}`;

      return {
        monthKey: k,
        monthLabel: label,
        income: monthlyMap[k].income,
        expense: monthlyMap[k].expense,
        net: monthlyMap[k].income - monthlyMap[k].expense
      };
    });

    if (rangeFilter === '6m') {
      return result.slice(-6);
    }
    return result;
  }, [transactions, rangeFilter]);

  // Overall chart statistics
  const stats = useMemo(() => {
    let totalInc = 0;
    let totalExp = 0;
    let maxInc = 0;
    let maxIncMonth = '';

    chartData.forEach((d) => {
      totalInc += d.income;
      totalExp += d.expense;
      if (d.income > maxInc) {
        maxInc = d.income;
        maxIncMonth = d.monthLabel;
      }
    });

    const count = chartData.length || 1;
    const avgInc = Math.round(totalInc / count);
    const avgExp = Math.round(totalExp / count);

    return { totalInc, totalExp, avgInc, avgExp, maxInc, maxIncMonth };
  }, [chartData]);

  // Custom Bengali Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-xs min-w-[190px]">
          <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>মাস: {data.monthLabel}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">({data.monthKey})</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>মোট আয়:</span>
              </span>
              <span className="font-bold text-emerald-300">{formatCurrency(data.income)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>মোট ব্যয়:</span>
              </span>
              <span className="font-bold text-rose-300">{formatCurrency(data.expense)}</span>
            </div>

            <div className="pt-1.5 border-t border-slate-700/80 flex items-center justify-between font-bold">
              <span className="text-slate-300">নিট ব্যালেন্স:</span>
              <span className={data.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(data.net)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>মাসিক আয় বনাম ব্যয় তুলনামূলক চার্ট</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Recharts Visual
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              প্রতি মাসের মোট আয় এবং খরচের তুলনামূলক গ্রাফিক্যাল চিত্র
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRangeFilter('6m')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              rangeFilter === '6m'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সর্বশেষ ৬ মাস
          </button>
          <button
            type="button"
            onClick={() => setRangeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              rangeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সকল মাস
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="text-[11px] text-slate-500 font-medium">গড় মাসিক আয়</div>
          <div className="text-sm font-bold text-emerald-700 mt-0.5">
            {formatCurrency(stats.avgInc)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
          <div className="text-[11px] text-slate-500 font-medium">গড় মাসিক ব্যয়</div>
          <div className="text-sm font-bold text-rose-700 mt-0.5">
            {formatCurrency(stats.avgExp)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <div className="text-[11px] text-slate-500 font-medium">সর্বোচ্চ আয়ের মাস</div>
          <div className="text-sm font-bold text-indigo-800 mt-0.5">
            {stats.maxIncMonth ? `${stats.maxIncMonth} (${formatCurrency(stats.maxInc)})` : 'তথ্য নেই'}
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: '11px' }}
              formatter={(value) => {
                if (value === 'income') return <span className="text-slate-700 font-semibold">আয় / জমা (Income)</span>;
                return <span className="text-slate-700 font-semibold">ব্যয় / খরচ (Expense)</span>;
              }}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            />
            <Bar
              dataKey="expense"
              name="expense"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
