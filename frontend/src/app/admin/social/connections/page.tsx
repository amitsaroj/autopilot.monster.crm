"use client";

import { useEffect, useState } from "react";
import { Link2, Plus, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { socialService } from "@/services/social.service";
import { parseApiData } from "@/lib/api/parse-response";

interface SocialPost {
  id: string;
  platform: string;
  status: string;
  content: string;
  likesCount?: number;
  updatedAt?: string;
}

interface PlatformConnection {
  id: string;
  name: string;
  platform: string;
  status: "CONNECTED" | "DISCONNECTED";
  posts: number;
  lastSync: string;
}

const PLATFORM_META: Record<string, { icon: string; label: string }> = {
  LINKEDIN: { icon: "🔵", label: "LinkedIn" },
  TWITTER: { icon: "🐦", label: "Twitter / X" },
  FACEBOOK: { icon: "📘", label: "Facebook Page" },
  INSTAGRAM: { icon: "📸", label: "Instagram" },
};

export default function AdminSocialConnectionsPage() {
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await socialService.getPosts();
        const posts = parseApiData<SocialPost[]>(res) ?? [];
        const byPlatform = new Map<string, SocialPost[]>();
        for (const post of posts) {
          const key = post.platform.toUpperCase();
          const existing = byPlatform.get(key) ?? [];
          existing.push(post);
          byPlatform.set(key, existing);
        }

        const connections: PlatformConnection[] = Object.entries(PLATFORM_META).map(
          ([platform, meta]) => {
            const platformPosts = byPlatform.get(platform) ?? [];
            const latest = platformPosts[0];
            return {
              id: platform,
              name: meta.label,
              platform,
              status: platformPosts.length > 0 ? "CONNECTED" : "DISCONNECTED",
              posts: platformPosts.length,
              lastSync: latest?.updatedAt
                ? new Date(latest.updatedAt).toLocaleString()
                : "Never",
            };
          },
        );
        setPlatforms(connections);
      } catch {
        toast.error("Failed to load social connections");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social Connections</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Connected Social Accounts
          </p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Connect Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map((p) => {
          const meta = PLATFORM_META[p.platform] ?? { icon: "🌐", label: p.name };
          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl border transition-all ${
                p.status === "CONNECTED"
                  ? "bg-white/[0.02] border-white/[0.05]"
                  : "bg-white/[0.01] border-dashed border-white/[0.08]"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <h3 className="text-sm font-black text-white">{p.name}</h3>
                    <p className="text-xs text-gray-600 font-mono">{p.posts} posts</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    p.status === "CONNECTED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              {p.status === "CONNECTED" ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">
                      Posts
                    </p>
                    <p className="text-base font-black text-white">{p.posts}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">
                      Last Activity
                    </p>
                    <p className="text-xs font-black text-gray-400">{p.lastSync}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-600 mb-4">
                  No posts scheduled for this platform yet.
                </p>
              )}
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Sync
                </button>
                <button className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" /> Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
