"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Phone, Mic, BarChart3, Voicemail, Radio, Headphones } from 'lucide-react';
const features = [
  { icon: Phone, title: 'AI Outbound Calling', desc: 'Launch bulk AI-powered voice campaigns that sound human and convert at scale.' },
  { icon: Mic, title: 'Real-time Transcription', desc: 'Live speech-to-text powered by Whisper with speaker diarization and keyword spotting.' },
  { icon: Radio, title: 'Realtime Voice API', desc: 'Sub-second latency conversational AI bridging Twilio Media Streams and OpenAI Realtime API.' },
  { icon: BarChart3, title: 'Call Analytics', desc: 'Sentiment analysis, talk-to-listen ratios, and AI-generated call summaries.' },
  { icon: Voicemail, title: 'Smart Voicemail', desc: 'AI voicemail detection with automated message drop and callback scheduling.' },
  { icon: Headphones, title: 'Live Monitoring', desc: 'Supervisors can listen, whisper, or barge into live AI calls in real-time.' },
];
export default function ProductVoicePage() {
  return (
    <div className="pt-32 pb-20"><div className="max-w-6xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-24">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-sm font-medium text-orange-400 mb-6"><Phone className="w-4 h-4" /> Voice AI</span>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6">AI calling that<br />sounds human</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">Deploy voice AI agents that make calls, handle objections, and book meetings — all with natural conversation.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-2xl shadow-orange-500/20 hover:scale-[1.02] transition-all">Try Voice Free <ArrowRight className="w-4 h-4" /></Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:bg-gray-100 dark:bg-white/[0.06] transition-all hover:border-gray-300 dark:border-white/[0.12]">
            <f.icon className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div></div>
  );
}
