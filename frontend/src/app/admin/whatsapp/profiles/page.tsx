"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Globe, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseApiData } from "@/lib/api/parse-response";
import { subAdminWhatsappService } from "@/services/sub-admin-whatsapp.service";

interface WhatsappProfile {
  id: string;
  key: string;
  value: Record<string, unknown>;
  group: string;
  updatedAt?: string;
}

function profileDisplayName(profile: WhatsappProfile): string {
  const value = profile.value ?? {};
  return String(value.displayName ?? value.name ?? profile.key);
}

function profilePhone(profile: WhatsappProfile): string {
  const value = profile.value ?? {};
  return String(value.phone ?? value.phoneNumber ?? "—");
}

function profileStatus(profile: WhatsappProfile): string {
  const value = profile.value ?? {};
  return String(value.status ?? "CONFIGURED");
}

export default function AdminWhatsAppProfilesPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<WhatsappProfile[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const envelope = await subAdminWhatsappService.getProfiles();
        setProfiles(parseApiData<WhatsappProfile[]>({ data: envelope }) ?? []);
      } catch {
        toast.error("Failed to load WhatsApp profiles");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">WhatsApp Profiles</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            WhatsApp Business Account Management
          </p>
        </div>
        <button className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-green-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-sm text-gray-500">No WhatsApp profiles linked for this tenant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-green-500/20 transition-all"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {profileDisplayName(profile)}
                    </h3>
                    <p className="text-xs text-gray-500">{profile.key}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    profileStatus(profile) === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {profileStatus(profile)}
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-gray-600" /> {profilePhone(profile)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Globe className="w-3.5 h-3.5 text-gray-600" /> {profile.group}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
