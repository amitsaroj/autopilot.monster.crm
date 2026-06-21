"use client";

import { useEffect, useState } from "react";
import { Cpu, Save, RefreshCw, Bot } from "lucide-react";
import { toast } from "sonner";

import { adminAiSettingsService } from "@/services/admin-ai-settings.service";

export default function AISettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    defaultModel: "gpt-4o",
    embeddingModel: "text-embedding-3-small",
    platformRole: "You are an advanced CRM assistant.",
    openaiKey: "",
  });

  useEffect(() => {
    void adminAiSettingsService.getSettings().then((res) => {
      const data = (res as { data?: typeof formData }).data ?? res;
      if (data && typeof data === 'object') {
        setFormData((prev) => ({ ...prev, ...data }));
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminAiSettingsService.updateSettings(formData);
      toast.success("AI settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Orchestration</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide LLM models, embeddings, and defaults</p>
        </div>
        <button
          onClick={() => void handleSave()}
          disabled={loading}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <div className="p-8 rounded-xl border border-border bg-card space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Cpu className="w-5 h-5" /> Model Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Default chat model</label>
            <select
              value={formData.defaultModel}
              onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Embedding model</label>
            <input
              value={formData.embeddingModel}
              onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-8 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Bot className="w-5 h-5" /> Platform Role</h2>
        <textarea
          value={formData.platformRole}
          onChange={(e) => setFormData({ ...formData, platformRole: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
