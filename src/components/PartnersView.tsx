import React, { useState, useMemo, useRef } from 'react';
import {
  PieChart,
  Plus,
  Coins,
  History,
  Phone,
  Briefcase,
  MapPin,
  CreditCard,
  Image as ImageIcon,
  Calendar,
  X,
  Check,
  Eye,
  Edit2,
  Trash2,
  Printer,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  Download,
  AlertTriangle,
  User,
  ShieldCheck
} from 'lucide-react';
import { Partner, UserSession, Transaction, Company } from '../types';
import { formatCurrency, toBengaliNumber, formatBengaliDate } from '../utils/formatters';

interface PartnersViewProps {
  partners: Partner[];
  transactions?: Transaction[];
  company?: Company | null;
  currentUser: UserSession;
  onAddPartner: (partner: Partner) => Promise<void>;
  onUpdatePartner: (id: string, updates: Partial<Partner>) => Promise<void>;
  onDeletePartner: (id: string) => Promise<void>;
  onAddInvestment: (partnerId: string, partner: Partner, amount: number, note: string, date: string) => Promise<void>;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  transactions = [],
  company,
  currentUser,
  onAddPartner,
  onUpdatePartner,
  onDeletePartner,
  onAddInvestment,
}) => {
  // Tabs for view: 'overview' | 'profit_loss' | 'calculator'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'profit_loss' | 'calculator'>('overview');

  // Modals state
  const [selectedBioDataPartner, setSelectedBioDataPartner] = useState<Partner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [selectedPartnerForInvestment, setSelectedPartnerForInvestment] = useState<Partner | null>(null);
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);
  const [viewingImageModal, setViewingImageModal] = useState<{ title: string; url: string } | null>(null);

  // Investment modal form state
  const [invAmount, setInvAmount] = useState<number | ''>('');
  const [invNote, setInvNote] = useState('');
  const [invDate, setInvDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom profit/loss distribution calculator state
  const [customDistAmount, setCustomDistAmount] = useState<number | ''>(100000);
  const [distMode, setDistMode] = useState<'profit' | 'loss'>('profit');

  // Partner Form State (Full Bio-Data)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'অংশীদার',
    occupation: '',
    fatherName: '',
    motherName: '',
    address: '',
    permanentAddress: '',
    nidNumber: '',
    email: '',
    photoUrl: '',
    nidPhotoUrl: '',
    fatherNidPhotoUrl: '',
    motherNidPhotoUrl: '',
    joinedDate: new Date().toISOString().split('T')[0],
    investment: '' as number | '',
    notes: ''
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const nidInputRef = useRef<HTMLInputElement>(null);
  const fatherNidInputRef = useRef<HTMLInputElement>(null);
  const motherNidInputRef = useRef<HTMLInputElement>(null);

  // Financial Stats & Auto Share Ratio Calculations
  const totalInvestment = useMemo(() => {
    return partners.reduce((sum, p) => sum + (p.investment || 0), 0);
  }, [partners]);

  // Real-time Business Profit & Loss
  const financialStats = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().substring(0, 7);

    let allTimeIncome = 0;
    let allTimeExpense = 0;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    transactions.forEach((tx) => {
      const isThisMonth = tx.date && tx.date.startsWith(currentMonthPrefix);
      if (tx.type === 'income') {
        allTimeIncome += tx.amount;
        if (isThisMonth) thisMonthIncome += tx.amount;
      } else {
        allTimeExpense += tx.amount;
        if (isThisMonth) thisMonthExpense += tx.amount;
      }
    });

    const allTimeNetProfit = allTimeIncome - allTimeExpense;
    const thisMonthNetProfit = thisMonthIncome - thisMonthExpense;

    return {
      allTimeIncome,
      allTimeExpense,
      allTimeNetProfit,
      thisMonthIncome,
      thisMonthExpense,
      thisMonthNetProfit,
      currentMonthLabel: currentMonthPrefix
    };
  }, [transactions]);

  // Partners with dynamic, accurately calculated auto ratios
  const partnersWithRatios = useMemo(() => {
    return partners.map((p) => {
      const autoRatio = totalInvestment > 0 ? (p.investment / totalInvestment) * 100 : 0;
      const thisMonthShare = (financialStats.thisMonthNetProfit * autoRatio) / 100;
      const allTimeShare = (financialStats.allTimeNetProfit * autoRatio) / 100;

      return {
        ...p,
        calculatedRatio: autoRatio,
        thisMonthShare,
        allTimeShare
      };
    }).sort((a, b) => b.investment - a.investment);
  }, [partners, totalInvestment, financialStats]);

  // Open Form to Add Partner
  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      phone: '',
      role: 'অংশীদার',
      occupation: 'ব্যবসা',
      fatherName: '',
      motherName: '',
      address: '',
      permanentAddress: '',
      nidNumber: '',
      email: '',
      photoUrl: '',
      nidPhotoUrl: '',
      fatherNidPhotoUrl: '',
      motherNidPhotoUrl: '',
      joinedDate: new Date().toISOString().split('T')[0],
      investment: '',
      notes: ''
    });
    setIsFormOpen(true);
  };

  // Open Form to Edit Partner
  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      phone: partner.phone || '',
      role: partner.role || 'অংশীদার',
      occupation: partner.occupation || '',
      fatherName: partner.fatherName || '',
      motherName: partner.motherName || '',
      address: partner.address || '',
      permanentAddress: partner.permanentAddress || '',
      nidNumber: partner.nidNumber || '',
      email: partner.email || '',
      photoUrl: partner.photoUrl || '',
      nidPhotoUrl: partner.nidPhotoUrl || '',
      fatherNidPhotoUrl: partner.fatherNidPhotoUrl || '',
      motherNidPhotoUrl: partner.motherNidPhotoUrl || '',
      joinedDate: partner.joinedDate || new Date().toISOString().split('T')[0],
      investment: partner.investment || 0,
      notes: partner.notes || ''
    });
    setIsFormOpen(true);
  };

  // Handle Image upload to Base64
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'photoUrl' | 'nidPhotoUrl' | 'fatherNidPhotoUrl' | 'motherNidPhotoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ছবির সাইজ ২MB এর বেশি হতে পারবে না');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [field]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Partner Bio-Data Form (Create or Update)
  const handleSubmitPartnerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const invValue = Number(formData.investment) || 0;

      if (editingPartner) {
        // Update existing partner
        await onUpdatePartner(editingPartner.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role.trim(),
          occupation: formData.occupation.trim(),
          fatherName: formData.fatherName.trim(),
          motherName: formData.motherName.trim(),
          address: formData.address.trim(),
          permanentAddress: formData.permanentAddress.trim(),
          nidNumber: formData.nidNumber.trim(),
          email: formData.email.trim(),
          photoUrl: formData.photoUrl,
          nidPhotoUrl: formData.nidPhotoUrl,
          fatherNidPhotoUrl: formData.fatherNidPhotoUrl,
          motherNidPhotoUrl: formData.motherNidPhotoUrl,
          joinedDate: formData.joinedDate,
          investment: invValue,
          notes: formData.notes.trim()
        });
      } else {
        // Create new partner with auto initial ratio
        const newPartnerId = `p-${Date.now()}`;
        const newPartner: Partner = {
          id: newPartnerId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role.trim() || 'অংশীদার',
          occupation: formData.occupation.trim(),
          fatherName: formData.fatherName.trim(),
          motherName: formData.motherName.trim(),
          address: formData.address.trim(),
          permanentAddress: formData.permanentAddress.trim(),
          nidNumber: formData.nidNumber.trim(),
          email: formData.email.trim(),
          photoUrl: formData.photoUrl,
          nidPhotoUrl: formData.nidPhotoUrl,
          fatherNidPhotoUrl: formData.fatherNidPhotoUrl,
          motherNidPhotoUrl: formData.motherNidPhotoUrl,
          joinedDate: formData.joinedDate,
          investment: invValue,
          sharePercentage: 0,
          investmentHistory: invValue > 0 ? [{
            id: `inv-${Date.now()}`,
            date: formData.joinedDate || new Date().toISOString().split('T')[0],
            amount: invValue,
            note: 'প্রারম্ভিক মূলধন বিনিয়োগ'
          }] : [],
          notes: formData.notes.trim()
        };

        await onAddPartner(newPartner);
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving partner:', err);
      alert('পার্টনার সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit additional investment
  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerForInvestment || !invAmount || Number(invAmount) <= 0) return;

    try {
      setIsSubmitting(true);
      await onAddInvestment(
        selectedPartnerForInvestment.id,
        selectedPartnerForInvestment,
        Number(invAmount),
        invNote.trim() || 'অতিরিক্ত মূলধন বিনিয়োগ',
        invDate
      );
      setSelectedPartnerForInvestment(null);
      setInvAmount('');
      setInvNote('');
    } catch (err) {
      console.error(err);
      alert('বিনিয়োগ যুক্ত করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Partner Confirmation
  const handleDeleteConfirm = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই অংশীদারের সম্পূর্ণ প্রোফাইল ও রেকর্ড মুছে ফেলতে চান?')) {
      try {
        await onDeletePartner(id);
        setDeletingPartnerId(null);
        if (selectedBioDataPartner?.id === id) {
          setSelectedBioDataPartner(null);
        }
      } catch (err) {
        console.error('Error deleting partner:', err);
        alert('অংশীদার মুছতে সমস্যা হয়েছে');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ব্যবসায়িক অংশীদার ও লাভ-লোকসান বণ্টন
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              অটো রেশিও ইঞ্জিন
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            মোট মূলধন: <strong className="text-emerald-700 text-base">{formatCurrency(totalInvestment)}</strong> • অংশীদার: <strong>{toBengaliNumber(partners.length)} জন</strong> (রেশিও অনুযায়ী স্বয়ংক্রিয় লাভ-লোকসান ভাগ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন অংশীদার ও বায়োডাটা</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 w-fit text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4 text-emerald-600" />
          <span>অংশীদার তালিকা ও বায়োডাটা</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profit_loss')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'profit_loss'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-teal-600" />
          <span>লাইভ লাভ-লোকসান বণ্টন</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'calculator'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>কাস্টম লভ্যাংশ ক্যালকুলেটর</span>
        </button>
      </div>

      {/* 1. VISUAL AUTO EQUITY DISTRIBUTION BAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>স্বয়ংক্রিয় মূলধন শেয়ার রেশিও বার (Auto Ratio Bar - 100%)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            মোট মূলধন: <strong className="text-slate-800">{formatCurrency(totalInvestment)}</strong>
          </span>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div className="w-full h-5 rounded-full bg-slate-100 flex overflow-hidden shadow-inner p-0.5 border border-slate-200">
          {partnersWithRatios.map((p, idx) => {
            const colors = [
              'bg-emerald-600',
              'bg-teal-500',
              'bg-indigo-600',
              'bg-amber-500',
              'bg-rose-500',
              'bg-cyan-600'
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div
                key={p.id}
                style={{ width: `${Math.max(p.calculatedRatio, 2)}%` }}
                className={`h-full transition-all first:rounded-l-full last:rounded-r-full ${colorClass}`}
                title={`${p.name}: ${p.calculatedRatio.toFixed(2)}%`}
              />
            );
          })}
        </div>

        {/* Legend Chips with Auto Ratios */}
        <div className="flex flex-wrap gap-3 text-xs">
          {partnersWithRatios.map((p, idx) => {
            const colors = [
              'bg-emerald-600',
              'bg-teal-500',
              'bg-indigo-600',
              'bg-amber-500',
              'bg-rose-500',
              'bg-cyan-600'
            ];
            const dotClass = colors[idx % colors.length];

            return (
              <div key={p.id} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                <span className={`w-3 h-3 rounded-full shrink-0 ${dotClass}`} />
                <span className="font-bold text-slate-800">{p.name}</span>
                <span className="text-emerald-800 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  {toBengaliNumber(p.calculatedRatio.toFixed(2))}%
                </span>
                <span className="text-slate-500 text-[11px]">({formatCurrency(p.investment)})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & PARTNER BIO-DATA CARDS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {partnersWithRatios.map((partner, idx) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Partner Card Top Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Partner Photo Thumbnail */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-emerald-500/40 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {partner.photoUrl ? (
                        <img
                          src={partner.photoUrl}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-tr ${
                          idx === 0 ? 'from-emerald-600 to-teal-500' : 'from-slate-700 to-slate-900'
                        }`}>
                          {partner.name.substring(0, 1)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {partner.name}
                        </h3>
                        {partner.occupation && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                            {partner.occupation}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-emerald-800 font-semibold">{partner.role || 'অংশীদার'}</div>
                      {partner.phone && (
                        <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{partner.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auto Ratio Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                      {toBengaliNumber(partner.calculatedRatio.toFixed(2))}% শেয়ার
                    </span>
                  </div>
                </div>

                {/* Bio Data Quick Summary Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-700">
                  {partner.fatherName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">পিতা:</span>
                      <strong className="text-slate-800">{partner.fatherName}</strong>
                    </div>
                  )}
                  {partner.motherName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">মাতা:</span>
                      <strong className="text-slate-800">{partner.motherName}</strong>
                    </div>
                  )}
                  {partner.address && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">ঠিকানা:</span>
                      <span className="text-slate-800 text-right truncate">{partner.address}</span>
                    </div>
                  )}
                  {partner.nidNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">NID নং:</span>
                      <span className="font-mono text-slate-800 font-bold">{partner.nidNumber}</span>
                    </div>
                  )}
                </div>

                {/* Investment Stat Block */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                      মোট মূলধন বিনিয়োগ
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(partner.investment)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPartnerForInvestment(partner);
                      setInvAmount('');
                      setInvNote('');
                      setInvDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>বিনিয়োগ যোগ</span>
                  </button>
                </div>

                {/* Attached Document Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500 text-[10px] font-semibold">সংযুক্ত দলিল:</span>
                  {partner.nidPhotoUrl ? (
                    <button
                      onClick={() => setViewingImageModal({ title: `${partner.name} - এনআইডি কার্ড`, url: partner.nidPhotoUrl! })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 font-semibold"
                    >
                      <CreditCard className="w-3 h-3 text-teal-600" />
                      <span>এনআইডি</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">NID নেই</span>
                  )}

                  {partner.fatherNidPhotoUrl && (
                    <button
                      onClick={() => setViewingImageModal({ title: `${partner.name} - বাবার এনআইডি`, url: partner.fatherNidPhotoUrl! })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold"
                    >
                      <User className="w-3 h-3 text-blue-600" />
                      <span>পিতার NID</span>
                    </button>
                  )}

                  {partner.motherNidPhotoUrl && (
                    <button
                      onClick={() => setViewingImageModal({ title: `${partner.name} - মায়ের এনআইডি`, url: partner.motherNidPhotoUrl! })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-semibold"
                    >
                      <User className="w-3 h-3 text-purple-600" />
                      <span>মাতার NID</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons: Full Bio Data, Edit, Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedBioDataPartner(partner)}
                  className="flex-1 py-1.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>সম্পূর্ণ বায়োডাটা দেখুন</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(partner)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-slate-200"
                  title="বায়োডাটা এডিট করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteConfirm(partner.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-slate-200"
                  title="অংশীদার মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE PROFIT / LOSS DISTRIBUTION TABLE */}
      {activeSubTab === 'profit_loss' && (
        <div className="space-y-5">
          {/* Top Real-time Financial Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                চলতি মাসের মোট আয়
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {formatCurrency(financialStats.thisMonthIncome)}
              </span>
              <span className="text-[11px] text-slate-400">ব্যবসায়ের রিয়েল-টাইম আয়</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                চলতি মাসের মোট ব্যয়
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {formatCurrency(financialStats.thisMonthExpense)}
              </span>
              <span className="text-[11px] text-slate-400">পরিচালন ও লাইন খরচ</span>
            </div>

            <div className={`rounded-2xl p-4 border shadow-xs ${
              financialStats.thisMonthNetProfit >= 0
                ? 'bg-emerald-50/80 border-emerald-200'
                : 'bg-rose-50/80 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  চলতি মাসের নিট লাভ / লোকসান
                </span>
                {financialStats.thisMonthNetProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <span className={`text-2xl font-black mt-1 block ${
                financialStats.thisMonthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {formatCurrency(financialStats.thisMonthNetProfit)}
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">
                {financialStats.thisMonthNetProfit >= 0 ? '✓ নিট লাভ (বন্টনযোগ্য)' : '⚠ নিট লোকসান (বহনযোগ্য)'}
              </span>
            </div>
          </div>

          {/* Profit / Loss Distribution Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>শেয়ার রেশিও হারে লাভ-লোকসান বণ্টন তালিকা</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  প্রতিটি অংশীদারের বিনিয়োগ অনুপাত অনুযায়ী প্রাপ্ত লভ্যাংশ বা লোকসান
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">অংশীদারের নাম ও ভূমিকা</th>
                    <th className="py-3 px-4 text-right">মূলধন বিনিয়োগ</th>
                    <th className="py-3 px-4 text-center">অটো শেয়ার রেশিও</th>
                    <th className="py-3 px-4 text-right">চলতি মাসের লাভ/লোকসান প্রাপ্য</th>
                    <th className="py-3 px-4 text-right">সর্বমোট ক্যাশ ব্যালেন্স প্রাপ্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnersWithRatios.map((p) => {
                    const isProfitMonth = p.thisMonthShare >= 0;
                    const isProfitAll = p.allTimeShare >= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.role} • {p.phone || 'ফোন নেই'}</div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-slate-800 text-sm">
                          {formatCurrency(p.investment)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200">
                            {toBengaliNumber(p.calculatedRatio.toFixed(2))}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-black text-sm ${isProfitMonth ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {isProfitMonth ? '+' : ''}{formatCurrency(p.thisMonthShare)}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {isProfitMonth ? 'মাসিক লাভ' : 'মাসিক লোকসান'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-black text-sm ${isProfitAll ? 'text-slate-900' : 'text-rose-600'}`}>
                            {isProfitAll ? '+' : ''}{formatCurrency(p.allTimeShare)}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            সর্বমোট অনুপাতে শেয়ার
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-black text-xs">
                    <td className="py-3.5 px-4 text-slate-900">সর্বমোট (১০০% অংশীদারিত্ব)</td>
                    <td className="py-3.5 px-4 text-right text-emerald-800 text-sm">
                      {formatCurrency(totalInvestment)}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-800">১০০.০০%</td>
                    <td className={`py-3.5 px-4 text-right text-sm ${
                      financialStats.thisMonthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {formatCurrency(financialStats.thisMonthNetProfit)}
                    </td>
                    <td className={`py-3.5 px-4 text-right text-sm ${
                      financialStats.allTimeNetProfit >= 0 ? 'text-slate-900' : 'text-rose-600'
                    }`}>
                      {formatCurrency(financialStats.allTimeNetProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM PROFIT / LOSS DISTRIBUTION CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>যেকোনো পরিমাণ লভ্যাংশ বা লোকসান বণ্টন ক্যালকুলেটর</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বন্টনযোগ্য টাকার পরিমাণ লিখুন, স্বয়ংক্রিয় রেশিও অনুযায়ী কে কত টাকা পাবে বা দিবে তা সঙ্গে সঙ্গে বের হয়ে যাবে।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDistMode('profit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  distMode === 'profit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                লাভ / ডিভিডেন্ড বণ্টন
              </button>
              <button
                onClick={() => setDistMode('loss')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  distMode === 'loss'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                লোকসান বহন হিসাব
              </button>
            </div>
          </div>

          {/* Calculator Input Box */}
          <div className="max-w-md space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {distMode === 'profit' ? 'মোট বন্টনযোগ্য নিট লাভ / বোনাস (BDT)' : 'মোট বহনযোগ্য লোকসান (BDT)'} *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-lg">৳</span>
              <input
                type="number"
                min="0"
                value={customDistAmount}
                onChange={(e) => setCustomDistAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="যেমন: ১,০০,০০০"
                className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 focus:border-emerald-600 rounded-xl text-lg font-black text-slate-900 transition"
              />
            </div>
            <div className="flex gap-2 text-xs">
              {[50000, 100000, 200000, 500000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCustomDistAmount(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  ৳{toBengaliNumber(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {partnersWithRatios.map((p) => {
              const amount = Number(customDistAmount) || 0;
              const partnerShare = (amount * p.calculatedRatio) / 100;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    distMode === 'profit'
                      ? 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200 shadow-2xs'
                      : 'bg-gradient-to-br from-rose-50/60 to-white border-rose-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-[11px] text-slate-500">{p.role}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono font-bold">
                      {toBengaliNumber(p.calculatedRatio.toFixed(2))}%
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs text-slate-600 font-medium">
                      {distMode === 'profit' ? 'লভ্যাংশ প্রাপ্য:' : 'লোকসান দায়:'}
                    </span>
                    <span className={`text-xl font-black ${distMode === 'profit' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatCurrency(partnerShare)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: FULL BIO-DATA VIEW (WITH PHOTOS & PRINTABLE PROFILE) */}
      {selectedBioDataPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="text-base font-bold">অংশীদারের পূর্ণাঙ্গ বায়োডাটা ও তথ্য বিবরণী</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                  title="বায়োডাটা প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  onClick={() => setSelectedBioDataPartner(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Printable Bio-Data layout */}
            <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              {/* Profile Top: Photo + Name + Key stats */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-emerald-500 overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
                  {selectedBioDataPartner.photoUrl ? (
                    <img
                      src={selectedBioDataPartner.photoUrl}
                      alt={selectedBioDataPartner.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setViewingImageModal({ title: `${selectedBioDataPartner.name} - ছবি`, url: selectedBioDataPartner.photoUrl! })}
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selectedBioDataPartner.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black border border-emerald-300">
                      {selectedBioDataPartner.role || 'অংশীদার'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                    {selectedBioDataPartner.occupation && (
                      <p><span className="text-slate-400">পেশা:</span> <strong>{selectedBioDataPartner.occupation}</strong></p>
                    )}
                    {selectedBioDataPartner.phone && (
                      <p><span className="text-slate-400">মোবাইল:</span> <strong className="font-mono">{selectedBioDataPartner.phone}</strong></p>
                    )}
                    {selectedBioDataPartner.nidNumber && (
                      <p><span className="text-slate-400">NID নং:</span> <strong className="font-mono text-emerald-800">{selectedBioDataPartner.nidNumber}</strong></p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs">
                      মূলধন: {formatCurrency(selectedBioDataPartner.investment)}
                    </span>
                    <span className="px-3 py-1 bg-slate-900 text-emerald-300 text-xs font-black rounded-lg">
                      শেয়ার রেশিও: {toBengaliNumber((totalInvestment > 0 ? (selectedBioDataPartner.investment / totalInvestment) * 100 : 0).toFixed(2))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal & Family Details Table */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 border-b pb-1">
                  পারিবারিক ও স্থায়ী তথ্যাদি (Family & Address Bio-Data)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">পিতার নাম (Father's Name):</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {selectedBioDataPartner.fatherName || 'দেওয়া হয়নি'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">মাতার নাম (Mother's Name):</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {selectedBioDataPartner.motherName || 'দেওয়া হয়নি'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">বর্তমান ঠিকানা (Present Address):</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedBioDataPartner.address || 'দেওয়া হয়নি'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">স্থায়ী ঠিকানা (Permanent Address):</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedBioDataPartner.permanentAddress || selectedBioDataPartner.address || 'দেওয়া হয়নি'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">অংশীদারিত্ব শুরুর তারিখ:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {selectedBioDataPartner.joinedDate || 'উল্লেখ নেই'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">ইমেইল:</span>
                    <span className="font-mono text-slate-800 mt-0.5 block">
                      {selectedBioDataPartner.email || 'নাই'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NID Card & Document Gallery */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 border-b pb-1 flex items-center justify-between">
                  <span>সংযুক্ত জাতীয় পরিচয়পত্র ও ডকুমেন্টস (NID Gallery)</span>
                  <span className="text-[10px] text-slate-400 font-normal">বড় করে দেখতে ছবিতে ক্লিক করুন</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Partner NID */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">অংশীদারের NID কার্ড</span>
                    <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
                      {selectedBioDataPartner.nidPhotoUrl ? (
                        <img
                          src={selectedBioDataPartner.nidPhotoUrl}
                          alt="Partner NID"
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                          onClick={() => setViewingImageModal({ title: `${selectedBioDataPartner.name} - NID কার্ড`, url: selectedBioDataPartner.nidPhotoUrl! })}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">ছবি আপলোড নেই</span>
                      )}
                    </div>
                  </div>

                  {/* Father's NID */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">পিতার NID কার্ড</span>
                    <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
                      {selectedBioDataPartner.fatherNidPhotoUrl ? (
                        <img
                          src={selectedBioDataPartner.fatherNidPhotoUrl}
                          alt="Father NID"
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                          onClick={() => setViewingImageModal({ title: `${selectedBioDataPartner.name} - বাবার NID কার্ড`, url: selectedBioDataPartner.fatherNidPhotoUrl! })}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">ছবি আপলোড নেই</span>
                      )}
                    </div>
                  </div>

                  {/* Mother's NID */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">মাতার NID কার্ড</span>
                    <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
                      {selectedBioDataPartner.motherNidPhotoUrl ? (
                        <img
                          src={selectedBioDataPartner.motherNidPhotoUrl}
                          alt="Mother NID"
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                          onClick={() => setViewingImageModal({ title: `${selectedBioDataPartner.name} - মায়ের NID কার্ড`, url: selectedBioDataPartner.motherNidPhotoUrl! })}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">ছবি আপলোড নেই</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment History List */}
              {selectedBioDataPartner.investmentHistory && selectedBioDataPartner.investmentHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 border-b pb-1">
                    বিনিয়োগের কিস্তি ও জমার হিস্ট্রি
                  </h4>
                  <div className="space-y-1.5">
                    {selectedBioDataPartner.investmentHistory.map((hist) => (
                      <div key={hist.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{hist.note || 'বিনিয়োগ'}</span>
                          <span className="text-[11px] text-slate-400 block">{hist.date}</span>
                        </div>
                        <span className="font-black text-emerald-700 text-sm">+{formatCurrency(hist.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  const partnerToEdit = selectedBioDataPartner;
                  setSelectedBioDataPartner(null);
                  handleOpenEdit(partnerToEdit);
                }}
                className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition"
              >
                তথ্য পরিবর্তন / এডিট
              </button>
              <button
                onClick={() => setSelectedBioDataPartner(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PARTNER FORM (FULL BIO-DATA & DOCUMENT UPLOADS) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingPartner ? 'অংশীদারের বায়োডাটা ও তথ্য সংশোধন' : 'নতুন অংশীদারের পূর্ণাঙ্গ বায়োডাটা এন্ট্রি'}
                </h3>
                <p className="text-xs text-slate-400">ছবি, NID, পিতা-মাতার NID ও মূলধনের বিস্তারিত পূরণ করুন</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPartnerForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* SECTION: 1. মূল পরিচয় */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider border-b pb-1">
                  ১. প্রাথমিক পরিচয় ও পদবি
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অংশীদারের পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="যেমন: সুজিত গোরামি"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নাম্বার *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পদবি / ভূমিকা</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="যেমন: ব্যবস্থাপনা অংশীদার / পরিচালক"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পেশা (কি করেন)</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="যেমন: ব্যবসা / চাকরি / আইটি"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র নং (NID)</label>
                    <input
                      type="text"
                      value={formData.nidNumber}
                      onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                      placeholder="10 বা 17 ডিজিটের NID"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">যোগদানের তারিখ</label>
                    <input
                      type="date"
                      value={formData.joinedDate}
                      onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: 2. পারিবারিক ও ঠিকানা */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider border-b pb-1">
                  ২. পিতা-মাতার নাম ও ঠিকানা
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">বাবার নাম (Father's Name)</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="বাবার নাম লিখুন"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মায়ের নাম (Mother's Name)</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="মায়ের নাম লিখুন"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">ঠিকানা (গ্রাম, ডাকঘর, থানা, জেলা)</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="যেমন: ৩নং পশ্চিম ইলিশা, ভোলা সদর, ভোলা"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: 3. ছবি ও NID ডকুমেন্টস আপলোড */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider border-b pb-1 flex items-center justify-between">
                  <span>৩. অংশীদার, NID এবং পিতা-মাতার NID ফটো</span>
                  <span className="text-[10px] text-slate-500 font-normal">মোবাইল থেকে সরাসরি ছবি তুলুন বা গ্যালারি থেকে সিলেক্ট করুন</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Partner Photo */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">অংশীদারের প্রোফাইল ছবি</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border">
                        {formData.photoUrl ? (
                          <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={photoInputRef}
                          onChange={(e) => handleImageUpload(e, 'photoUrl')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs block"
                        >
                          {formData.photoUrl ? 'ছবি পরিবর্তন' : 'ছবি আপলোড'}
                        </button>
                        {formData.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photoUrl: '' })}
                            className="text-[10px] text-rose-600 font-semibold"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Partner NID */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">অংশীদারের NID কার্ডের ছবি</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border">
                        {formData.nidPhotoUrl ? (
                          <img src={formData.nidPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={nidInputRef}
                          onChange={(e) => handleImageUpload(e, 'nidPhotoUrl')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => nidInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs block"
                        >
                          {formData.nidPhotoUrl ? 'NID পরিবর্তন' : 'NID কার্ড আপলোড'}
                        </button>
                        {formData.nidPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, nidPhotoUrl: '' })}
                            className="text-[10px] text-rose-600 font-semibold"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Father's NID */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">বাবার NID কার্ডের ছবি</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border">
                        {formData.fatherNidPhotoUrl ? (
                          <img src={formData.fatherNidPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fatherNidInputRef}
                          onChange={(e) => handleImageUpload(e, 'fatherNidPhotoUrl')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fatherNidInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs block"
                        >
                          {formData.fatherNidPhotoUrl ? 'ছবি পরিবর্তন' : 'বাবার NID আপলোড'}
                        </button>
                        {formData.fatherNidPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, fatherNidPhotoUrl: '' })}
                            className="text-[10px] text-rose-600 font-semibold"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mother's NID */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">মায়ের NID কার্ডের ছবি</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border">
                        {formData.motherNidPhotoUrl ? (
                          <img src={formData.motherNidPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={motherNidInputRef}
                          onChange={(e) => handleImageUpload(e, 'motherNidPhotoUrl')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => motherNidInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs block"
                        >
                          {formData.motherNidPhotoUrl ? 'ছবি পরিবর্তন' : 'মায়ের NID আপলোড'}
                        </button>
                        {formData.motherNidPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, motherNidPhotoUrl: '' })}
                            className="text-[10px] text-rose-600 font-semibold"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: 4. মূলধন বিনিয়োগ ও অটো রেশিও */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider border-b pb-1">
                  ৪. মূলধন বিনিয়োগ (BDT)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোট বিনিয়োগকৃত মূলধন (BDT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-base">৳</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.investment}
                      onChange={(e) => setFormData({ ...formData, investment: e.target.value === '' ? '' : Number(e.target.value) })}
                      placeholder="যেমন: ১৫০০০০"
                      className="w-full pl-9 pr-3 py-2 border-2 border-slate-300 focus:border-emerald-600 rounded-xl text-base font-black text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 এই বিনিয়োগের ভিত্তিতে সিস্টেম স্বয়ংক্রিয়ভাবে ১০০% এর মধ্যে অংশীদারের অটো শেয়ার রেশিও নির্ধারণ করবে।
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingPartner ? 'পরিবর্তন সংরক্ষণ করুন' : 'অংশীদার সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD ADDITIONAL INVESTMENT */}
      {selectedPartnerForInvestment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">নতুন মূলধন বিনিয়োগ যুক্ত করুন</h3>
                <p className="text-xs text-white/80">{selectedPartnerForInvestment.name}</p>
              </div>
              <button onClick={() => setSelectedPartnerForInvestment(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvestmentSubmit} className="p-5 space-y-3.5 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিনিয়োগের টাকার পরিমাণ (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    placeholder="যেমন: ১২০০০০"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-base font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিনিয়োগের তারিখ *
                </label>
                <input
                  type="date"
                  required
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিনিয়োগের খাত / নোট *
                </label>
                <input
                  type="text"
                  required
                  value={invNote}
                  onChange={(e) => setInvNote(e.target.value)}
                  placeholder="যেমন: নতুন লাইন সংযোগ বা জাংগালিয়া বিস্তার"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForInvestment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: IMAGE PREVIEW MODAL */}
      {viewingImageModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
              <span>{viewingImageModal.title}</span>
              <button onClick={() => setViewingImageModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={viewingImageModal.url}
                alt={viewingImageModal.title}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <div className="p-3 bg-white flex justify-end">
              <button
                onClick={() => setViewingImageModal(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
