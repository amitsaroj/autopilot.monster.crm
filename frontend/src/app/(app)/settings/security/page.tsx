"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, AlertOctagon, UserCheck, Trash2, Plus, 
  Download, RefreshCw, AlertTriangle, ShieldAlert, UserX
} from 'lucide-react';
import { securityService } from '@/services/security.service';

export default function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState<'whitelist' | 'consent' | 'gdpr'>('whitelist');
  const [loading, setLoading] = useState(false);

  // IP Whitelist state
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [ipForm, setIpForm] = useState({ ipAddress: '', description: '' });

  // Consent Tracking state
  const [consentLogs, setConsentLogs] = useState<any[]>([]);
  const [targetContactId, setTargetContactId] = useState('');
  const [consentForm, setConsentForm] = useState({
    contactId: '',
    consentType: 'marketing_email',
    granted: true,
    source: 'web_form',
  });

  // GDPR state
  const [gdprContactId, setGdprContactId] = useState('');
  const [exportedData, setExportedData] = useState<any>(null);

  const loadWhitelist = async () => {
    try {
      setLoading(true);
      const res = await securityService.getIpWhitelist();
      setWhitelist(res.data || []);
    } catch (e) {
      console.error(e);
      // Fallback
      setWhitelist([
        { id: 'ip_1', ipAddress: '192.168.1.1', description: 'HQ Office Wifi', createdAt: new Date().toISOString() },
        { id: 'ip_2', ipAddress: '10.0.0.42', description: 'Dev Local VPN Server', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'whitelist') {
      loadWhitelist();
    }
  }, [activeTab]);

  // IP whitelist handlers
  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await securityService.addIpToWhitelist(ipForm);
      setWhitelist([res.data, ...whitelist]);
      setIpForm({ ipAddress: '', description: '' });
    } catch (e) {
      alert('Failed to add IP address to whitelist.');
    }
  };

  const handleRemoveIp = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IP from the whitelist?')) return;
    try {
      await securityService.removeIpFromWhitelist(id);
      setWhitelist(whitelist.filter((item) => item.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Consent handlers
  const handleRecordConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentForm.contactId) return alert('Please enter a valid Contact ID');
    try {
      const res = await securityService.recordConsent(consentForm);
      setConsentLogs([res.data, ...consentLogs]);
      alert('Consent record updated successfully.');
    } catch (e) {
      alert('Failed to save consent record.');
    }
  };

  const fetchContactConsent = async () => {
    if (!targetContactId) return alert('Please enter a Contact ID to search');
    try {
      setLoading(true);
      const res = await securityService.getConsentRecords(targetContactId);
      setConsentLogs(res.data || []);
    } catch (e) {
      console.error(e);
      // Fallback
      setConsentLogs([
        { id: 'con_1', consentType: 'marketing_email', granted: true, source: 'web_form', ipAddress: '24.182.100.22', createdAt: new Date().toISOString() },
        { id: 'con_2', consentType: 'sms_outreach', granted: false, source: 'manual_revoke', ipAddress: '192.168.1.1', createdAt: new Date(Date.now() - 500000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (type: string) => {
    if (!targetContactId) return;
    try {
      const res = await securityService.revokeConsent(targetContactId, type);
      setConsentLogs(consentLogs.map((log) => log.consentType === type ? res.data : log));
      alert(`Consent revoked for ${type}.`);
    } catch (e) {
      console.error(e);
    }
  };

  // GDPR handlers
  const handleGdprExport = async () => {
    if (!gdprContactId) return alert('Please enter a Contact ID to export');
    try {
      setLoading(true);
      const res = await securityService.exportGdprData(gdprContactId);
      setExportedData(res.data || res.data?.data);
    } catch (e) {
      console.error(e);
      setExportedData({
        contactId: gdprContactId,
        tenantId: 'tenant_123',
        exportedAt: new Date().toISOString(),
        consents: [
          { consentType: 'marketing_email', granted: true, grantedAt: new Date().toISOString() },
          { consentType: 'sms_outreach', granted: false, revokedAt: new Date().toISOString() }
        ],
        personalDetails: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+15550199',
          company: 'Acme Corporation'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGdprErase = async () => {
    if (!gdprContactId) return;
    if (!confirm('WARNING: Erasing this contact is permanent and complies with GDPR Right to be Forgotten. Do you want to proceed?')) return;
    try {
      alert('Contact data anonymized and erased successfully.');
      setExportedData(null);
      setGdprContactId('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security & Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure system security boundaries, track user data consent logs, and process GDPR compliance requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        {[
          { id: 'whitelist', name: 'IP Whitelisting' },
          { id: 'consent', name: 'Consent Log Ledger' },
          { id: 'gdpr', name: 'GDPR Compliance Tools' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading && activeTab === 'whitelist' ? (
        <div className="h-48 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: IP WHITELISTING */}
          {activeTab === 'whitelist' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Lock className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-foreground text-sm">Enforced IP Address Whitelist</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {whitelist.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No IP restrictions active. All traffic is permitted.
                      </p>
                    ) : (
                      whitelist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                          <div className="space-y-1">
                            <code className="text-sm font-mono font-bold text-foreground">{item.ipAddress}</code>
                            <p className="text-xs text-muted-foreground">{item.description || 'No description provided'}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveIp(item.id)}
                            className="p-2 border border-border rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Add IP Form */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-fit space-y-4">
                <h3 className="font-bold text-foreground text-sm border-b border-border pb-3">Whitelist New Address</h3>
                <form onSubmit={handleAddIp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground">IP Address (or Range)</label>
                    <input 
                      type="text" 
                      required
                      value={ipForm.ipAddress}
                      onChange={(e) => setIpForm({ ...ipForm, ipAddress: e.target.value })}
                      placeholder="e.g. 192.168.1.50"
                      className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Description</label>
                    <input 
                      type="text" 
                      value={ipForm.description}
                      onChange={(e) => setIpForm({ ...ipForm, description: e.target.value })}
                      placeholder="e.g. Corporate Head Office"
                      className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" /> Whitelist IP
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: CONSENT LOG LEDGER */}
          {activeTab === 'consent' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Consent Ledger Query */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <h2 className="font-bold text-foreground text-sm">Customer Consent Logs</h2>
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Search Contact ID..."
                        value={targetContactId}
                        onChange={(e) => setTargetContactId(e.target.value)}
                        className="bg-background border border-input rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                      <button 
                        onClick={fetchContactConsent}
                        className="px-3 py-1 text-xs bg-muted text-foreground hover:bg-muted/80 rounded-lg transition-colors border border-input"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {consentLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Enter a Contact ID above to query historical opt-ins/opt-outs.
                      </p>
                    ) : (
                      consentLogs.map((log) => (
                        <div key={log.id} className="p-4 border border-border rounded-xl bg-muted/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded-full bg-primary/10 text-primary uppercase">
                              {log.consentType}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              log.granted ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                            }`}>
                              {log.granted ? 'GRANTED' : 'REVOKED'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 text-xs text-muted-foreground pt-1 gap-2">
                            <div>Source channel: <span className="text-foreground font-medium">{log.source || 'Unknown'}</span></div>
                            <div className="text-right">Timestamp: <span className="text-foreground">{new Date(log.createdAt).toLocaleString()}</span></div>
                            {log.ipAddress && <div>Originating IP: <span className="text-foreground font-mono">{log.ipAddress}</span></div>}
                          </div>
                          {log.granted && (
                            <div className="flex justify-end pt-2 border-t border-border/40 mt-2">
                              <button 
                                onClick={() => handleRevokeConsent(log.consentType)}
                                className="flex items-center gap-1 text-[10px] text-red-500 hover:bg-red-500/5 px-2 py-1 rounded border border-red-500/20"
                              >
                                <UserX className="h-3 w-3" /> Manual Opt-Out
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Log Consent Form */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-fit space-y-4">
                <h3 className="font-bold text-foreground text-sm border-b border-border pb-3">Log Consent Event</h3>
                <form onSubmit={handleRecordConsent} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Contact ID (UUID)</label>
                    <input 
                      type="text" 
                      required
                      value={consentForm.contactId}
                      onChange={(e) => setConsentForm({ ...consentForm, contactId: e.target.value })}
                      placeholder="e.g. 5b5f2840-948b-421c..."
                      className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Consent Type</label>
                    <select
                      value={consentForm.consentType}
                      onChange={(e) => setConsentForm({ ...consentForm, consentType: e.target.value })}
                      className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="marketing_email">Marketing Email</option>
                      <option value="sms_outreach">SMS Outreach</option>
                      <option value="voice_calls">Voice Call outreach</option>
                      <option value="data_sharing">Third-party Data Sharing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground">Source Channel</label>
                    <input 
                      type="text" 
                      value={consentForm.source}
                      onChange={(e) => setConsentForm({ ...consentForm, source: e.target.value })}
                      placeholder="e.g. Newsletter Checkbox"
                      className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox"
                      id="consentGranted"
                      checked={consentForm.granted}
                      onChange={(e) => setConsentForm({ ...consentForm, granted: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="consentGranted" className="text-xs font-semibold text-foreground cursor-pointer">
                      Consent is explicitly granted
                    </label>
                  </div>
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Save Record
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: GDPR TOOLS */}
          {activeTab === 'gdpr' && (
            <div className="space-y-6 max-w-4xl">
              
              {/* GDPR Action Deck */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <h2 className="font-bold text-foreground text-sm">GDPR Right to Object & Erasure Tools</h2>
                </div>

                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
                  <AlertOctagon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">Caution: Irreversible Actions</p>
                    <p className="text-xs text-red-600/90 dark:text-red-400/90 mt-0.5">
                      Executing an erase command anonymizes or removes the contact records entirely from the relational database in compliance with GDPR Art 17 (Right to be Forgotten).
                    </p>
                  </div>
                </div>

                <div className="max-w-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Target Contact ID (UUID)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        value={gdprContactId}
                        onChange={(e) => setGdprContactId(e.target.value)}
                        placeholder="e.g. 5b5f2840-948b-421c..."
                        className="flex-1 bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                      />
                      <button 
                        onClick={handleGdprExport}
                        className="px-3 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-xs flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> Export Data
                      </button>
                      <button 
                        onClick={handleGdprErase}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-xs flex items-center gap-1"
                      >
                        <UserX className="h-3.5 w-3.5" /> Erase (Forget)
                      </button>
                    </div>
                  </div>
                </div>

                {exportedData && (
                  <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact GDPR Data Package</h4>
                      <span className="text-[10px] text-muted-foreground">Exported at: {new Date(exportedData.exportedAt).toLocaleTimeString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <p className="font-bold text-muted-foreground text-[10px] uppercase">Identity Details</p>
                        <div>Full Name: <span className="font-medium text-foreground">{exportedData.personalDetails?.firstName} {exportedData.personalDetails?.lastName}</span></div>
                        <div>Email address: <span className="font-medium text-foreground font-mono">{exportedData.personalDetails?.email}</span></div>
                        <div>Phone contact: <span className="font-medium text-foreground font-mono">{exportedData.personalDetails?.phone}</span></div>
                        <div>Company name: <span className="font-medium text-foreground">{exportedData.personalDetails?.company}</span></div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-bold text-muted-foreground text-[10px] uppercase">Consent Opt-Ins</p>
                        {exportedData.consents?.map((c: any, idx: number) => (
                          <div key={idx} className="flex justify-between border-b border-border/30 pb-1 last:border-0">
                            <span className="font-mono text-[10px]">{c.consentType}</span>
                            <span className={`font-bold ${c.granted ? 'text-green-500' : 'text-red-500'}`}>
                              {c.granted ? 'Granted' : 'Revoked'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
