
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { withAdminAuth } from '../../hoc/withAdminAuth';
import { db, auth } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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
  User
} from 'lucide-react';
import { UserRecord } from '../../types';

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() })) as UserRecord[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    premium: users.filter(u => u.isPremium).length,
    active24h: users.filter(u => u.lastLogin && Date.now() - u.lastLogin < 86400000).length
  }), [users]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    // In production, this would call an API route to disable the user in Firebase Auth
    // For this prototype, we mark them in Firestore
    await updateDoc(doc(db, "users", uid), {
      status: 'banned',
      updatedAt: Date.now()
    });
    setActiveMenu(null);
    alert(`HATI_AUTHORITY: User ${uid} has been restricted from the registry.`);
  };

  const handleImpersonate = (uid: string) => {
    /**
     * SECURE IMPERSONATION PROTOCOL:
     * 1. Set a session-only flag in sessionStorage.
     * 2. The app's root listener checks for this flag and targets that UID's Firestore path.
     * 3. Admin remains logged in as themselves in Auth, but the UI context switches.
     */
    sessionStorage.setItem('hati_impersonate_uid', uid);
    window.location.href = '/dashboard';
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
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Exit Terminal
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Registry Entries', val: stats.total, icon: Users, color: 'text-blue-500' },
            { label: 'Guardian Members', val: stats.premium, icon: Crown, color: 'text-gold' },
            { label: 'Terminal Activity (24h)', val: stats.active24h, icon: Activity, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-2 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                 <stat.icon className="w-24 h-24" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
               <p className="text-4xl font-serif font-black text-navy">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* User Table Card */}
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
                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold/20 transition-all w-full md:w-80 font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5">Registry Identity</th>
                  <th className="px-8 py-5">Current Tier</th>
                  <th className="px-8 py-5">Last Terminal Access</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy font-black text-xl">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-navy">{u.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.isPremium ? 'bg-gold/10 text-gold' : 'bg-slate-100 text-slate-400'}`}>
                        {u.isPremium ? <Crown className="w-3 h-3" /> : null}
                        {u.plan || 'essential'}
                      </div>
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
                        <div className="absolute right-8 top-16 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-10 animate-in fade-in zoom-in-95 duration-200">
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
          
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center space-y-4">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                 <Search className="w-8 h-8 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching identities found</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-navy">
          Authorized Terminal // Session Managed by HATI Authority
        </p>
      </footer>
    </div>
  );
};

export default withAdminAuth(AdminDashboard);
