"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { 
  Download, Filter, TrendingUp, Users, DollarSign, Activity, Calendar,
  Bot, Sparkles, ArrowUpRight, Percent, Clock, Briefcase, RefreshCw
} from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';

const visitData = [
  { name: 'Mon', visits: 4000, leads: 240 },
  { name: 'Tue', visits: 3000, leads: 139 },
  { name: 'Wed', visits: 2000, leads: 980 },
  { name: 'Thu', visits: 2780, leads: 390 },
  { name: 'Fri', visits: 1890, leads: 480 },
  { name: 'Sat', visits: 2390, leads: 380 },
  { name: 'Sun', visits: 3490, leads: 430 },
];

const sourceData = [
  { name: 'Organic', value: 400 },
  { name: 'Direct', value: 300 },
  { name: 'Social', value: 300 },
  { name: 'Paid', value: 200 },
];

export default function AnalyticsMainPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'ai-vs-human'>('overview');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [roiData, setRoiData] = useState<any>(null);
  const [aiVsHumanData, setAiVsHumanData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [roiRes, aiVsHumanRes] = await Promise.all([
        analyticsService.getRoiReport(),
        analyticsService.getAiVsHumanReport(),
      ]);
      
      setRoiData(roiRes.data?.data || roiRes.data);
      setAiVsHumanData(aiVsHumanRes.data?.data || aiVsHumanRes.data);
    } catch (error) {
      console.error('Failed to fetch advanced analytics reports, using mock fallback', error);
      // Fallback
      setRoiData({
        totalBudget: 15000,
        totalSpent: 12450,
        totalRevenue: 48500,
        netProfit: 36050,
        roiPercentage: 289.56,
        campaignBreakdown: [
          { id: '1', name: 'Q2 AI Voice Outbound', type: 'VOICE', budget: 5000, spent: 4200, leads: 120, qualified: 45 },
          { id: '2', name: 'WhatsApp Product Launch', type: 'WHATSAPP', budget: 3000, spent: 2800, leads: 500, qualified: 150 },
          { id: '3', name: 'Email Newsletter Drip', type: 'EMAIL', budget: 2000, spent: 1950, leads: 1500, qualified: 220 },
          { id: '4', name: 'SMS Discount Offer', type: 'SMS', budget: 5000, spent: 3500, leads: 800, qualified: 95 }
        ]
      });
      setAiVsHumanData({
        ai: { totalCalls: 1450, avgDurationSeconds: 45, totalCost: 72.50, avgCostPerCall: 0.05, successRate: 88, conversionRate: 14.2 },
        human: { totalCalls: 420, avgDurationSeconds: 165, totalCost: 462.00, avgCostPerCall: 1.10, successRate: 82, conversionRate: 15.5 },
        savings: { totalSaved: 389.50, efficiencyGainMultiplier: 3.5 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const pdfType = activeTab === 'overview' ? 'general' : activeTab;
      await analyticsService.downloadPdf(pdfType);
    } catch (e) {
      console.error('Failed to download PDF', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Suite</h1>
          <p className="text-sm text-muted-foreground mt-1">Advanced business intelligence, ROI tracking, and AI effectiveness insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-background border border-input text-foreground text-sm rounded-lg px-4 py-2 pr-8 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <button 
            onClick={fetchReports}
            className="p-2 border border-input rounded-lg hover:bg-muted text-muted-foreground transition-colors shadow-sm bg-background flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline text-sm font-medium">Reload</span>
          </button>
          <button 
            onClick={handleExportPdf}
            disabled={exporting}
            className="p-2 border border-primary text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-sm font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'roi', name: 'Campaign ROI' },
          { id: 'ai-vs-human', name: 'AI vs Human Effectiveness' }
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

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-muted/30 border border-border/50 animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-muted/20 border border-border/50 animate-pulse rounded-xl" />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Revenue', value: `$${(roiData?.totalRevenue || 124500).toLocaleString()}`, trend: '+14%', up: true, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-950/30' },
                  { title: 'New Leads', value: '3,842', trend: '+22%', up: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/30' },
                  { title: 'Conversion Rate', value: '4.8%', trend: '-1.2%', up: false, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-950/30' },
                  { title: 'AI Agent Handled', value: `${aiVsHumanData?.ai?.totalCalls ? Math.round((aiVsHumanData.ai.totalCalls / (aiVsHumanData.ai.totalCalls + aiVsHumanData.human.totalCalls)) * 100) : 78}%`, trend: '+5%', up: true, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-950/30' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h3>
                      </div>
                      <div className={`p-2 rounded-lg ${kpi.bg}`}>
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.up ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'}`}>
                        {kpi.trend}
                      </span>
                      <span className="text-xs text-muted-foreground">vs previous period</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Charts Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="text-base font-semibold mb-6">Traffic Generation vs Lead Acquisition</h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={visitData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" />
                        <Area type="monotone" dataKey="leads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-semibold mb-6">Traffic Sources</h2>
                    <div className="space-y-6">
                      {sourceData.map((src, i) => {
                        const total = sourceData.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = Math.round((src.value / total) * 100);
                        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];
                        
                        return (
                          <div key={src.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground">{src.name}</span>
                              <span className="text-muted-foreground font-semibold">{percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <button className="w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors rounded-lg">
                      View Detailed Source Report &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGN ROI */}
          {activeTab === 'roi' && (
            <div className="space-y-6">
              {/* ROI Deck */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Budget Allocated', value: `$${(roiData?.totalBudget || 0).toLocaleString()}`, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/30' },
                  { title: 'Total Cost Spent', value: `$${(roiData?.totalSpent || 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/30' },
                  { title: 'Revenue Generated', value: `$${(roiData?.totalRevenue || 0).toLocaleString()}`, icon: ArrowUpRight, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-950/30' },
                  { title: 'Return on Investment (ROI)', value: `${roiData?.roiPercentage || 0}%`, icon: Percent, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-950/30' }
                ].map((kpi, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h3>
                      </div>
                      <div className={`p-2 rounded-lg ${kpi.bg}`}>
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Performance Breakdown */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold">Campaign Budget & ROI Ledger</h2>
                  <span className="text-xs text-muted-foreground font-medium">Live sync with marketing campaigns</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                        <th className="py-3 px-4">Campaign Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Budget</th>
                        <th className="py-3 px-4">Spent</th>
                        <th className="py-3 px-4">Leads</th>
                        <th className="py-3 px-4">Qualified</th>
                        <th className="py-3 px-4 text-right">ROI Analysis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData?.campaignBreakdown?.map((c: any) => {
                        const cost = Number(c.spent || 0);
                        const leads = Number(c.leads || 0);
                        const costPerLead = leads > 0 ? (cost / leads).toFixed(2) : '0.00';
                        return (
                          <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors text-sm">
                            <td className="py-3 px-4 font-semibold text-foreground">{c.name}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground uppercase">
                                {c.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">${Number(c.budget || 0).toLocaleString()}</td>
                            <td className="py-3 px-4">${Number(c.spent || 0).toLocaleString()}</td>
                            <td className="py-3 px-4">{c.leads}</td>
                            <td className="py-3 px-4">{c.qualified}</td>
                            <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                              ${costPerLead} <span className="text-xs font-normal">/ CPL</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI VS HUMAN */}
          {activeTab === 'ai-vs-human' && (
            <div className="space-y-6">
              {/* comparative deck */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Statistics */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Bot className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">AI Voice Agents</h3>
                      <p className="text-xs text-muted-foreground">Autonomous communication streams</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Total Engaged Calls</span>
                      <span className="font-semibold text-foreground">{aiVsHumanData?.ai?.totalCalls}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Avg Call Duration</span>
                      <span className="font-semibold text-foreground">{aiVsHumanData?.ai?.avgDurationSeconds}s</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Infrastructure Cost</span>
                      <span className="font-semibold text-foreground">${aiVsHumanData?.ai?.totalCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Cost Per Call</span>
                      <span className="font-semibold text-foreground">${aiVsHumanData?.ai?.avgCostPerCall}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-sm text-muted-foreground">Agent Success Rate</span>
                      <span className="font-semibold text-green-500">{aiVsHumanData?.ai?.successRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Human Statistics */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Users className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg text-purple-500">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Human Agents</h3>
                      <p className="text-xs text-muted-foreground">Manual CRM outreach logs</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Total Engaged Calls</span>
                      <span className="font-semibold text-foreground">{aiVsHumanData?.human?.totalCalls}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Avg Call Duration</span>
                      <span className="font-semibold text-foreground">{aiVsHumanData?.human?.avgDurationSeconds}s</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Estimated Labor Cost</span>
                      <span className="font-semibold text-foreground">${aiVsHumanData?.human?.totalCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-sm text-muted-foreground">Cost Per Call</span>
                      <span className="font-semibold text-foreground">${aiVsHumanData?.human?.avgCostPerCall}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-sm text-muted-foreground">Agent Success Rate</span>
                      <span className="font-semibold text-purple-500">{aiVsHumanData?.human?.successRate}%</span>
                    </div>
                  </div>
                </div>

                {/* AI Efficiency Gains */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between border-primary/30">
                  <div className="absolute top-0 right-0 p-4 text-primary opacity-10">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg text-green-500">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Efficiency & Savings</h3>
                        <p className="text-xs text-muted-foreground">Automated cost savings calculation</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/40 rounded-lg">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total Net Savings</span>
                        <span className="text-3xl font-extrabold text-foreground mt-1 block">
                          ${aiVsHumanData?.savings?.totalSaved?.toLocaleString()}
                        </span>
                        <p className="text-xs text-green-500 mt-1">✓ Infrastructure overhead minimized</p>
                      </div>
                      <div className="p-4 bg-muted/40 rounded-lg">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Scale Multiplier</span>
                        <span className="text-2xl font-extrabold text-foreground mt-1 block">
                          {aiVsHumanData?.savings?.efficiencyGainMultiplier}x
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">AI processed volume compared to human resource allocation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* comparative bar chart */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold mb-6">Cost vs Success Rate Breakdown</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Cost per Call ($)', AI: aiVsHumanData?.ai?.avgCostPerCall, Human: aiVsHumanData?.human?.avgCostPerCall },
                        { name: 'Success Rate (%)', AI: aiVsHumanData?.ai?.successRate, Human: aiVsHumanData?.human?.successRate },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="AI" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Human" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
