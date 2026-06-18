"use client";

import { useEffect, useState } from 'react';
import { Phone, Users, Mic, Clock, BarChart2, CheckCircle2, PhoneOutgoing, Settings } from 'lucide-react';
import { voiceCampaignService, VoiceCampaign } from '@/services/voice-campaign.service';

export default function VoiceCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');
  const [campaigns, setCampaigns] = useState<VoiceCampaign[]>([]);
  const [name, setName] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [script, setScript] = useState(
    'You are an outbound sales representative. Your goal is to qualify the lead and ask if they are ready for a demo.',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    try {
      const res = await voiceCampaignService.list();
      setCampaigns(res.data.data ?? []);
    } catch {
      setError('Failed to load campaigns');
    }
  };

  useEffect(() => {
    if (activeTab === 'active') {
      void loadCampaigns();
    }
  }, [activeTab]);

  const handleLaunch = async () => {
    setLoading(true);
    setError(null);
    try {
      const created = await voiceCampaignService.create({
        name: name || 'Outbound Campaign',
        fromNumber: fromNumber || '+10000000000',
        script,
      });
      await voiceCampaignService.start(created.data.data.id);
      setActiveTab('active');
      await loadCampaigns();
    } catch {
      setError('Failed to launch campaign');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    await voiceCampaignService.pause(id);
    await loadCampaigns();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Voice Calling</h1>
            <p className="text-sm text-gray-500 mt-1">Autonomous outbound calling powered by OpenAI Realtime interactions.</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('new')}
          className={`pb-4 font-medium text-sm transition-colors relative ${activeTab === 'new' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          New Campaign
          {activeTab === 'new' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-lg" />}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 font-medium text-sm transition-colors relative ${activeTab === 'active' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Active Dialers
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-lg" />}
        </button>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" /> Campaign Setup
              </h2>
              <div className="space-y-4">
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Campaign name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="From number (E.164)"
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                />
                <textarea
                  className="w-full text-sm font-mono border border-gray-300 rounded-lg p-3 h-32"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg">
              <h2 className="font-semibold mb-6 flex items-center gap-2">
                <PhoneOutgoing className="w-5 h-5" /> Launch Control
              </h2>
              <button
                onClick={handleLaunch}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg"
              >
                {loading ? 'Launching...' : 'Launch Campaign'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium border-b">Campaign Name</th>
                <th className="p-4 font-medium border-b">Status</th>
                <th className="p-4 font-medium border-b">Progress</th>
                <th className="p-4 font-medium border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{campaign.name}</td>
                  <td className="p-4">{campaign.status}</td>
                  <td className="p-4 text-gray-600">
                    {campaign.callsMade} / {campaign.totalContacts || 0}
                  </td>
                  <td className="p-4 text-right">
                    {campaign.status === 'RUNNING' && (
                      <button
                        className="text-red-500 hover:text-red-700 font-medium"
                        onClick={() => handlePause(campaign.id)}
                      >
                        Pause
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No campaigns yet. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
