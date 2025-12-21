
import React, { useState } from 'react';
import { MessageCircle, Send, X, Loader2, CheckCircle } from 'lucide-react';
import { APP_CONFIG } from "@/constants/appConfig";
import { auth } from '@/lib/firebase';

interface ConciergeButtonProps {
  userEmail?: string;
  userName?: string;
}

export const ConciergeButton: React.FC<ConciergeButtonProps> = ({ userEmail, userName }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    ticketType: 'general' as 'technical' | 'billing' | 'medical' | 'general'
  });

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to submit a support ticket');
        return;
      }

      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          subject: formData.subject,
          message: formData.message,
          ticketType: formData.ticketType,
          attachments: []
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setFormData({ subject: '', message: '', ticketType: 'general' });
        }, 3000);
      } else {
        alert('Failed to submit ticket. Please try again.');
      }
    } catch (error) {
      console.error('Concierge error:', error);
      alert('Error submitting ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100] group">
        <div className="absolute -top-12 right-0 bg-navy text-gold text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap border border-gold/30">
          Talk to Concierge
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-16 h-16 bg-gold hover:bg-amber-400 text-navy rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(212,175,55,0.4)] transition-all active:scale-90 animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <MessageCircle className="w-8 h-8 fill-navy/10" />
        </button>
      </div>

      {/* Concierge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[200]">
          <div className="bg-white w-full md:w-96 rounded-t-[32px] md:rounded-[32px] shadow-2xl md:m-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-navy text-white p-6 flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-2xl font-serif font-black">Concierge Support</h2>
                <p className="text-gold text-[10px] font-black uppercase tracking-widest mt-1">24/7 Assistance</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
                <h3 className="text-2xl font-black text-navy">Ticket Submitted!</h3>
                <p className="text-slate-600">Our team will respond within 2 hours.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Issue Type</label>
                  <select 
                    value={formData.ticketType}
                    onChange={(e) => setFormData({...formData, ticketType: e.target.value as any})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Payment</option>
                    <option value="medical">Medical Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Brief description..."
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Message</label>
                  <textarea 
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-gold/20 outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-navy hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Ticket
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Response time: 2 hours or less • All conversations are encrypted
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
