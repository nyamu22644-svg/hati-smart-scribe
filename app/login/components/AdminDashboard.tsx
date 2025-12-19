import React, { useState, useEffect, useMemo } from 'react';
import { db, signOut, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { 
  Users, 
  Crown, 
  Search, 
  MoreVertical, 
  Ban, 
  Zap, 
  Eye, 
  Terminal, 
  LogOut,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Activity,
  User,
  DollarSign,
  TrendingDown,
  BarChart3,
  Calendar,
  Edit2,
  Save,
  X as XIcon,
  Settings,
  MessageCircle,
  Mail,
  Lock,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Percent,
  Clock,
  FileText,
  Tag,
  Send,
  Users as UsersIcon,
  Trash,
  Lightbulb,
  Zap as ZapIcon,
  MessageSquare
} from 'lucide-react';
import { APP_CONFIG } from '@/constants/appConfig';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';

interface AdminDashboardProps {
  onExit: () => void;
}

type UserRecord = {
  uid: string;
  email?: string;
  displayName?: string;
  role?: string;
  plan?: string;
  createdAt?: any;
  lastActive?: any;
  [key: string]: any;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'users' | 'revenue' | 'analytics' | 'plans' | 'features' | 'tiers' | 'payments' | 'config' | 'promo' | 'bulk' | 'audit' | 'marketing' | 'settings'>('users');
  const [settings, setSettings] = useState({
    whatsappNumber: APP_CONFIG.SUPPORT_WHATSAPP,
    supportEmail: APP_CONFIG.SUPPORT_EMAIL,
    autoLockTimeoutMs: APP_CONFIG.AUTO_LOCK_TIMEOUT_MS,
    currency: APP_CONFIG.DEFAULT_CURRENCY
  });
  const [editingSettings, setEditingSettings] = useState(false);
  const [editingPlans, setEditingPlans] = useState<{[key: string]: any}>({});
  const [tiers, setTiers] = useState<any>({
    essential: {
      id: 'essential',
      name: 'Essential Plan',
      features: {
        can_use_biometrics: false,
        storage_limit: 5,
        max_vaults: 1,
        family_profiles: false,
        guardian_protocol: false
      }
    },
    guardian: {
      id: 'guardian',
      name: 'Guardian Plan',
      features: {
        can_use_biometrics: true,
        storage_limit: 100,
        max_vaults: 10,
        family_profiles: true,
        guardian_protocol: true
      }
    }
  });
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([
    {
      id: 'txn_001',
      userId: 'user123',
      userEmail: 'user@example.com',
      amount: 299,
      plan: 'guardian',
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: Date.now() - 86400000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'txn_002',
      userId: 'user456',
      userEmail: 'guardian@example.com',
      amount: 2999,
      plan: 'guardian',
      status: 'completed',
      paymentMethod: 'Stripe',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'txn_003',
      userId: 'user789',
      userEmail: 'pending@example.com',
      amount: 299,
      plan: 'guardian',
      status: 'pending',
      paymentMethod: 'M-Pesa',
      createdAt: Date.now() - 3600000
    }
  ]);
  const [businessConfig, setBusinessConfig] = useState({
    // Pricing
    essentialPrice: 0,
    guardianMonthlyPrice: 299,
    guardianYearlyPrice: 2999,
    yearlyDiscountPercent: 20,
    // Currency
    currency: 'KES',
    currencySymbol: 'Ksh',
    // Plans
    plans: [
      {
        id: 'essential',
        name: 'Essential Plan',
        features: 'Basic Vault Storage, Standard AI Extraction, Single Registry Profile, Email Support'
      },
      {
        id: 'guardian',
        name: 'Guardian Plan',
        features: 'Unlimited Scribe AI, Biometric Hardware Lock, Family Profile Registry, Risk Detection, PDF Reports, 24/7 WhatsApp'
      }
    ],
    // Trial & Renewal
    trialDaysEssential: 0,
    trialDaysGuardian: 14,
    autoRenewEnabled: true,
    // Payment Methods
    paymentMethods: {
      mpesa: true,
      stripe: true,
      intasend: true,
      paypal: false
    },
    // Business Settings
    taxRate: 0,
    refundWindowDays: 14,
    supportTicketResponse: '24 hours'
  });
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, admin: 'maitgait089@gmail.com', action: 'Elevated user to premium', target: 'user123', timestamp: Date.now() - 3600000 },
    { id: 2, admin: 'maitgait089@gmail.com', action: 'Updated pricing: Guardian 299→349', target: 'config', timestamp: Date.now() - 86400000 },
    { id: 3, admin: 'maitgait089@gmail.com', action: 'Banned user account', target: 'user456', timestamp: Date.now() - 172800000 },
    { id: 4, admin: 'maitgait089@gmail.com', action: 'Created promo code: SAVE20', target: 'promo', timestamp: Date.now() - 259200000 }
  ]);
  const [promoCodes, setPromoCodes] = useState([
    { id: 'SAVE20', code: 'SAVE20', discountPercent: 20, discountAmount: 0, maxUses: 100, usedCount: 35, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), active: true, applicablePlans: ['guardian'] },
    { id: 'WELCOME14', code: 'WELCOME14', discountPercent: 100, discountAmount: 0, maxUses: 1000, usedCount: 543, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), active: true, applicablePlans: ['guardian'] },
    { id: 'REFER50', code: 'REFER50', discountPercent: 0, discountAmount: 50, maxUses: 500, usedCount: 187, expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), active: false, applicablePlans: ['guardian'] }
  ]);
  const [newPromoCode, setNewPromoCode] = useState({ code: '', discountPercent: 0, discountAmount: 0, maxUses: 100, expiryDays: 30 });
  const [bulkMessage, setBulkMessage] = useState({ title: '', message: '', targetSegment: 'all', channel: 'email' });
  const [marketingConfig, setMarketingConfig] = useState({
    // Paywall Messaging
    paywallTitle: 'Guardian Feature Locked',
    paywallSubtitle: 'Upgrade to Guardian to unlock this premium capability',
    ctaText: 'Unlock Now',
    // FOMO Messages
    fomoMessages: [
      { id: 1, trigger: 'login_count_3', message: 'You\'ve logged in 3 times - most users upgrade after their 5th login!', enabled: true },
      { id: 2, trigger: 'document_count_5', message: 'You have 5 documents - Guardian users store up to 100+ with unlimited AI analysis!', enabled: true },
      { id: 3, trigger: 'time_on_platform_7days', message: 'You\'ve been with us a week - it\'s time to unlock the full HATI experience!', enabled: true },
      { id: 4, trigger: 'feature_attempt_family', message: 'Family profiles are essential for protecting your loved ones\' medical history', enabled: true }
    ],
    // Feature Comparison
    featureComparison: [
      { feature: 'Vault Storage', essential: '5 MB', guardian: 'Unlimited' },
      { feature: 'AI Scribe', essential: '10/month', guardian: 'Unlimited' },
      { feature: 'Family Profiles', essential: '1 (You)', guardian: 'Unlimited' },
      { feature: 'Biometric Lock', essential: '❌', guardian: '✅' },
      { feature: 'Guardian Protocol', essential: '❌', guardian: '✅' },
      { feature: 'PDF Reports', essential: '❌', guardian: '✅' },
      { feature: '24/7 WhatsApp', essential: 'Email only', guardian: '✅' }
    ],
    // Upgrade Triggers
    upgradeTriggers: [
      { id: 'on_feature_lock', label: 'When user hits feature limit', enabled: true },
      { id: 'on_document_milestone', label: 'After 5 documents uploaded', enabled: true },
      { id: 'on_7day_active', label: '7 days of platform activity', enabled: true },
      { id: 'on_failed_action', label: 'When trying locked feature', enabled: true }
    ],
    // Onboarding
    onboardingMessages: {
      welcome: 'Welcome to HATI - Your personal medical vault. Secure, encrypted, forever.',
      day1: 'Tip: Upload your first medical record to get started',
      day3: 'Did you know? Most users upgrade within 3 days!',
      day7: 'Ready to protect your family\'s health?'
    },
    // Conversion Targeting
    targetSegment: 'free_users_active_7days',
    messagingType: 'fomo' // or 'value_prop', 'urgency', 'social_proof'
  });

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() })) as UserRecord[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const stats = useMemo(() => {
    const premiumUsers = users.filter(u => u.isPremium);
    const totalRevenue = premiumUsers.reduce((sum, u) => {
      // Assume 2999 KES for yearly, 499 KES for monthly
      return sum + (u.plan === 'guardian' ? (u.expiryDate ? 2999 : 499) : 0);
    }, 0);
    
    return {
      total: users.length,
      premium: premiumUsers.length,
      active24h: users.filter(u => u.lastLogin && Date.now() - u.lastLogin < 86400000).length,
      totalRevenue: totalRevenue,
      conversionRate: users.length > 0 ? ((premiumUsers.length / users.length) * 100).toFixed(1) : '0'
    };
  }, [users]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePromote = async (uid: string) => {
    await updateDoc(doc(db, "users", uid), {
      isPremium: true,
      plan: 'guardian',
      updatedAt: Date.now()
    });
    setActiveMenu(null);
  };

  const handleBan = async (uid: string) => {
    await updateDoc(doc(db, "users", uid), {
      status: 'banned',
      updatedAt: Date.now()
    });
    setActiveMenu(null);
    alert(`HATI_AUTHORITY: User ${uid} has been restricted from the registry.`);
  };

  const handleImpersonate = (uid: string) => {
    sessionStorage.setItem('hati_impersonate_uid', uid);
    window.location.href = '/';
  };

  const handleEditStart = (user: UserRecord) => {
    setEditingUser(user.uid);
    setEditData(user);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    await updateDoc(doc(db, "users", editingUser), {
      ...editData,
      updatedAt: Date.now()
    });
    setEditingUser(null);
    setActiveMenu(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-navy text-white px-8 py-4 border-b-4 border-gold sticky top-0 z-50 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-gold p-2 rounded-xl">
            <Terminal className="text-navy w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-black tracking-tighter">MISSION CONTROL</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gold/50">Registry Authority Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Exit Terminal
          </button>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 sticky top-16 z-40">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'plans', label: 'Plans', icon: Crown },
            { id: 'features', label: 'Features', icon: ShieldCheck },
            { id: 'tiers', label: 'Tiers', icon: Zap },
            { id: 'payments', label: 'Transactions', icon: CreditCard },
            { id: 'config', label: 'Business Config', icon: Sliders },
            { id: 'promo', label: 'Promo Codes', icon: Tag },
            { id: 'marketing', label: 'Growth Marketing', icon: TrendingUp },
            { id: 'bulk', label: 'Campaigns', icon: Send },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 font-bold text-sm uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-navy border-gold'
                  : 'text-slate-400 border-transparent hover:text-navy'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Stats Grid - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', val: stats.total, icon: Users, color: 'text-blue-500' },
            { label: 'Premium Members', val: stats.premium, icon: Crown, color: 'text-gold' },
            { label: 'Active (24h)', val: stats.active24h, icon: Activity, color: 'text-emerald-500' },
            { label: 'Conversion Rate', val: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-purple-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-2 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                 <stat.icon className="w-24 h-24" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
               <p className="text-3xl font-serif font-black text-navy">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-2xl font-serif font-black text-navy flex items-center gap-3">
                <UserCheck className="text-gold w-8 h-8" /> User Registry
              </h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search UID, Name, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-gold/20 w-full md:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold">Loading registry...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Created</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Last Active</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy font-black text-xl">
                              {u.name?.charAt(0) || u.email?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-navy">{u.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.isPremium ? 'bg-gold/10 text-gold' : 'bg-slate-100 text-slate-400'}`}>
                            {u.isPremium ? <Crown className="w-3 h-3" /> : null}
                            {u.isPremium ? 'Guardian' : 'Essential'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-600">
                            {u.createdAt ? new Date(u.createdAt as any).toLocaleDateString() : '—'}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-600">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === u.uid ? null : u.uid)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </button>

                          {activeMenu === u.uid && (
                            <div className="absolute right-8 top-16 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-10">
                              <button 
                                onClick={() => handleEditStart(u)}
                                className="w-full text-left px-5 py-3 text-sm font-bold text-navy hover:bg-slate-50 flex items-center gap-3"
                              >
                                <Edit2 className="w-4 h-4 text-blue-500" /> Edit User
                              </button>
                              <button 
                                onClick={() => handlePromote(u.uid)}
                                disabled={u.isPremium}
                                className="w-full text-left px-5 py-3 text-sm font-bold text-navy hover:bg-slate-50 flex items-center gap-3 disabled:opacity-30"
                              >
                                <Zap className="w-4 h-4 text-gold fill-gold" /> Promote to Premium
                              </button>
                              <button 
                                onClick={() => handleImpersonate(u.uid)}
                                className="w-full text-left px-5 py-3 text-sm font-bold text-navy hover:bg-slate-50 flex items-center gap-3"
                              >
                                <Eye className="w-4 h-4 text-emerald-500" /> View As User
                              </button>
                              <div className="h-px bg-slate-50 my-2" />
                              <button 
                                onClick={() => handleBan(u.uid)}
                                className="w-full text-left px-5 py-3 text-sm font-bold text-crimson hover:bg-rose-50 flex items-center gap-3"
                              >
                                <Ban className="w-4 h-4" /> Ban User
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {filteredUsers.length === 0 && !loading && (
              <div className="py-20 text-center space-y-4">
                 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                   <Search className="w-8 h-8 text-slate-200" />
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching identities found</p>
              </div>
            )}
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-black text-navy">Total Revenue</h3>
                <DollarSign className="w-6 h-6 text-gold" />
              </div>
              <p className="text-5xl font-serif font-black text-gold">KES {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-slate-500 font-medium">From {stats.premium} premium members</p>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-black text-navy">MRR Potential</h3>
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-5xl font-serif font-black text-emerald-500">KES {(stats.premium * 499).toLocaleString()}</p>
              <p className="text-sm text-slate-500 font-medium">If all premium renew monthly</p>
            </div>

            <div className="md:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-serif font-black text-navy mb-6">Premium Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Monthly Plan (499 KES)', count: users.filter(u => u.isPremium && !u.expiryDate).length },
                  { label: 'Yearly Plan (2999 KES)', count: users.filter(u => u.isPremium && u.expiryDate).length },
                  { label: 'Free Tier Users', count: users.filter(u => !u.isPremium).length }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-navy">{item.label}</span>
                    <span className="text-2xl font-black text-gold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-6">
              <h3 className="text-xl font-serif font-black text-navy">Growth Metrics</h3>
              {[
                { label: 'Total Users', value: stats.total, change: '+12%' },
                { label: 'Premium Members', value: stats.premium, change: '+8%' },
                { label: 'Conversion Rate', value: `${stats.conversionRate}%`, change: '+2.3%' },
                { label: 'Active Today', value: stats.active24h, change: '+15%' }
              ].map((metric, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{metric.label}</p>
                    <p className="text-2xl font-black text-navy">{metric.value}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                      <TrendingUp className="w-3 h-3" /> {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-4">
              <h3 className="text-xl font-serif font-black text-navy">Platform Health</h3>
              <div className="space-y-4">
                {[
                  { label: 'System Uptime', value: '99.9%', color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'API Response Time', value: '245ms', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Database Connections', value: '8/100', color: 'bg-purple-50 text-purple-600' },
                  { label: 'Active Sessions', value: stats.active24h, color: 'bg-gold/10 text-gold' }
                ].map((metric, i) => (
                  <div key={i} className={`p-4 ${metric.color} rounded-2xl flex items-center justify-between`}>
                    <p className="font-bold text-sm">{metric.label}</p>
                    <p className="text-xl font-black">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* PLANS TAB */}
        {activeTab === 'plans' && (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
            <h3 className="text-2xl font-serif font-black text-navy mb-8">Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div key={plan.id} className={`p-8 rounded-[24px] border-2 space-y-6 ${
                  plan.recommended 
                    ? 'border-gold bg-gold/5 shadow-lg' 
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-navy">{plan.name}</h4>
                    {plan.recommended && <Crown className="w-5 h-5 text-gold" />}
                  </div>
                  
                  <div>
                    <p className="text-4xl font-black text-navy">{plan.price === 0 ? 'Free' : `KES ${plan.price}`}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{plan.currency}/month</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Features:</p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Highlight Color: {plan.highlightColor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8">Feature Catalog</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'can_use_biometrics', label: 'Biometric Authentication', desc: 'WebAuthn passkeys & fingerprint auth' },
                  { key: 'family_profiles', label: 'Family Profiles', desc: 'Create profiles for family members' },
                  { key: 'guardian_protocol', label: 'Guardian Protocol', desc: 'Designate guardians for medical decisions' },
                  { key: 'secure_camera_mode', label: 'Secure Document Scanner', desc: 'Batch scan & encrypt documents to PDF' },
                  { key: 'max_vaults', label: 'Vault Storage', desc: 'Maximum number of vault instances' },
                  { key: 'storage_limit', label: 'Storage Capacity', desc: 'Maximum storage per user (GB)' },
                  { key: 'priority_support', label: 'Priority Support', desc: '24/7 WhatsApp concierge support' }
                ].map((feature) => (
                  <div key={feature.key} className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-gold" />
                      <h4 className="font-black text-navy">{feature.label}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-serif font-black text-navy mb-6 flex items-center gap-3">
                <Crown className="w-6 h-6 text-gold" />
                Plans to Features Mapping
              </h3>
              <div className="space-y-4">
                {['essential', 'guardian'].map((planId) => (
                  <div key={planId} className="p-6 bg-slate-50 rounded-[24px] border border-slate-200">
                    <p className="font-black text-navy mb-3 capitalize">{planId} Plan Includes:</p>
                    <ul className="space-y-2">
                      {tiers[planId]?.features && Object.entries(tiers[planId].features).map(([key, value]: any) => (
                        <li key={key} className="text-sm font-medium text-slate-600 flex items-center gap-2">
                          {value ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-300" />}
                          <span>{key.replace(/_/g, ' ')}: {typeof value === 'boolean' ? (value ? '✓ Enabled' : '✗ Disabled') : value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIERS TAB */}
        {activeTab === 'tiers' && (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif font-black text-navy">Product Tiers Configuration</h3>
              <button
                onClick={() => setEditingTier(editingTier ? null : 'guardian')}
                className={`p-2 rounded-xl transition-all ${editingTier ? 'bg-gold/10 text-gold' : 'bg-slate-100 text-slate-400'}`}
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(tiers).map(([tierId, tier]: any) => (
                <div key={tierId} className={`p-8 rounded-[24px] border-2 space-y-6 ${
                  tierId === 'guardian' ? 'border-gold bg-gold/5' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-navy capitalize">{tier.name}</h4>
                    <button
                      onClick={() => setEditingTier(editingTier === tierId ? null : tierId)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(tier.features).map(([featureKey, value]: any) => (
                      <div key={featureKey} className={`p-3 rounded-xl ${
                        editingTier === tierId 
                          ? 'bg-white border-2 border-gold/30' 
                          : 'bg-slate-50 border border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest capitalize">
                            {featureKey.replace(/_/g, ' ')}
                          </label>
                          {editingTier === tierId ? (
                            typeof value === 'boolean' ? (
                              <button
                                onClick={() => setTiers({
                                  ...tiers,
                                  [tierId]: {
                                    ...tier,
                                    features: { ...tier.features, [featureKey]: !value }
                                  }
                                })}
                                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                                  value ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {value ? 'ON' : 'OFF'}
                              </button>
                            ) : (
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => setTiers({
                                  ...tiers,
                                  [tierId]: {
                                    ...tier,
                                    features: { ...tier.features, [featureKey]: parseInt(e.target.value) }
                                  }
                                })}
                                className="w-16 px-2 py-1 border border-gold/30 rounded-lg font-bold text-sm"
                              />
                            )
                          ) : (
                            <span className="font-black text-navy">
                              {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingTier === tierId && (
                    <button
                      onClick={() => {
                        alert(`Tier updated: ${JSON.stringify(tier, null, 2)}`);
                        setEditingTier(null);
                      }}
                      className="w-full bg-navy text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Tier
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Payment Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Transactions</div>
                <div className="text-3xl font-black text-navy">{transactions.length}</div>
                <div className="text-xs text-emerald-600 font-bold mt-2">All time</div>
              </div>
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Completed</div>
                <div className="text-3xl font-black text-emerald-600">{transactions.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-slate-600 font-bold mt-2">Ready for use</div>
              </div>
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pending</div>
                <div className="text-3xl font-black text-amber-600">{transactions.filter(t => t.status === 'pending').length}</div>
                <div className="text-xs text-slate-600 font-bold mt-2">Awaiting confirmation</div>
              </div>
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</div>
                <div className="text-3xl font-black text-gold">
                  Ksh {transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-600 font-bold mt-2">Confirmed payments</div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gold" />
                Payment Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Transaction ID</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">User Email</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Amount (KES)</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Plan</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Method</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Status</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Date</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                        <td className="text-xs font-mono font-bold text-navy py-4 px-4">{txn.id}</td>
                        <td className="text-xs font-medium text-slate-600 py-4 px-4">{txn.userEmail}</td>
                        <td className="text-sm font-black text-gold py-4 px-4">{txn.amount.toLocaleString()}</td>
                        <td className="text-xs font-black text-slate-700 uppercase py-4 px-4 capitalize">{txn.plan}</td>
                        <td className="text-xs font-bold text-slate-600 py-4 px-4">{txn.paymentMethod}</td>
                        <td className="text-xs font-black py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${
                            txn.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : txn.status === 'pending'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="text-xs text-slate-600 py-4 px-4">
                          {new Date(txn.createdAt).toLocaleDateString('en-KE')}
                        </td>
                        <td className="text-xs text-slate-600 py-4 px-4">
                          {txn.expiryDate ? new Date(txn.expiryDate).toLocaleDateString('en-KE') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods Accepted */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-serif font-black text-navy mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gold" />
                  Accepted Payment Methods
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="w-2 h-2 bg-navy rounded-full"></span>
                    M-Pesa (Mobile Money)
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="w-2 h-2 bg-navy rounded-full"></span>
                    Stripe (International Cards)
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="w-2 h-2 bg-navy rounded-full"></span>
                    IntaSend (Payment Gateway)
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="w-2 h-2 bg-navy rounded-full"></span>
                    PayPal (Coming Soon)
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-serif font-black text-navy mb-6 flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Pricing Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-black text-navy">Guardian Monthly</p>
                      <p className="text-[10px] text-slate-500 font-bold">Recurring</p>
                    </div>
                    <p className="text-2xl font-black text-gold">299 KES</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-black text-navy">Guardian Yearly</p>
                      <p className="text-[10px] text-slate-500 font-bold">20% discount applied</p>
                    </div>
                    <p className="text-2xl font-black text-gold">2,999 KES</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-black text-navy">Essential Plan</p>
                      <p className="text-[10px] text-slate-500 font-bold">Forever free</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-600">Free</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS CONFIG TAB */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Pricing Configuration */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-gold" />
                Pricing Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Essential Plan Price
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-navy">{businessConfig.currencySymbol}</span>
                    <input
                      type="number"
                      value={businessConfig.essentialPrice}
                      onChange={(e) => setBusinessConfig({...businessConfig, essentialPrice: parseInt(e.target.value) || 0})}
                      className="flex-1 px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Guardian Monthly
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-navy">{businessConfig.currencySymbol}</span>
                    <input
                      type="number"
                      value={businessConfig.guardianMonthlyPrice}
                      onChange={(e) => setBusinessConfig({...businessConfig, guardianMonthlyPrice: parseInt(e.target.value) || 0})}
                      className="flex-1 px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Guardian Yearly
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-navy">{businessConfig.currencySymbol}</span>
                    <input
                      type="number"
                      value={businessConfig.guardianYearlyPrice}
                      onChange={(e) => setBusinessConfig({...businessConfig, guardianYearlyPrice: parseInt(e.target.value) || 0})}
                      className="flex-1 px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 rounded-[24px] border border-emerald-200 space-y-3">
                  <label className="text-xs font-black text-emerald-600 uppercase tracking-widest">Yearly Discount</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={businessConfig.yearlyDiscountPercent}
                      onChange={(e) => setBusinessConfig({...businessConfig, yearlyDiscountPercent: parseInt(e.target.value) || 0})}
                      className="flex-1 px-4 py-3 border border-emerald-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                    <span className="font-black text-emerald-600">%</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold">Savings: {businessConfig.currencySymbol} {Math.round(businessConfig.guardianMonthlyPrice * 12 * businessConfig.yearlyDiscountPercent / 100)}</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Currency</label>
                  <select
                    value={businessConfig.currency}
                    onChange={(e) => setBusinessConfig({...businessConfig, currency: e.target.value})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  >
                    <option>KES</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Currency Symbol</label>
                  <input
                    type="text"
                    value={businessConfig.currencySymbol}
                    onChange={(e) => setBusinessConfig({...businessConfig, currencySymbol: e.target.value})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            {/* Plan Features Configuration */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-gold" />
                Plan Features
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businessConfig.plans.map((plan, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-4">
                    <h4 className="text-lg font-black text-navy">{plan.name}</h4>
                    <textarea
                      value={plan.features}
                      onChange={(e) => {
                        const newPlans = [...businessConfig.plans];
                        newPlans[idx].features = e.target.value;
                        setBusinessConfig({...businessConfig, plans: newPlans});
                      }}
                      className="w-full px-4 py-3 border border-gold/30 rounded-xl font-medium h-32 focus:ring-2 focus:ring-gold/20 outline-none text-sm"
                      placeholder="Feature 1, Feature 2, Feature 3..."
                    />
                    <p className="text-[10px] text-slate-500 font-medium">Comma-separated feature list</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trial & Renewal Settings */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <Clock className="w-6 h-6 text-gold" />
                Trial & Renewal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Essential Trial Days</label>
                  <input
                    type="number"
                    value={businessConfig.trialDaysEssential}
                    onChange={(e) => setBusinessConfig({...businessConfig, trialDaysEssential: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Guardian Trial Days</label>
                  <input
                    type="number"
                    value={businessConfig.trialDaysGuardian}
                    onChange={(e) => setBusinessConfig({...businessConfig, trialDaysGuardian: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Refund Window (Days)</label>
                  <input
                    type="number"
                    value={businessConfig.refundWindowDays}
                    onChange={(e) => setBusinessConfig({...businessConfig, refundWindowDays: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tax Rate</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={businessConfig.taxRate}
                      onChange={(e) => setBusinessConfig({...businessConfig, taxRate: parseFloat(e.target.value) || 0})}
                      step="0.1"
                      className="flex-1 px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                    <span className="font-black text-navy">%</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-[24px] border border-amber-200 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-black text-navy mb-1">Auto-Renewal Enabled</p>
                  <p className="text-xs text-slate-600 font-medium">Automatically renew subscriptions on expiry date</p>
                </div>
                <button
                  onClick={() => setBusinessConfig({...businessConfig, autoRenewEnabled: !businessConfig.autoRenewEnabled})}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    businessConfig.autoRenewEnabled 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {businessConfig.autoRenewEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gold" />
                Accepted Payment Methods
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'mpesa', label: 'M-Pesa (Mobile Money)', icon: '📱' },
                  { key: 'stripe', label: 'Stripe (Cards)', icon: '💳' },
                  { key: 'intasend', label: 'IntaSend (Gateway)', icon: '🔗' },
                  { key: 'paypal', label: 'PayPal', icon: '🅿️' }
                ].map((method) => (
                  <button
                    key={method.key}
                    onClick={() => setBusinessConfig({
                      ...businessConfig,
                      paymentMethods: {
                        ...businessConfig.paymentMethods,
                        [method.key]: !businessConfig.paymentMethods[method.key as keyof typeof businessConfig.paymentMethods]
                      }
                    })}
                    className={`p-4 rounded-[24px] border-2 font-bold transition-all flex items-center justify-between ${
                      businessConfig.paymentMethods[method.key as keyof typeof businessConfig.paymentMethods]
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>{method.icon} {method.label}</span>
                    {businessConfig.paymentMethods[method.key as keyof typeof businessConfig.paymentMethods] ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Save All Config */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  alert(`Business Config Updated:\n\n${JSON.stringify(businessConfig, null, 2)}`);
                }}
                className="flex-1 bg-navy text-white font-bold py-4 rounded-[24px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save All Configuration
              </button>
              <button
                onClick={() => {
                  alert(`Configuration would be exported as JSON and saved to Firestore`);
                }}
                className="flex-1 bg-gold text-navy font-bold py-4 rounded-[24px] hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Export & Backup
              </button>
            </div>
          </div>
        )}

        {/* PROMO CODES TAB */}
        {activeTab === 'promo' && (
          <div className="space-y-6">
            {/* Create Promo Code */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <Tag className="w-6 h-6 text-gold" />
                Create New Promo Code
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Promo Code</label>
                  <input
                    type="text"
                    value={newPromoCode.code}
                    onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. SAVE20"
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Discount %</label>
                  <input
                    type="number"
                    value={newPromoCode.discountPercent}
                    onChange={(e) => setNewPromoCode({...newPromoCode, discountPercent: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Or Fixed Amount</label>
                  <input
                    type="number"
                    value={newPromoCode.discountAmount}
                    onChange={(e) => setNewPromoCode({...newPromoCode, discountAmount: parseInt(e.target.value) || 0})}
                    placeholder="KES"
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max Uses</label>
                  <input
                    type="number"
                    value={newPromoCode.maxUses}
                    onChange={(e) => setNewPromoCode({...newPromoCode, maxUses: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expiry (Days)</label>
                  <input
                    type="number"
                    value={newPromoCode.expiryDays}
                    onChange={(e) => setNewPromoCode({...newPromoCode, expiryDays: parseInt(e.target.value) || 30})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setPromoCodes([...promoCodes, {...newPromoCode, id: newPromoCode.code, usedCount: 0, active: true, applicablePlans: ['guardian'], expiryDate: new Date(Date.now() + newPromoCode.expiryDays * 24 * 60 * 60 * 1000)}]);
                    setNewPromoCode({ code: '', discountPercent: 0, discountAmount: 0, maxUses: 100, expiryDays: 30 });
                    alert('Promo code created: ' + newPromoCode.code);
                  }}
                  className="bg-navy text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Code
                </button>
              </div>
            </div>

            {/* Active Promo Codes */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8">Active Promo Codes</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Code</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Discount</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Uses</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Expiry</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Status</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                        <td className="text-sm font-black text-gold py-4 px-4">{promo.code}</td>
                        <td className="text-sm font-bold text-navy py-4 px-4">
                          {promo.discountPercent > 0 ? `${promo.discountPercent}%` : `Ksh ${promo.discountAmount}`}
                        </td>
                        <td className="text-sm font-bold text-slate-600 py-4 px-4">
                          {promo.usedCount} / {promo.maxUses}
                        </td>
                        <td className="text-sm text-slate-600 py-4 px-4">
                          {promo.expiryDate.toLocaleDateString('en-KE')}
                        </td>
                        <td className="text-xs font-black py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${
                            promo.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {promo.active ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="text-sm py-4 px-4">
                          <button
                            onClick={() => {
                              setPromoCodes(promoCodes.filter(p => p.id !== promo.id));
                              alert(`Promo code ${promo.code} deleted`);
                            }}
                            className="text-crimson hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BULK CAMPAIGNS TAB */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <Send className="w-6 h-6 text-gold" />
                Send Campaign
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Campaign Title</label>
                  <input
                    type="text"
                    value={bulkMessage.title}
                    onChange={(e) => setBulkMessage({...bulkMessage, title: e.target.value})}
                    placeholder="e.g. 'New Guardian Features Available'"
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Message</label>
                  <textarea
                    value={bulkMessage.message}
                    onChange={(e) => setBulkMessage({...bulkMessage, message: e.target.value})}
                    placeholder="Your message here..."
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-medium h-32 focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Segment</label>
                    <select
                      value={bulkMessage.targetSegment}
                      onChange={(e) => setBulkMessage({...bulkMessage, targetSegment: e.target.value})}
                      className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    >
                      <option value="all">All Users</option>
                      <option value="premium">Premium Only</option>
                      <option value="free">Free Tier Only</option>
                      <option value="inactive">Inactive (30+ days)</option>
                      <option value="trial">Trial Users</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Channel</label>
                    <select
                      value={bulkMessage.channel}
                      onChange={(e) => setBulkMessage({...bulkMessage, channel: e.target.value})}
                      className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6">
                  <p className="text-sm font-bold text-amber-800 mb-2">Preview</p>
                  <p className="text-xs text-amber-700 mb-4">Will be sent to {bulkMessage.targetSegment === 'all' ? 'all users' : bulkMessage.targetSegment} via {bulkMessage.channel}</p>
                  <div className="bg-white p-4 rounded-xl border border-amber-200">
                    <p className="font-black text-navy">{bulkMessage.title || '(No title)'}</p>
                    <p className="text-sm text-slate-600 mt-2">{bulkMessage.message || '(No message)'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert(`Campaign sent via ${bulkMessage.channel} to ${bulkMessage.targetSegment} users:\n\n${bulkMessage.title}\n${bulkMessage.message}`);
                    setBulkMessage({ title: '', message: '', targetSegment: 'all', channel: 'email' });
                  }}
                  className="w-full bg-navy text-white font-bold py-4 rounded-[24px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Campaign Now
                </button>
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-serif font-black text-navy mb-6">Campaign History</h3>
              <div className="space-y-4">
                {[
                  { title: 'Guardian Protocol Launch', segment: 'All Users', channel: 'Email', sent: Date.now() - 172800000, recipients: 1247 },
                  { title: '20% Off Winter Sale', segment: 'Free Tier', channel: 'WhatsApp', sent: Date.now() - 86400000, recipients: 342 },
                  { title: 'Security Update Available', segment: 'Premium Only', channel: 'Push', sent: Date.now() - 3600000, recipients: 89 }
                ].map((campaign, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-[24px] border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-black text-navy">{campaign.title}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">{campaign.segment} • {campaign.channel} • {campaign.recipients.toLocaleString()} recipients</p>
                    </div>
                    <p className="text-xs font-bold text-slate-400">{new Date(campaign.sent).toLocaleDateString('en-KE')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
            <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-gold" />
              Admin Audit Trail
            </h3>
            
            <p className="text-sm text-slate-600 font-medium mb-6">Track all admin activities for compliance and security monitoring</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Timestamp</th>
                    <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Admin</th>
                    <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Action</th>
                    <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Target</th>
                    <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                      <td className="text-xs font-bold text-slate-600 py-4 px-4">
                        {new Date(log.timestamp).toLocaleString('en-KE')}
                      </td>
                      <td className="text-sm font-bold text-navy py-4 px-4">{log.admin}</td>
                      <td className="text-sm font-bold text-slate-700 py-4 px-4">{log.action}</td>
                      <td className="text-xs font-mono text-slate-500 py-4 px-4">{log.target}</td>
                      <td className="text-xs text-slate-500 py-4 px-4">
                        <button className="text-navy hover:text-gold font-bold transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-[24px] border border-slate-200">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Compliance Stats</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <p className="font-black text-navy">{auditLogs.length}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Total Admin Actions</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <p className="font-black text-navy">1</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Active Admin(s)</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <p className="font-black text-navy">30 days</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Log Retention</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GROWTH MARKETING TAB */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {/* Paywall Messaging */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-gold" />
                Paywall Messages
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Paywall Title</label>
                  <input
                    type="text"
                    value={marketingConfig.paywallTitle}
                    onChange={(e) => setMarketingConfig({...marketingConfig, paywallTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">Shown when user tries to access locked feature</p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Paywall Subtitle</label>
                  <input
                    type="text"
                    value={marketingConfig.paywallSubtitle}
                    onChange={(e) => setMarketingConfig({...marketingConfig, paywallSubtitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CTA Button Text</label>
                  <input
                    type="text"
                    value={marketingConfig.ctaText}
                    onChange={(e) => setMarketingConfig({...marketingConfig, ctaText: e.target.value})}
                    className="w-full px-4 py-3 border border-gold/30 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* FOMO Triggers */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-gold" />
                FOMO Upgrade Triggers
              </h3>
              
              <p className="text-sm text-slate-600 font-medium mb-6">Configure when to show upgrade messages to users</p>

              <div className="space-y-4 mb-6">
                {marketingConfig.fomoMessages.map((msg) => (
                  <div key={msg.id} className="p-6 bg-slate-50 rounded-[24px] border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{msg.trigger}</p>
                        <input
                          type="text"
                          value={msg.message}
                          onChange={(e) => {
                            const newMsgs = [...marketingConfig.fomoMessages];
                            newMsgs[newMsgs.indexOf(msg)].message = e.target.value;
                            setMarketingConfig({...marketingConfig, fomoMessages: newMsgs});
                          }}
                          className="w-full px-4 py-2 border border-gold/30 rounded-xl font-medium text-sm focus:ring-2 focus:ring-gold/20 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newMsgs = marketingConfig.fomoMessages.map(m => m.id === msg.id ? {...m, enabled: !m.enabled} : m);
                          setMarketingConfig({...marketingConfig, fomoMessages: newMsgs});
                        }}
                        className={`ml-3 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                          msg.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {msg.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setMarketingConfig({
                  ...marketingConfig,
                  fomoMessages: [...marketingConfig.fomoMessages, {
                    id: Math.max(...marketingConfig.fomoMessages.map(m => m.id)) + 1,
                    trigger: 'custom_trigger',
                    message: 'Your custom FOMO message here',
                    enabled: true
                  }]
                })}
                className="w-full bg-navy text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add FOMO Message
              </button>
            </div>

            {/* Feature Comparison Matrix */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-gold" />
                Feature Comparison Editor
              </h3>
              
              <p className="text-sm text-slate-600 font-medium mb-6">Customize what users see they're missing (Essential vs Guardian)</p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Feature</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Essential</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Guardian</th>
                      <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest py-4 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketingConfig.featureComparison.map((comp, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                        <td className="text-sm font-bold text-navy py-4 px-4">
                          <input
                            type="text"
                            value={comp.feature}
                            onChange={(e) => {
                              const newComp = [...marketingConfig.featureComparison];
                              newComp[idx].feature = e.target.value;
                              setMarketingConfig({...marketingConfig, featureComparison: newComp});
                            }}
                            className="px-3 py-2 border border-gold/30 rounded-lg font-medium text-sm"
                          />
                        </td>
                        <td className="text-sm text-slate-600 py-4 px-4">
                          <input
                            type="text"
                            value={comp.essential}
                            onChange={(e) => {
                              const newComp = [...marketingConfig.featureComparison];
                              newComp[idx].essential = e.target.value;
                              setMarketingConfig({...marketingConfig, featureComparison: newComp});
                            }}
                            className="px-3 py-2 border border-slate-200 rounded-lg font-medium text-sm w-24"
                          />
                        </td>
                        <td className="text-sm text-gold py-4 px-4 font-bold">
                          <input
                            type="text"
                            value={comp.guardian}
                            onChange={(e) => {
                              const newComp = [...marketingConfig.featureComparison];
                              newComp[idx].guardian = e.target.value;
                              setMarketingConfig({...marketingConfig, featureComparison: newComp});
                            }}
                            className="px-3 py-2 border border-gold/30 rounded-lg font-medium text-sm w-24"
                          />
                        </td>
                        <td className="text-sm py-4 px-4">
                          <button
                            onClick={() => setMarketingConfig({
                              ...marketingConfig,
                              featureComparison: marketingConfig.featureComparison.filter((_, i) => i !== idx)
                            })}
                            className="text-crimson hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setMarketingConfig({
                  ...marketingConfig,
                  featureComparison: [...marketingConfig.featureComparison, {
                    feature: 'New Feature',
                    essential: '❌',
                    guardian: '✅'
                  }]
                })}
                className="w-full bg-navy text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-6"
              >
                <Plus className="w-5 h-5" />
                Add Comparison Row
              </button>
            </div>

            {/* Upgrade Triggers */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8 flex items-center gap-3">
                <ZapIcon className="w-6 h-6 text-gold" />
                When to Show Upgrade Prompts
              </h3>
              
              <div className="space-y-4">
                {marketingConfig.upgradeTriggers.map((trigger) => (
                  <button
                    key={trigger.id}
                    onClick={() => {
                      const newTriggers = marketingConfig.upgradeTriggers.map(t =>
                        t.id === trigger.id ? {...t, enabled: !t.enabled} : t
                      );
                      setMarketingConfig({...marketingConfig, upgradeTriggers: newTriggers});
                    }}
                    className={`w-full p-4 rounded-[24px] border-2 font-bold transition-all flex items-center justify-between ${
                      trigger.enabled
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>{trigger.label}</span>
                    {trigger.enabled ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Onboarding Sequence */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-serif font-black text-navy mb-8">Onboarding Messages</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(marketingConfig.onboardingMessages).map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest capitalize">{key}</label>
                    <textarea
                      value={value}
                      onChange={(e) => setMarketingConfig({
                        ...marketingConfig,
                        onboardingMessages: {
                          ...marketingConfig.onboardingMessages,
                          [key]: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 border border-gold/30 rounded-xl font-medium h-24 focus:ring-2 focus:ring-gold/20 outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Marketing Config */}
            <button
              onClick={() => alert(`Marketing Config Updated:\n\n${JSON.stringify(marketingConfig, null, 2)}`)}
              className="w-full bg-navy text-white font-bold py-4 rounded-[24px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Marketing Configuration
            </button>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Support Configuration */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-black text-navy">Support Channels</h3>
                <button
                  onClick={() => setEditingSettings(!editingSettings)}
                  className={`p-2 rounded-xl transition-all ${editingSettings ? 'bg-crimson/10 text-crimson' : 'bg-slate-100 text-slate-400 hover:text-navy'}`}
                >
                  {editingSettings ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gold" /> WhatsApp Number
                  </label>
                  <input
                    type="text"
                    disabled={!editingSettings}
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl font-bold border ${
                      editingSettings 
                        ? 'bg-white border-gold/30 focus:ring-2 focus:ring-gold/20' 
                        : 'bg-slate-50 border-slate-200'
                    } outline-none transition-all`}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Used for concierge support link</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" /> Support Email
                  </label>
                  <input
                    type="email"
                    disabled={!editingSettings}
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl font-bold border ${
                      editingSettings 
                        ? 'bg-white border-gold/30 focus:ring-2 focus:ring-gold/20' 
                        : 'bg-slate-50 border-slate-200'
                    } outline-none transition-all`}
                  />
                </div>
              </div>

              {editingSettings && (
                <button
                  onClick={() => {
                    alert('Settings updated: ' + JSON.stringify(settings));
                    setEditingSettings(false);
                  }}
                  className="w-full bg-navy text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all"
                >
                  Save Settings
                </button>
              )}
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-6">
              <h3 className="text-xl font-serif font-black text-navy flex items-center gap-3">
                <Lock className="w-6 h-6 text-crimson" />
                Security
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Auto-Lock Timeout (ms)</label>
                  <div className="text-2xl font-black text-navy">{settings.autoLockTimeoutMs}</div>
                  <p className="text-[10px] text-slate-500 font-medium">User vault auto-locks after this duration of inactivity</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Currency</label>
                  <div className="text-2xl font-black text-navy">{settings.currency}</div>
                  <p className="text-[10px] text-slate-500 font-medium">Default currency for all pricing</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  View Security Log
                </button>
                <button className="w-full bg-rose-50 hover:bg-rose-100 text-crimson font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Reset Admin Password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-navy">
          Authorized Terminal // Session Managed by HATI Authority
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
