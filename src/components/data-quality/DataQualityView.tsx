import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { AuditRecord } from '../../types/civic';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  User,
  History,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

export const DataQualityView: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(store.auditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAuditLogs([...store.auditLogs]);
    });
    return unsub;
  }, []);

  const reports = store.reports;
  const issues = store.issues;

  // Data Integrity Health Checks
  const missingGpsReports = reports.filter((r) => r.location.source !== 'gps_verified');
  const inconclusivePhotos = reports.filter(
    (r) =>
      r.attachments[0]?.visionAnalysis &&
      r.attachments[0].visionAnalysis.confidenceScore < 0.6
  );
  const unmergedReports = reports.filter((r) => !r.canonicalIssueId);
  const unverifiedCompletions = store.workOrders.filter(
    (w) => w.status === 'completion_reported'
  );

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Governance & Source Integrity</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Data Quality & Audit Integrity
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            CivicScan separates automated AI suggestions from human certified decisions, flags low-confidence photos or manual GPS pins, and maintains an immutable audit log of every lifecycle transition.
          </p>
        </div>
      </div>

      {/* 4 Health Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Manual / Approximate GPS</div>
          <div className="text-2xl font-black text-amber-600">{missingGpsReports.length}</div>
          <p className="text-[11px] text-slate-400">Reports lacking hardware GPS fix</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Inconclusive Photo Evidence</div>
          <div className="text-2xl font-black text-purple-600">{inconclusivePhotos.length}</div>
          <p className="text-[11px] text-slate-400">Flagged for extra daylight photo</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Unconsolidated Reports</div>
          <div className="text-2xl font-black text-indigo-600">{unmergedReports.length}</div>
          <p className="text-[11px] text-slate-400">Awaiting cluster merge review</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500">Unverified Work Orders</div>
          <div className="text-2xl font-black text-teal-600">{unverifiedCompletions.length}</div>
          <p className="text-[11px] text-slate-400">Claims awaiting independent sign-off</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <History className="w-4 h-4 mr-2 text-indigo-600" />
              Immutable Lifecycle Audit Trail ({filteredLogs.length} events)
            </h3>
            <p className="text-xs text-slate-500">
              Every status change, consolidation merge, inspection finding, and verification cert is recorded with actor credentials.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                    {log.id}
                  </span>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-indigo-600 font-mono">({log.entityType} #{log.entityId})</span>
                </div>
                <p className="text-slate-600">{log.details}</p>
              </div>

              <div className="text-right shrink-0 text-[11px] text-slate-400">
                <div className="font-semibold text-slate-700">
                  {log.actorName} ({log.actorRole})
                </div>
                <div>{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
