import React, { useState, useEffect } from 'react';
import { CivicIssue, AreaScan, WorkOrder, IssueReport } from '../../types/civic';
import { store } from '../../services/store';
import { CivicMap } from '../map/CivicMap';
import { PriorityBadge, OperationalStatusBadge, VerificationStateBadge, WorkOrderStatusBadge } from '../common/StatusBadge';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Footprints,
  Compass,
  ArrowRight,
  GitMerge,
  FileCheck2,
  Building2,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (tab: any) => void;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, onSelectIssue }) => {
  const [metrics, setMetrics] = useState(store.getMetrics());
  const [issues, setIssues] = useState(store.issues);
  const [reports, setReports] = useState(store.reports);
  const [currentUser, setCurrentUser] = useState(store.currentUser);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setMetrics(store.getMetrics());
      setIssues([...store.issues]);
      setReports([...store.reports]);
      setCurrentUser({ ...store.currentUser });
    });
    return unsub;
  }, []);

  const recurringIssues = issues.filter((i) => i.isRecurring);
  const unverifiedWorkOrders = store.workOrders.filter((w) => w.status === 'completion_reported');

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Role Mission Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CivicScan Citywide Intelligence & Accountability Platform</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              See the problem. Track the fix. Improve your city.
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Combining resident reports, systematic area inspections, geotagged evidence, repeat-defect detection, and verified outcome tracking to keep municipal public works accountable.
            </p>
          </div>

          {/* Quick Role Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-2 min-w-64">
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
              Current Operating View
            </div>
            <div className="font-extrabold text-sm text-white">{currentUser.name}</div>
            <div className="text-indigo-200 capitalize font-medium">{currentUser.organization}</div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Jurisdiction:</span>
              <span className="font-bold text-white">{currentUser.ward}</span>
            </div>
          </div>
        </div>

        {/* 6 Key Operational Metrics (Honest Distinction) */}
        <div className="mt-8 pt-6 border-t border-indigo-900/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Submitted Reports</div>
            <div className="text-2xl font-black text-white mt-0.5">{metrics.totalReports}</div>
            <div className="text-[10px] text-slate-400 mt-1">Raw citizen submissions</div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Distinct Issues</div>
            <div className="text-2xl font-black text-indigo-300 mt-0.5">{metrics.totalIssues}</div>
            <div className="text-[10px] text-slate-400 mt-1">Clustered canonical defects</div>
          </div>

          <div className="p-3.5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <div className="text-[11px] text-rose-300 font-medium">Recurring Defect Rate</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{metrics.recurrenceRate}%</div>
            <div className="text-[10px] text-rose-300 mt-1">{metrics.recurringIssues} chronic failures</div>
          </div>

          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <div className="text-[11px] text-amber-300 font-medium">Unverified Claims</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {metrics.completionsAwaitingVerification}
            </div>
            <div className="text-[10px] text-amber-200 mt-1">Contractor claimed complete</div>
          </div>

          <div className="p-3.5 bg-teal-500/10 rounded-2xl border border-teal-500/20">
            <div className="text-[11px] text-teal-300 font-medium">Verified Resolutions</div>
            <div className="text-2xl font-black text-teal-300 mt-0.5">
              {metrics.verifiedResolutions}
            </div>
            <div className="text-[10px] text-teal-200 mt-1">Passed independent audit</div>
          </div>

          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <div className="text-[11px] text-emerald-300 font-medium">Proactive Sweeps</div>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">
              {metrics.completedScans}
            </div>
            <div className="text-[10px] text-emerald-200 mt-1">Systematic area scans</div>
          </div>
        </div>
      </div>

      {/* 3 Core Hero Features Action Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1: Area Scanning */}
        <div
          onClick={() => onNavigate('scan')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Footprints className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
              1. Proactive Area Scanning
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Don't wait for complaints. Perform systematic walking and facility sweeps with live GPS tracking, waypoint logging, and coverage calculation.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-700 pt-2 border-t border-slate-100">
            <span>Launch Sweep Tracker</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Feature 2: Issue Consolidation Engine */}
        <div
          onClick={() => onNavigate('consolidation')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-purple-500 p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <GitMerge className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition">
              2. Issue Consolidation Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Turn scattered reports into a cohesive infrastructure history. Algorithmic duplicate matching with explainable distance and category scoring.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-700 pt-2 border-t border-slate-100">
            <span>Review Duplicate Clusters</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Feature 3: Verified Resolution Tracking */}
        <div
          onClick={() => onNavigate('verification')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-teal-500 p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition">
              3. Verified Resolution Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never accept unverified contractor claims. Rigorous 5-stage lifecycle verification requires independent physical inspection before closure.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-teal-700 pt-2 border-t border-slate-100">
            <span>Audit Unverified Repairs</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Interactive Map Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Citywide Geospatial Defect Intelligence</h2>
            <p className="text-xs text-slate-500">Live markers showing verified resolutions, active claims, and recurring clusters.</p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>Open Fullscreen GIS Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <CivicMap
          issues={issues}
          reports={reports}
          hotspots={store.hotspots}
          assets={store.assets}
          onSelectIssue={onSelectIssue}
          heightClass="h-[420px]"
        />
      </div>

      {/* Recurrence Alerts & Unverified Completion Claims Workbench Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recurrent Infrastructure Failure Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Recurrence Alerts (Failed Previous Repairs)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {recurringIssues.length} Alarms
            </span>
          </div>

          <div className="space-y-3">
            {recurringIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl hover:border-rose-400 cursor-pointer transition space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200">
                      {issue.id}
                    </span>
                    <span className="font-bold text-slate-900 line-clamp-1">{issue.title}</span>
                  </div>
                  <PriorityBadge priority={issue.priority} />
                </div>

                <p className="text-slate-600 line-clamp-2">{issue.description}</p>

                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-900 font-medium">
                  <span>Failed after {issue.daysToRecurrence || 44} days</span>
                  <span className="font-bold flex items-center">
                    Inspect Recurrence History
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Unverified Work Order Claims Awaiting Inspector Audit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Completion Claims Awaiting Verification
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {unverifiedWorkOrders.length} Claims
            </span>
          </div>

          <div className="space-y-3">
            {unverifiedWorkOrders.map((wo) => (
              <div
                key={wo.id}
                onClick={() => onNavigate('verification')}
                className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl hover:border-amber-400 cursor-pointer transition space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {wo.id}
                    </span>
                    <span className="font-bold text-slate-900 line-clamp-1">{wo.title}</span>
                  </div>
                  <WorkOrderStatusBadge status={wo.status} />
                </div>

                <p className="text-slate-600 line-clamp-2">
                  Contractor {wo.contractorOrCrew} claimed repair finished with photographic evidence.
                </p>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900 font-medium">
                  <span>Target Issue: {wo.issueId}</span>
                  <span className="font-bold flex items-center">
                    Open Verification Audit
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
