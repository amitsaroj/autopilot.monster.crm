'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { socialService } from '@/services/social.service';
import { parseApiData } from '@/lib/api/parse-response';
interface SocialGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  platform: string;
  created: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter',
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
};

export default function AdminSocialGroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<SocialGroup[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await socialService.getAnalytics();
        const analytics = parseApiData<{
          platformDistribution: Record<string, number>;
          overview: { totalPosts: number };
        }>(res);
        const distribution = analytics?.platformDistribution ?? {};
        const built: SocialGroup[] = Object.entries(distribution)
          .filter(([, count]) => count > 0)
          .map(([platform, count]) => ({
            id: platform,
            name: `${PLATFORM_LABELS[platform] ?? platform} Audience`,
            description: `Posts published on ${PLATFORM_LABELS[platform] ?? platform}`,
            members: count,
            platform: PLATFORM_LABELS[platform] ?? platform,
            created: new Date().toISOString().slice(0, 10),
          }));
        setGroups(built);
      } catch {
        toast.error('Failed to load social groups');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Social Groups</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Audience Segment Management
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="p-12 rounded-2xl bg-card border border-border text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No platform audiences with posts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {groups.map((g) => (
            <div
              key={g.id}
              className="p-6 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-4">
                <Users className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                {g.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{g.description}</p>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {g.members} posts
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  {g.platform}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
