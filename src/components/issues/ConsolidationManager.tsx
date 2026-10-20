import React, { useState, useEffect } from 'react';
import { IssueReport, CivicIssue } from '../../types/civic';
import { store, calculateDistanceMeters } from '../../services/store';
import { PriorityBadge, ValidationStatusBadge, OperationalStatusBadge } from '../common/StatusBadge';
import {
  GitMerge,
  GitBranch,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Info,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface ConsolidationManagerProps {
  onOpenIssue?: (issue: CivicIssue) => void;
  onOpenReport?: (report: IssueReport) => void;
}

export const ConsolidationManager: React.FC<ConsolidationManagerProps> = ({
  onOpenIssue,
  onOpenReport,
}) => {
  const [reports, setReports] = useState<IssueReport[]>(store.reports);
  const [issues, setIssues] = useState<CivicIssue[]>(store.issues);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [mergeRationale, setMergeRationale] = useState<string>('Confirmed duplicate observation of the same physical defect.');
  const [activeTab, setActiveTab] = useState<'pending_suggestions' | 'merged_hierarchy' | 'deconsolidation'>('pending_suggestions');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(40);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setReports([...store.reports]);
      setIssues([...store.issues]);
    });
    return unsub;
  }, []);

  // Compute duplicate suggestion matrix
  const unmergedReports = reports.filter((r) => !r.canonicalIssueId);

  const candidatePairs: {
    report: IssueReport;
    matches: ReturnType<typeof store.findDuplicateCandidatesForReport>;
  }[] = unmergedReports
    .map((r) => ({
      report: r,
      matches: store.findDuplicateCandidatesForReport(r),
    }))
    .filter((pair) => pair.matches.length > 0 && pair.matches[0].matchScore >= minScore);

  const selectedPair = candidatePairs.find((p) => p.report.id === selectedReportId) || candidatePairs[0];

  const handleConfirmMerge = (reportId: string, targetIssueId: string, rationale: string) => {
    store.mergeReportIntoIssue(reportId, targetIssueId, rationale);
    // select next pair
    const remaining = candidatePairs.filter((p) => p.report.id !== reportId);
    if (remaining.length > 0) {
      setSelectedReportId(remaining[0].report.id);
    }
  };

  const handleSeparateReport = (reportId: string) => {
    store.separateReportFromIssue(reportId);
  };

  const handleCreateIndependentIssue = (reportId: string) => {
    store.createCanonicalIssueFromReport(reportId);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Civic Issue Intelligence & Consolidation Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Explainable Duplicate Detection & Consolidation
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              When five residents report the same pothole or waterlogging spot, CivicScan clusters them into a single connected infrastructure record while preserving every original observation, photo provenance, and reporter timestamp.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-purple-300">{candidatePairs.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Match Clusters</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-emerald-400">
                {reports.filter((r) => r.canonicalIssueId).length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Consolidated</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-amber-400">{unmergedReports.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Standalone</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-purple-900/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pending_suggestions')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
              activeTab === 'pending_suggestions'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <GitMerge className="w-4 h-4" />
            <span>Review Duplicate Suggestions ({candidatePairs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('merged_hierarchy')}
            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
              activeTab === 'merged_hierarchy'
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Consolidated Infrastructure Trees</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING DUPLICATE SUGGESTIONS WORKBENCH */}
      {activeTab === 'pending_suggestions' && (
        <div className="space-y-6">
          {candidatePairs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                All Reports Successfully Triaged
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No unreviewed duplicate clusters found within current proximity and category thresholds. New reports will be analyzed automatically upon submission.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: List of Candidate Reports */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Unmerged Reports with Matches
                  </h3>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {candidatePairs.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {candidatePairs.map((pair) => {
                    const isSelected = pair.report.id === selectedPair?.report.id;
                    const topMatch = pair.matches[0];
                    return (
                      <div
                        key={pair.report.id}
                        onClick={() => setSelectedReportId(pair.report.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                            {pair.report.id}
                          </span>
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            {topMatch.matchScore}% Match
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                          {pair.report.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {pair.report.location.addressText}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono">
                            Dist: {topMatch.distanceMeters}m
                          </span>
                          <span className="text-indigo-600 font-semibold flex items-center">
                            Target: {topMatch.issue.id}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 2 Columns: Explainable Comparison & Merge Triage Workbench */}
              {selectedPair && (
                <div className="lg:col-span-2 space-y-6">
                  {/* Top Match Explanation Banner */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Algorithmic Consolidation Rationale
                        </span>
                      </div>
                      <div className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                        Match Confidence: {selectedPair.matches[0].matchScore}%
                      </div>
                    </div>

                    <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5 text-xs text-purple-950">
                      <div className="font-bold flex items-center text-purple-900">
                        <Info className="w-4 h-4 mr-1.5 text-purple-600" />
                        Matched Factors:
                      </div>
                      <p className="leading-relaxed pl-5 font-medium">
                        {selectedPair.matches[0].matchRationale}
                      </p>
                      {selectedPair.matches[0].isLikelyRecurrence && (
                        <div className="mt-2 p-2 bg-red-100/80 border border-red-300 rounded-lg text-red-900 text-xs font-bold flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1.5 text-red-600 shrink-0" />
                          Recurrence Alert: A prior repair was recorded for this canonical issue. Merging this report will automatically increment the recurrence counter and flag it for engineering review!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Side-by-Side Comparison: Candidate Report vs Canonical Issue */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Candidate Report Card */}
                    <div className="bg-white rounded-xl border-2 border-purple-300 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Incoming Report: {selectedPair.report.id}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(selectedPair.report.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          {selectedPair.report.title}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          {selectedPair.report.category} • {selectedPair.report.subcategory}
                        </div>

                        {selectedPair.report.attachments[0]?.url && (
                          <div className="rounded-lg overflow-hidden border border-slate-200 max-h-44">
                            <img
                              src={selectedPair.report.attachments[0].url}
                              alt="Report photo"
                              className="w-full h-44 object-cover"
                            />
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedPair.report.description}
                        </p>

                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{selectedPair.report.location.addressText}</span>
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-500 font-medium">
                        Reporter: {selectedPair.report.reporterName} ({selectedPair.report.reporterRole})
                      </div>
                    </div>

                    {/* Target Canonical Issue Card */}
                    <div className="bg-white rounded-xl border-2 border-indigo-300 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Canonical Issue: {selectedPair.matches[0].issue.id}
                          </span>
                          <PriorityBadge priority={selectedPair.matches[0].issue.priority} />
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          {selectedPair.matches[0].issue.title}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          {selectedPair.matches[0].issue.canonicalCategory} •{' '}
                          {selectedPair.matches[0].issue.subcategory}
                        </div>

                        {selectedPair.matches[0].issue.primaryPhotoUrl && (
                          <div className="rounded-lg overflow-hidden border border-slate-200 max-h-44">
                            <img
                              src={selectedPair.matches[0].issue.primaryPhotoUrl}
                              alt="Canonical issue photo"
                              className="w-full h-44 object-cover"
                            />
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedPair.matches[0].issue.description}
                        </p>

                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{selectedPair.matches[0].issue.canonicalLocation.addressText}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-700 font-semibold">
                          {selectedPair.matches[0].issue.linkedReportIds.length} connected report(s)
                        </span>
                        <OperationalStatusBadge
                          status={selectedPair.matches[0].issue.operationalStatus}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review Action Controls */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Reviewer Triage Decision
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Consolidation Rationale / Auditor Justification
                      </label>
                      <input
                        type="text"
                        value={mergeRationale}
                        onChange={(e) => setMergeRationale(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                        placeholder="State reason for linking these observations..."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => handleCreateIndependentIssue(selectedPair.report.id)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <GitBranch className="w-4 h-4 text-slate-500" />
                        <span>Mark as Distinct Issue (Do Not Merge)</span>
                      </button>

                      <button
                        onClick={() =>
                          handleConfirmMerge(
                            selectedPair.report.id,
                            selectedPair.matches[0].issue.id,
                            mergeRationale
                          )
                        }
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/20 flex items-center space-x-2 transition"
                      >
                        <GitMerge className="w-4 h-4" />
                        <span>Confirm Merge into {selectedPair.matches[0].issue.id}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSOLIDATED INFRASTRUCTURE TREES & DECONSOLIDATION */}
      {activeTab === 'merged_hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Consolidated Canonical Issues & Underlying Report Provenance
              </h3>
              <p className="text-xs text-slate-500">
                CivicScan never destroys original reports. Review the full lineage of clustered observations below. If an erroneous merge was made, you can separate the report with one click.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {issues.map((issue) => {
                const connectedReports = reports.filter((r) => issue.linkedReportIds.includes(r.id));
                return (
                  <div
                    key={issue.id}
                    className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {issue.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {issue.canonicalCategory}
                          </span>
                          {issue.isRecurring && (
                            <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                              ↺ Recurring ({issue.recurrenceCount}x)
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{issue.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {issue.canonicalLocation.addressText}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <PriorityBadge priority={issue.priority} />
                        <OperationalStatusBadge status={issue.operationalStatus} />
                      </div>
                    </div>

                    {/* Connected Reports Hierarchy */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Connected Resident Observations ({connectedReports.length})</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          All reports maintain individual timestamps & photos
                        </span>
                      </div>

                      {connectedReports.length === 0 ? (
                        <div className="text-xs text-slate-400 italic">No reports currently linked.</div>
                      ) : (
                        <div className="space-y-2">
                          {connectedReports.map((r) => (
                            <div
                              key={r.id}
                              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                    {r.id}
                                  </span>
                                  <span className="font-semibold text-slate-900">{r.title}</span>
                                </div>
                                <p className="text-slate-600 line-clamp-1">{r.description}</p>
                                <div className="text-[11px] text-slate-400">
                                  Observed: {new Date(r.observedAt).toLocaleString()} • Reporter: {r.reporterName}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  onClick={() => handleSeparateReport(r.id)}
                                  className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 text-[11px] font-semibold transition"
                                >
                                  Separate (Reverse Merge)
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
