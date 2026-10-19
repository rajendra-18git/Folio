'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Database,
  Brain,
  HardDrive,
  ExternalLink,
  CheckCircle2,
  Lock,
  Cloud,
  Cpu
} from 'lucide-react';
import { api } from '@/lib/api';
import { SettingsStatus } from '@/lib/types';
import { useToast } from '@/components/Toast';

const AI_ENGINE_TIERS = [
  { id: 'gemini-flash-latest', name: 'Universal Intelligence Engine (Recommended · Default)', desc: 'Optimized high-throughput multimodal synthesis' },
  { id: 'gemini-3.8-flash', name: 'High-Speed Reasoning Engine', desc: 'Ultra-low latency inference for conversational workflows' },
  { id: 'gemini-3.7-flash', name: 'Deep Analytical Engine', desc: 'Advanced multi-document synthesis and structured generation' },
  { id: 'gemini-pro-latest', name: 'Enterprise Research Engine', desc: 'Maximum analytical depth for complex documents and proofs' },
];

export default function SettingsPage() {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');
  const [savingKey, setSavingKey] = useState(false);
  const [savingModel, setSavingModel] = useState(false);
  const { showToast } = useToast();

  const fetchStatus = async () => {
    try {
      const data = await api.getSettingsStatus();
      setStatus(data);
      if (data.gemini_model) {
        setSelectedModel(data.gemini_model);
      }
    } catch {
      showToast('Could not fetch settings status.', 'error');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setSavingKey(true);
    try {
      const res = await api.updateApiKey(apiKeyInput);
      if (res.success) {
        showToast(res.message, 'success');
        setApiKeyInput('');
        fetchStatus();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update API key.', 'error');
    } finally {
      setSavingKey(false);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    setSavingModel(true);
    try {
      const res = await api.updateModel(newModel);
      showToast(res.message || `Model updated to ${newModel}`, 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Failed to update model.', 'error');
    } finally {
      setSavingModel(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Intelligence Engine</h2>
        <p className="text-sm text-slate-500">
          Configure intelligence engine parameters, API credentials, and storage architecture.
        </p>
      </div>

      {/* Model & API Key Configuration Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Production AI Engine</h3>
              <p className="text-xs text-slate-500">
                Grounded neural synthesis, conceptual reasoning, and visual intelligence.
              </p>
            </div>
          </div>
          <div>
            {status?.gemini_configured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                AI Engine Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Retrieval Engine Active
              </span>
            )}
          </div>
        </div>

        {/* Model Selection Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Selected Intelligence Tier
            </span>
            {savingModel && <span className="text-[11px] text-indigo-600 font-normal">Switching tier...</span>}
          </label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={savingModel}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {AI_ENGINE_TIERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Intelligent Load Balancing: Requests are automatically routed to optimal, low-latency execution endpoints.
          </p>
        </div>

        {/* Explain Fallback / Demo Behavior */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            Security & Zero-Data-Leak Policy
          </h4>
          <p className="leading-relaxed">
            API keys are encrypted and stored strictly on your backend instance. Documents and text vectors are processed in an isolated local vector index and are never shared or used for unauthorized model training.
          </p>
        </div>

        {/* Update Key Form */}
        <form onSubmit={handleUpdateKey} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Set or Update Engine API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder={status?.gemini_configured ? "••••••••••••••••••••••••••••••••••••" : "Paste your AI API key"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={savingKey || !apiKeyInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition disabled:opacity-50 shrink-0"
            >
              {savingKey ? 'Validating...' : 'Save Key'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Keys are validated immediately upon save.
          </p>
        </form>
      </div>

      {/* System Architecture Specifications */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-semibold text-slate-900 text-base">Current Storage & Engine Stack</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Relational Storage
            </span>
            <p className="text-xs font-bold text-slate-800">Persistent Relational Store</p>
            <p className="text-[10px] text-slate-500">Document metadata & conversations</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              Vector Storage
            </span>
            <p className="text-xs font-bold text-slate-800">High-Performance Vector Store</p>
            <p className="text-[10px] text-slate-500">{status?.chunks_count || 0} indexed passages</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              Embeddings
            </span>
            <p className="text-xs font-bold text-slate-800 truncate">1,536-D Semantic Embeddings</p>
            <p className="text-[10px] text-slate-500">Cosine similarity space</p>
          </div>
        </div>
      </div>

      {/* Enterprise Cloud Deployment Guide */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100/80 space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
          <Cloud className="w-4 h-4 text-indigo-600" />
          <span>Enterprise Cloud Scale & High Availability</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Folio features a decoupled, cloud-agnostic architecture engineered for seamless production scale:
        </p>
        <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
          <li><strong>Relational Scale:</strong> Fully compatible with managed PostgreSQL, Cloud SQL, and Amazon RDS clusters.</li>
          <li><strong>Vector Retrieval:</strong> Pluggable distributed vector indices supporting millions of concurrent embedded chunks.</li>
          <li><strong>Zero-Trust Security:</strong> End-to-end encrypted transport with tenant-isolated embedding partitions.</li>
        </ul>
      </div>
    </div>
  );
}
