import React, { useState, useEffect } from 'react';
import { HotspotCluster, CivicIssue } from '../../types/civic';
import { store } from '../../services/store';
import { CivicMap } from '../map/CivicMap';
import {
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Layers,
  ArrowRight,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface HotspotIntelligenceProps {
  onSelectIssue?: (issue: CivicIssue) => void;
}

export const HotspotIntelligence: React.FC<HotspotIntelligenceProps> = ({ onSelectIssue }) => {
  const [hotspots, setHotspots] = useState<HotspotCluster[]>(store.hotspots);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(hotspots[0]?.id || '');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setHotspots([...store.hotspots]);
    });
    return unsub;
  }, []);

  const activeHotspot = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];
  const linkedIssues = store.issues.filter((i) => activeHotspot?.issueIds.includes(i.id));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Predictive Recurrence & Spatial Clustering</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hotspot & Infrastructure Recurrence Intelligence
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pinpoint chronic structural bottlenecks where temporary repairs fail repeatedly. CivicScan compares report density, historical work orders, and field observations to separate transient defects from systemic engineering failures.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-rose-400">{hotspots.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Chronic Zones</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-amber-400">73%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Avg Recurrence</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-indigo-300">
                {hotspots.reduce((acc, h) => acc + h.reportCount, 0)}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Clustered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Hotspot Registry & Selected Zone Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hotspot Zone Cards */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
              Identified Hotspot Clusters ({hotspots.length})
            </h3>
          </div>

          <div className="space-y-3">
            {hotspots.map((hs) => {
              const isSelected = hs.id === activeHotspot?.id;
              return (
                <div
                  key={hs.id}
                  onClick={() => setSelectedHotspotId(hs.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                        {hs.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{hs.name}</h4>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                      {hs.recurrenceRate}% Repeat
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">{hs.contributingHypothesis}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      {hs.reportCount} reports • {hs.distinctIssueCount} canonical issues
                    </span>
                    <span className="font-semibold text-rose-700">Radius: {hs.radiusMeters}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Deep-Dive on Active Hotspot */}
        {activeHotspot ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Zone: {activeHotspot.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {activeHotspot.ward}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {activeHotspot.primaryCategory}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">{activeHotspot.name}</h2>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400">Recurrence Frequency</div>
                  <div className="text-xl font-extrabold text-rose-600">
                    {activeHotspot.recurrenceRate}%
                  </div>
                  <div className="text-[10px] text-slate-500">of repairs returned within 60 days</div>
                </div>
              </div>

              {/* Contributing Hypothesis vs Ground Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-amber-900 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                    Engineering Hypothesis (Root Cause)
                  </div>
                  <p className="text-amber-950 leading-relaxed font-medium">
                    {activeHotspot.contributingHypothesis}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Observed Field Evidence
                  </div>
                  <p className="text-emerald-950 leading-relaxed font-medium">
                    {activeHotspot.evidenceBasis}
                  </p>
                </div>
              </div>

              {/* Recommended Systemic Intervention */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 text-xs text-indigo-950">
                <div className="font-bold text-indigo-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Recommended Systemic Municipal Action (Prevent Repeat Failure)
                </div>
                <p className="leading-relaxed font-medium">
                  {activeHotspot.recommendedSystemicAction}
                </p>
              </div>

              {/* Linked Canonical Issues in this Zone */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Linked Canonical Issues in Cluster ({linkedIssues.length})
                </h4>
                <div className="space-y-2">
                  {linkedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue && onSelectIssue(issue)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 cursor-pointer transition text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-700">{issue.id}</span>
                          <span className="font-bold text-slate-900">{issue.title}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {issue.canonicalLocation.addressText} • Recurrence: {issue.recurrenceCount}x
                        </p>
                      </div>
                      <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-indigo-600 font-semibold text-xs flex items-center space-x-1 hover:bg-slate-100">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
