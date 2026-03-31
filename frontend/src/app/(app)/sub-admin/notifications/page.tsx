'use client';

import { useState, useEffect } from 'react';
import { subAdminNotificationsService } from '@/services/sub-admin-notifications.service';

const NOTIFICATION_TYPES = [
  { type: 'WELCOME_EMAIL', name: 'Welcome Sequence', channel: 'EMAIL' },
  { type: 'OTP_SMS', name: 'Identity Verification', channel: 'SMS' },
  { type: 'PAYMENT_SUCCESS', name: 'Financial Confirmation', channel: 'EMAIL' },
  { type: 'APPOINTMENT_REMINDER', name: 'Schedule Alert', channel: 'WHATSAPP' },
];

export default function SubAdminNotificationsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await subAdminNotificationsService.getTemplates();
      setTemplates(response.data || []);
    } catch (error) {
       console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subAdminNotificationsService.upsertTemplate(editingTemplate);
      setEditingTemplate(null);
      loadTemplates();
      alert('Notification pulse updated.');
    } catch (error) {
       console.error('Failed to save template', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Communication Manifolds</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-[120rem]">
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Event Vector Catalog</h2>
               <div className="space-y-4">
                  {NOTIFICATION_TYPES.map(nt => (
                    <button 
                      key={nt.type}
                      onClick={() => setEditingTemplate({ type: nt.type, name: nt.name, subject: '', body: '' })}
                      className="w-full bg-gray-50 hover:bg-black hover:text-white p-6 rounded-[2rem] text-left transition-all group"
                    >
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">{nt.name}</span>
                          <span className="text-[8px] font-black opacity-40 group-hover:opacity-100">{nt.channel}</span>
                       </div>
                       <div className="text-[9px] text-gray-400 group-hover:text-gray-300 uppercase tracking-tighter">Event Key: {nt.type}</div>
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-2">
            {editingTemplate ? (
               <form onSubmit={handleSave} className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-12 border-b border-gray-50 flex justify-between items-center">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Calibrate Vector: {editingTemplate.name}</h3>
                     <button type="button" onClick={() => setEditingTemplate(null)} className="text-[10px] font-black text-gray-400">ABORT</button>
                  </div>
                  <div className="p-12 space-y-8">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Subject Header</label>
                        <input 
                          required
                          value={editingTemplate.subject}
                          onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all"
                          placeholder="Transmission Topic..."
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Payload Manifest (Body)</label>
                        <textarea 
                          required
                          value={editingTemplate.body}
                          onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all h-64 resize-none"
                          placeholder="Define the core message payload..."
                        />
                     </div>
                  </div>
                  <div className="p-10 bg-gray-50/50 flex justify-end">
                     <button type="submit" className="bg-black text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
                        ESTABLISH TRANSMISSION
                     </button>
                  </div>
               </form>
            ) : (
               <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[4rem] min-h-[40rem]">
                  <div className="text-center">
                     <div className="text-[4rem] mb-6 animate-bounce">📡</div>
                     <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Awaiting Vector Selection</div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
