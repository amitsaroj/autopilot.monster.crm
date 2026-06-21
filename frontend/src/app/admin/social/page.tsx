"use client";

import { useEffect, useState } from "react";
import { Globe, ArrowRight, Users, Image, Rss, Link2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { socialService } from "@/services/social.service";
import { parseApiData } from "@/lib/api/parse-response";

interface SocialAnalytics {
  overview: {
    totalLikes: number;
    totalShares: number;
    totalClicks: number;
    totalPosts: number;
  };
  platformDistribution: Record<string, number>;
}

const SOCIAL_MODULES = [
  {
    label: "Connections",
    href: "/admin/social/connections",
    icon: Link2,
    desc: "Manage connected social accounts",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Social Feed",
    href: "/admin/social/feed",
    icon: Rss,
    desc: "Monitor and schedule social posts",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    label: "Groups",
    href: "/admin/social/groups",
    icon: Users,
    desc: "Manage social audience groups",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Media Library",
    href: "/admin/social/media",
    icon: Image,
    desc: "Shared social media asset library",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK: "Facebook",
  TWITTER: "Twitter/X",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
};

export default function AdminSocialPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analyticsRes, postsRes] = await Promise.all([
          socialService.getAnalytics(),
          socialService.getPosts(),
        ]);
        setAnalytics(parseApiData<SocialAnalytics>(analyticsRes));
        const posts = parseApiData<unknown[]>(postsRes) ?? [];
        setScheduledCount(
          posts.filter((p) => {
            const post = p as { status?: string };
            return post.status === "SCHEDULED";
          }).length,
        );
      } catch {
        toast.error("Failed to load social dashboard");
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

  const connectedPlatforms = Object.entries(analytics?.platformDistribution ?? {}).filter(
    ([, count]) => count > 0,
  );
  const moduleStats: Record<string, string> = {
    "/admin/social/connections": `${connectedPlatforms.length} Connected`,
    "/admin/social/feed": `${scheduledCount} Scheduled`,
    "/admin/social/groups": `${connectedPlatforms.length} Groups`,
    "/admin/social/media": `${analytics?.overview.totalPosts ?? 0} Posts`,
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Social Media</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Omnichannel Social Management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SOCIAL_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={`p-2.5 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}
              >
                <mod.icon className={`w-5 h-5 ${mod.color}`} />
              </div>
              <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                {moduleStats[mod.href] ?? ""}
              </span>
            </div>
            <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors mb-1">
              {mod.label}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{mod.desc}</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" /> Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(PLATFORM_LABELS).map((platform) => {
            const count = analytics?.platformDistribution[platform] ?? 0;
            return (
              <div
                key={platform}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-black text-white">
                    {PLATFORM_LABELS[platform] ?? platform}
                  </p>
                  <p className="text-xs text-gray-500">{count} posts</p>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${
                    count > 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                  }`}
                >
                  {count > 0 ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Posts", value: analytics.overview.totalPosts },
            { label: "Total Likes", value: analytics.overview.totalLikes },
            { label: "Total Shares", value: analytics.overview.totalShares },
            { label: "Total Clicks", value: analytics.overview.totalClicks },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
