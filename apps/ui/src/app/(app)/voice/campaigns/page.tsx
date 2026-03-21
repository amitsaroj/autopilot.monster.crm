"use client";

import { useState } from 'react';
import { Phone, Users, Mic, Clock, BarChart2, CheckCircle2, PhoneOutgoing, Settings } from 'lucide-react';

export default function VoiceCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');
  const [targetCount, setTargetCount] = useState(1);
  const [agentVoice, setAgentVoice] = useState('alloy');
  
  const handleLaunch = async () => {
    // In actual implementation, trigger API to launch the campaign through BullMQ
    alert(`Campaign launched. Attempting ${targetCount} outbound stream calls on voice ${agentVoice}.`);
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

      {/* Tabs */}
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
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-gray-500"/> Select Target Audience</h2>
              <div className="space-y-4">
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between cursor-pointer">
                  <div>
                    <h3 className="font-medium text-blue-900">Cold Leads List</h3>
                    <p className="text-sm text-blue-700">Imported CSV (1,402 contacts)</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-blue-600 flex-shrink-0" />
                </div>
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">Renewals this month</h3>
                    <p className="text-sm text-gray-500">Dynamic Smart List (84 contacts)</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500"/> Agent Configuration</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Model</label>
                <div className="grid grid-cols-3 gap-3">
                  {['alloy', 'echo', 'shimmer'].map(voice => (
                    <button 
                      key={voice}
                      onClick={() => setAgentVoice(voice)}
                      className={`py-3 px-4 border rounded-lg capitalize font-medium text-sm transition-colors ${agentVoice === voice ? 'bg-purple-50 border-purple-300 text-purple-700 ring-1 ring-purple-600' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Objective (System Prompt)</label>
                <textarea 
                  className="w-full text-sm font-mono border border-gray-300 rounded-lg p-3 text-gray-800 bg-gray-50 h-32 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  defaultValue="You are an outbound sales representative. Your goal is to qualify the lead and ask if they are ready for a demo. Do not sound robotic. Be conversational."
                />
              </div>
              
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg">
              <h2 className="font-semibold mb-6 flex items-center gap-2"><PhoneOutgoing className="w-5 h-5"/> Launch Control</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80 text-sm">Target Leads</span>
                  <span className="font-semibold">1,402</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80 text-sm">Concurrent Lines</span>
                  <span className="font-semibold text-green-400">10 (Standard limit)</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <span className="text-white/80 text-sm">Avg Duration</span>
                  <span className="font-semibold">~2m 30s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Est. Completion</span>
                  <span className="font-semibold truncate max-w-[120px]">5.8 Hours</span>
                </div>
              </div>

              <button onClick={handleLaunch} className="w-full bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                Launch Campaign
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
                <th className="p-4 font-medium border-b">Live Calls</th>
                <th className="p-4 font-medium border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">Cold Outreach Q4</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center w-max gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> DIALING
                  </span>
                </td>
                <td className="p-4 text-gray-600">842 / 1,402 (60%)</td>
                <td className="p-4 font-mono font-medium text-gray-900">10 / 10</td>
                <td className="p-4 text-right">
                  <button className="text-red-500 hover:text-red-700 font-medium">Pause</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
