import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TransactionsTable } from './components/TransactionsTable';
import { StaffManagement } from './components/StaffManagement';
import { PartnersView } from './components/PartnersView';
import { CustomerDuesView } from './components/CustomerDuesView';
import { ReportsView } from './components/ReportsView';
import { TransactionModal } from './components/TransactionModal';
import { LoginModal } from './components/LoginModal';
import { BackupModal } from './components/BackupModal';
import { StaffQrModal } from './components/StaffQrModal';
import { CompanySetupModal } from './components/CompanySetupModal';
import { DigitalDisplayBoard } from './components/DigitalDisplayBoard';
import { DigitalTickerBar } from './components/DigitalTickerBar';
import { MobileInstallNotice } from './components/MobileInstallNotice';
import { OfficersView } from './components/OfficersView';
import { Maximize2, Menu } from 'lucide-react';

import {
  Transaction,
  Staff,
  Partner,
  Company,
  CustomerDue,
  AdminAuth,
  UserSession,
  TransactionType,
  DigitalNotice,
  AppointedOfficer,
  OfficersState
} from './types';

import {
  subscribeTransactions,
  subscribeStaffs,
  subscribePartners,
  subscribeCompany,
  subscribeCustomerDues,
  subscribeSettings,
  subscribeDigitalNotice,
  saveDigitalNotice,
  DEFAULT_DIGITAL_NOTICE,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addStaff,
  updateStaff,
  deleteStaff,
  addPartner,
  updatePartner,
  deletePartner,
  addPartnerInvestment,
  addCustomerDue,
  updateCustomerDue,
  deleteCustomerDue,
  updateCompany,
  seedInitialDataIfEmpty,
  generateCsvData,
  subscribeOfficers,
  appointOfficer,
  saveOfficers,
  DEFAULT_OFFICERS
} from './services/dataService';

import { getStoredSession, saveSession, logoutUser } from './services/authService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserSession>(getStoredSession());

  // Firestore real-time state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [customerDues, setCustomerDues] = useState<CustomerDue[]>([]);
  const [adminAuth, setAdminAuth] = useState<AdminAuth | null>(null);
  const [digitalNotice, setDigitalNotice] = useState<DigitalNotice>(DEFAULT_DIGITAL_NOTICE);
  const [officers, setOfficers] = useState<OfficersState>(DEFAULT_OFFICERS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Layout & Toolbar states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalDefaultType, setTxModalDefaultType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isStaffQrOpen, setIsStaffQrOpen] = useState(false);
  const [isCompanySetupOpen, setIsCompanySetupOpen] = useState(false);
  const [openAddStaffNonce, setOpenAddStaffNonce] = useState(0);

  // Initialize and Seed Firestore if empty
  const initData = useCallback(async (force = false) => {
    setIsSyncing(true);
    try {
      await seedInitialDataIfEmpty(force);
    } catch (e) {
      console.warn('Initial seed error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    initData(false);

    const unsubTx = subscribeTransactions((list) => setTransactions(list));
    const unsubStaff = subscribeStaffs((list) => setStaffs(list));
    const unsubPartners = subscribePartners((list) => setPartners(list));
    const unsubCompany = subscribeCompany((comp) => setCompany(comp));
    const unsubDues = subscribeCustomerDues((dues) => setCustomerDues(dues));
    const unsubSettings = subscribeSettings((sett) => setAdminAuth(sett));
    const unsubNotice = subscribeDigitalNotice((notice) => setDigitalNotice(notice));
    const unsubOfficers = subscribeOfficers((offs) => setOfficers(offs));

    return () => {
      unsubTx();
      unsubStaff();
      unsubPartners();
      unsubCompany();
      unsubDues();
      unsubSettings();
      unsubNotice();
      unsubOfficers();
    };
  }, [initData]);

  // Handle transaction save (create or update)
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => {
    if (txData.id) {
      await updateTransaction(txData.id, txData);
    } else {
      await addTransaction(txData);
    }
  };

  // Open transaction modal
  const handleOpenAddTxModal = (type: TransactionType) => {
    setEditingTx(null);
    setTxModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxModalDefaultType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleDeleteTx = async (id: string) => {
    await deleteTransaction(id);
  };

  // Staff Salary Payment Quick Entry
  const handlePayStaffSalary = (staff: Staff) => {
    setEditingTx(null);
    setTxModalDefaultType('expense');
    setIsTxModalOpen(true);
    setTimeout(() => {
      setEditingTx({
        id: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        title: `${staff.name} (স্টাফ বেতন ও ভাতা)`,
        category: 'স্টাফ বেতন ও ভাতা',
        amount: staff.salary,
        paymentMethod: 'cash',
        addedBy: currentUser.name,
        addedById: currentUser.id,
        note: `মাসিক বেতন পরিশোধ - ${staff.designation}`,
        createdAt: new Date().toISOString()
      });
    }, 50);
  };

  // Customer Due Payment Collection
  const handleCollectCustomerDue = async (due: CustomerDue, amount: number, paymentMethod: string) => {
    const newPaid = (due.paidAmount || 0) + amount;
    const newCurrent = Math.max(0, (due.totalDue || 0) - newPaid);

    await updateCustomerDue(due.id, {
      paidAmount: newPaid,
      currentDue: newCurrent,
      notes: `${due.notes ? due.notes + ' | ' : ''}আদায়: ৳${amount} (${new Date().toISOString().split('T')[0]})`
    });

    await addTransaction({
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      title: `${due.customerName} - বকেয়া বিল আদায়`,
      category: 'গ্রাহক মাসিক বিল কালেকশন',
      amount,
      paymentMethod,
      addedBy: currentUser.name,
      addedById: currentUser.id,
      note: `গ্রাহক বিল কালেকশন - ${due.address || ''}`
    });
  };

  // Export CSV in user format
  const handleExportCsv = (monthStr?: string) => {
    const listToExport = monthStr
      ? transactions.filter((t) => t.date && t.date.startsWith(monthStr))
      : transactions;

    const csvContent = generateCsvData(listToExport, company?.name || 'DIP BHOLA NETWORK', monthStr);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hisab_khata_${monthStr || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoginSuccess = (session: UserSession) => {
    saveSession(session);
    setCurrentUser(session);
  };

  const handleLogout = async () => {
    await logoutUser();
    const fallback = getStoredSession();
    setCurrentUser(fallback);
    setIsLoginModalOpen(true);
  };

  // Action Bar Handlers
  const handleOpenAddStaff = () => {
    setActiveTab('staff');
    setOpenAddStaffNonce((n) => n + 1);
  };

  const handleOpenMonthlyPdf = () => {
    setActiveTab('reports');
    setTimeout(() => {
      window.print();
    }, 350);
  };

  // Calculate Net Balance for Sidebar Stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 0. Mobile PWA WebAPK Install Notice */}
      <MobileInstallNotice />

      {/* 1. TOP BAR (Shown unless full screen is toggled) */}
      {!isFullScreen ? (
        <Header
          company={company}
          onToggleSidebar={() => setIsSidebarOpenMobile(true)}
          onToggleFullScreen={() => setIsFullScreen(true)}
          isFullScreen={isFullScreen}
        />
      ) : (
        /* Floating mini-restore bar when topbar is hidden */
        <div className="bg-[#032d20] text-emerald-100 px-4 py-1.5 flex items-center justify-between text-xs border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpenMobile(true)}
              className="lg:hidden p-1 rounded-lg bg-emerald-900 text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="font-bold text-white tracking-wide">{company?.name || 'DIP BHOLA NETWORK'}</span>
            <span className="hidden sm:inline text-emerald-400">• ফুল স্ক্রিন মোড চালু</span>
          </div>
          <button
            onClick={() => setIsFullScreen(false)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors border border-emerald-600"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
            <span>টপবার দেখান</span>
          </button>
        </div>
      )}

      {/* 2. MAIN LAYOUT: Left Sidebar (Separate Bars) + Right Content Area */}
      <div className="flex-1 flex min-h-0">
        
        {/* Left Side Bars (বাম পাশে আলাদা আলাদা বার) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          isFullScreen={isFullScreen}
          onToggleFullScreen={() => setIsFullScreen((prev) => !prev)}
          onOpenStaffQr={() => setIsStaffQrOpen(true)}
          onOpenMonthlyPdf={handleOpenMonthlyPdf}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          onOpenCompanySetup={() => setIsCompanySetupOpen(true)}
          onOpenAddStaff={handleOpenAddStaff}
          onLogout={handleLogout}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          stats={{
            txCount: transactions.length,
            staffCount: staffs.length,
            duesCount: customerDues.filter((d) => (d.currentDue || 0) > 0).length,
            netBalance
          }}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Persistent Digital LED Ticker Marquee Bar */}
          <DigitalTickerBar
            notice={digitalNotice}
            company={company}
            partners={partners}
            transactions={transactions}
            onOpenDisplayTab={() => setActiveTab('display')}
          />

          {/* Main Body Content View */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
            {activeTab === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                staffs={staffs}
                partners={partners}
                company={company}
                currentUser={currentUser}
                onOpenAddModal={handleOpenAddTxModal}
                onViewAllTransactions={() => setActiveTab('transactions')}
                onViewStaff={() => setActiveTab('staff')}
                onViewPartners={() => setActiveTab('partners')}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTable
                transactions={transactions}
                currentUser={currentUser}
                onOpenAddModal={handleOpenAddTxModal}
                onEditTransaction={handleEditTx}
                onDeleteTransaction={handleDeleteTx}
                onExportCsv={() => handleExportCsv()}
              />
            )}

            {activeTab === 'staff' && (
              <StaffManagement
                staffs={staffs}
                transactions={transactions}
                currentUser={currentUser}
                company={company}
                onAddStaff={async (s) => { await addStaff(s); }}
                onUpdateStaff={updateStaff}
                onDeleteStaff={deleteStaff}
                onPaySalary={handlePayStaffSalary}
                openAddModalNonce={openAddStaffNonce}
              />
            )}

            {activeTab === 'partners' && (
              <PartnersView
                partners={partners}
                transactions={transactions}
                company={company}
                currentUser={currentUser}
                onAddPartner={async (p) => { await addPartner(p); }}
                onUpdatePartner={updatePartner}
                onDeletePartner={deletePartner}
                onAddInvestment={addPartnerInvestment}
              />
            )}

            {activeTab === 'dues' && (
              <CustomerDuesView
                customerDues={customerDues}
                currentUser={currentUser}
                onAddCustomerDue={async (d) => { await addCustomerDue(d); }}
                onUpdateCustomerDue={updateCustomerDue}
                onDeleteCustomerDue={deleteCustomerDue}
                onCollectPayment={handleCollectCustomerDue}
              />
            )}

            {activeTab === 'display' && (
              <DigitalDisplayBoard
                notice={digitalNotice}
                currentUser={currentUser}
                company={company}
                partners={partners}
                transactions={transactions}
                onSaveNotice={saveDigitalNotice}
              />
            )}

            {activeTab === 'officers' && (
              <OfficersView
                officers={officers}
                staffs={staffs}
                company={company}
                currentUser={currentUser}
                onAppointOfficer={async (type, data) => {
                  await appointOfficer(type, data, officers);
                }}
                onSaveAllOfficers={saveOfficers}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                transactions={transactions}
                company={company}
                partners={partners}
                staffs={staffs}
                officers={officers}
                onExportCsv={handleExportCsv}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500 print:hidden mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                © 2026 <span className="font-bold text-slate-800">{company?.name || 'DIP BHOLA NETWORK'}</span>. সর্বস্বত্ব সংরক্ষিত।
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                পরিচালক: {company?.ownerName || 'জাহিদুল ইসলাম'} • {company?.address || '৩নং পশ্চিম ইলিশা।ভোলা সদর ভোলা'}
              </div>
            </div>
          </footer>
        </div>

      </div>

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTx={editingTx}
        currentUser={currentUser}
        defaultType={txModalDefaultType}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        staffs={staffs}
        adminAuth={adminAuth}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        company={company}
        partners={partners}
        staffs={staffs}
        transactions={transactions}
        customerDues={customerDues}
        adminAuth={adminAuth}
        onRefreshData={() => initData(true)}
      />

      {/* Staff QR Code Modal */}
      <StaffQrModal
        isOpen={isStaffQrOpen}
        onClose={() => setIsStaffQrOpen(false)}
        staffs={staffs}
        company={company}
      />

      {/* Company Setup Modal */}
      <CompanySetupModal
        isOpen={isCompanySetupOpen}
        onClose={() => setIsCompanySetupOpen(false)}
        company={company}
        onSaveCompany={async (comp) => { await updateCompany(comp); }}
        currentUser={currentUser}
      />
    </div>
  );
}
