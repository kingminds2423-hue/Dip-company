import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Edit3, Clock, Sparkles, Volume2, Activity, Users } from 'lucide-react';
import { DigitalNotice, DisplayColor, Company, Partner, Transaction } from '../types';
import { toBengaliNumber, formatCurrency } from '../utils/formatters';

interface DigitalTickerBarProps {
  notice: DigitalNotice;
  company?: Company | null;
  partners?: Partner[];
  transactions?: Transaction[];
  onOpenDisplayTab: () => void;
}

export const DigitalTickerBar: React.FC<DigitalTickerBarProps> = ({
  notice,
  company,
  partners = [],
  transactions = [],
  onOpenDisplayTab,
}) => {
  // Real-time live digital clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Net Profit/Loss for Live Ticker
  const netBalance = useMemo(() => {
    let inc = 0;
    let exp = 0;
    (transactions || []).forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return inc - exp;
  }, [transactions]);

  if (!notice || notice.active === false || (!notice.text && !notice.subText)) {
    return null;
  }

  // Format digital time in Bengali
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
  const displayHours = hours % 12 || 12;
  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const bengaliTime = `${toBengaliNumber(padZero(displayHours))}:${toBengaliNumber(padZero(minutes))}:${toBengaliNumber(padZero(seconds))} ${ampm}`;

  // Bengali Date
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const formattedDate = `${toBengaliNumber(currentTime.getDate())} ${months[currentTime.getMonth()]} ${toBengaliNumber(currentTime.getFullYear())}, ${days[currentTime.getDay()]}`;

  // Rich Multi-Color Neon Palette
  const colorStyles: Record<DisplayColor, {
    primaryText: string;
    subText: string;
    bg: string;
    dot: string;
    border: string;
    glow: string;
    accentPill: string;
  }> = {
    emerald: {
      primaryText: 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.95)]',
      subText: 'text-teal-200 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]',
      bg: 'bg-gradient-to-r from-[#012217] via-[#033324] to-[#012217]',
      dot: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
      border: 'border-emerald-700/80',
      glow: 'shadow-[0_0_20px_rgba(5,150,105,0.3)]',
      accentPill: 'bg-emerald-900/90 text-emerald-200 border-emerald-500/50'
    },
    amber: {
      primaryText: 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.95)]',
      subText: 'text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]',
      bg: 'bg-gradient-to-r from-[#291701] via-[#3d2303] to-[#291701]',
      dot: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
      border: 'border-amber-700/80',
      glow: 'shadow-[0_0_20px_rgba(217,119,6,0.3)]',
      accentPill: 'bg-amber-900/90 text-amber-200 border-amber-500/50'
    },
    cyan: {
      primaryText: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.95)]',
      subText: 'text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]',
      bg: 'bg-gradient-to-r from-[#022129] via-[#04333f] to-[#022129]',
      dot: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
      border: 'border-cyan-700/80',
      glow: 'shadow-[0_0_20px_rgba(8,145,178,0.3)]',
      accentPill: 'bg-cyan-900/90 text-cyan-200 border-cyan-500/50'
    },
    rose: {
      primaryText: 'text-rose-300 drop-shadow-[0_0_12px_rgba(251,113,133,0.95)]',
      subText: 'text-pink-200 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]',
      bg: 'bg-gradient-to-r from-[#2b030b] via-[#400612] to-[#2b030b]',
      dot: 'bg-rose-400 shadow-[0_0_10px_#fb7185]',
      border: 'border-rose-700/80',
      glow: 'shadow-[0_0_20px_rgba(225,29,72,0.3)]',
      accentPill: 'bg-rose-900/90 text-rose-200 border-rose-500/50'
    },
    purple: {
      primaryText: 'text-fuchsia-300 drop-shadow-[0_0_12px_rgba(232,121,249,0.95)]',
      subText: 'text-purple-200 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]',
      bg: 'bg-gradient-to-r from-[#20032b] via-[#350747] to-[#20032b]',
      dot: 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]',
      border: 'border-purple-700/80',
      glow: 'shadow-[0_0_20px_rgba(147,51,234,0.3)]',
      accentPill: 'bg-purple-900/90 text-purple-200 border-purple-500/50'
    },
    gold: {
      primaryText: 'text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.95)]',
      subText: 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]',
      bg: 'bg-gradient-to-r from-[#2e2302] via-[#453403] to-[#2e2302]',
      dot: 'bg-yellow-400 shadow-[0_0_10px_#facc15]',
      border: 'border-yellow-700/80',
      glow: 'shadow-[0_0_20px_rgba(202,138,4,0.3)]',
      accentPill: 'bg-yellow-900/90 text-yellow-200 border-yellow-500/50'
    },
    neonblue: {
      primaryText: 'text-blue-300 drop-shadow-[0_0_12px_rgba(96,165,250,0.95)]',
      subText: 'text-indigo-200 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]',
      bg: 'bg-gradient-to-r from-[#02132e] via-[#041f4d] to-[#02132e]',
      dot: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]',
      border: 'border-blue-700/80',
      glow: 'shadow-[0_0_20px_rgba(37,99,235,0.3)]',
      accentPill: 'bg-blue-900/90 text-blue-200 border-blue-500/50'
    }
  };

  const theme = colorStyles[notice.color] || colorStyles.emerald;
  const speedSec = notice.speed === 'fast' ? '14s' : notice.speed === 'slow' ? '28s' : '20s';
  const speedSubSec = notice.speed === 'fast' ? '18s' : notice.speed === 'slow' ? '34s' : '25s';

  const line1Text = notice.text;
  const line2Text = notice.subText;

  const companyLogo = company?.logoUrl || '/assets/aistudio/FB_IMG_1793200670972_1fb968d5.jpg';
  const companyName = company?.name || 'DIP BHOLA NETWORK';

  return (
    <div
      className={`w-full ${theme.bg} border-b-2 ${theme.border} ${theme.glow} px-3 sm:px-4 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 select-none print:hidden z-30 transition-all`}
    >
      {/* LEFT SIDE: COMPANY LOGO & LIVE DIGITAL CLOCK & DATE */}
      <div className="flex items-center justify-between md:justify-start gap-2.5 shrink-0">
        {/* Company Logo & Brand Badge */}
        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border shadow-inner ${theme.accentPill}`}>
          <div className="w-5 h-5 rounded-lg overflow-hidden bg-white/20 shrink-0 flex items-center justify-center p-0.5">
            <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} animate-ping`} />
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
            <span>{companyName.split(' ')[0]}</span>
          </div>
        </div>

        {/* LIVE DIGITAL CLOCK (তারিখ ও সময় সার্বক্ষণিক দৃশ্যমান) */}
        {notice.showClock !== false && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-mono shrink-0">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wider">
                  {bengaliTime}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans">
                  সময়
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-300 tracking-tight font-sans">
                <span className="text-slate-400">তারিখ:</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER: 2-LINE BIG & COLORFUL RUNNING TICKER DISPLAY */}
      <div className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden py-0.5 space-y-1">
        {/* LINE 1: BIG PRIMARY DISPLAY HEADLINE + DATE & TIME */}
        <div className="overflow-hidden relative h-7 sm:h-8 flex items-center">
          <div
            className="whitespace-nowrap inline-block animate-marquee"
            style={{ animation: `marquee ${speedSec} linear infinite` }}
          >
            <span className={`font-black tracking-wide text-base sm:text-xl md:text-2xl font-mono ${theme.primaryText}`}>
              📢 {line1Text}
            </span>
            <span className="mx-6 text-amber-400 font-black text-sm sm:text-base px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">
              ⏰ সময়: {bengaliTime} • 📅 তারিখ: {formattedDate}
            </span>
            <span className="mx-6 text-emerald-400 font-black text-lg">✦✦✦</span>
            <span className={`font-black tracking-wide text-base sm:text-xl md:text-2xl font-mono ${theme.primaryText}`}>
              📢 {line1Text}
            </span>
            <span className="mx-6 text-amber-400 font-black text-sm sm:text-base px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">
              ⏰ সময়: {bengaliTime} • 📅 তারিখ: {formattedDate}
            </span>
            <span className="mx-6 text-emerald-400 font-black text-lg">✦✦✦</span>
          </div>
        </div>

        {/* LINE 2: SECONDARY COLORFUL NOTICE + LIVE PARTNER DIVIDEND TICKER */}
        <div className="overflow-hidden relative h-5 sm:h-6 flex items-center border-t border-white/10 pt-0.5">
          <div
            className="whitespace-nowrap inline-block animate-marquee-sub"
            style={{ animation: `marquee ${speedSubSec} linear infinite` }}
          >
            {line2Text && (
              <>
                <span className={`font-bold tracking-wide text-xs sm:text-sm font-mono ${theme.subText}`}>
                  ⚡ {line2Text}
                </span>
                <span className="mx-5 text-slate-400 font-bold text-xs">• • •</span>
              </>
            )}

            {/* LIVE PARTNER RATIO & DIVIDEND TICKER */}
            {partners && partners.length > 0 && (
              <span className="text-amber-300 font-mono text-xs font-bold">
                ✦ শেয়ার অংশীদার লভ্যাংশ বণ্টন: {' '}
                {partners.map((p, idx) => {
                  const pShare = (netBalance * (p.sharePercentage || 0)) / 100;
                  return (
                    <span key={p.id || idx} className="mx-2 text-white">
                      👤 {p.name} ({toBengaliNumber(p.sharePercentage)}% শেয়ার):{' '}
                      <strong className={pShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {pShare >= 0 ? '+' : ''}{formatCurrency(pShare)}
                      </strong>{' '}
                      {idx < partners.length - 1 ? '|' : ''}
                    </span>
                  );
                })}
              </span>
            )}
            <span className="mx-6 text-slate-400 font-bold text-xs">•••</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Quick Edit & Customize Button */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0 self-center">
        <button
          onClick={onOpenDisplayTab}
          className="text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95"
          title="ডিজিটাল ডিসপ্লে, কোম্পানির লোগো, পার্টনার ছবি ও কালার পরিবর্তন করুন"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden lg:inline">ডিসপ্লে ও কালার বদলান</span>
          <span className="lg:hidden">বদলান</span>
        </button>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-sub {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};
