import React, { useState, useEffect } from 'react';
import { WorkOrder, CivicIssue, ResolutionVerification } from '../../types/civic';
import { store } from '../../services/store';
import { PriorityBadge, OperationalStatusBadge, VerificationStateBadge, WorkOrderStatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Camera,
  MapPin,
  FileCheck2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Layers,
  History,
} from 'lucide-react';

interface VerifiedResolutionTrackerProps {
  onOpenIssue?: (issue: CivicIssue) => void;
}

export const VerifiedResolutionTracker: React.FC<VerifiedResolutionTrackerProps> = ({
  onOpenIssue,
}) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(store.workOrders);
  const [issues, setIssues] = useState<CivicIssue[]>(store.issues);
  const [verifications, setVerifications] = useState<ResolutionVerification[]>(store.verifications);

  // Selected work order for verification review
  const [selectedWoId, setSelectedWoId] = useState<string>('WO-2026-085'); // default to Scenario G (Tactile ramp waiting for verification)
  const [verificationMethod, setVerificationMethod] = useState<ResolutionVerification['verificationMethod']>('physical_reinspection');
  const [verificationResult, setVerificationResult] = useState<'passed' | 'failed'>('passed');
  const [findingsNotes, setFindingsNotes] = useState('Physical re-inspection confirmed flush grade with carriageway. Pavers securely bedded in mortar.');
  const [limitationDisclaimer, setLimitationDisclaimer] = useState('Inspection verifies surface tactile and geometry under static daylight conditions.');
  const [verificationPhoto, setVerificationPhoto] = useState('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setWorkOrders([...store.workOrders]);
      setIssues([...store.issues]);
      setVerifications([...store.verifications]);
    });
    return unsub;
  }, []);

  const pendingVerificationOrders = workOrders.filter(
    (w) => w.status === 'completion_reported'
  );

  const activeWo = workOrders.find((w) => w.id === selectedWoId) || pendingVerificationOrders[0] || workOrders[0];
  const linkedIssue = issues.find((i) => i.id === activeWo?.issueId);

  const handleExecuteVerification = (result: 'passed' | 'failed') => {
    if (!activeWo) return;
    store.verifyResolution({
      workOrderId: activeWo.id,
      verificationMethod,
      result,
      findingsNotes: findingsNotes || (result === 'passed' ? 'Verified resolved.' : 'Verification failed. Defect remains.'),
      evidencePhotos: [verificationPhoto],
      limitationDisclaimer: limitationDisclaimer || 'Field inspection confirmed surface condition.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-teal-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Lifecycle Accountability Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Verified Resolution Tracking
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              In traditional city portals, issues get closed the moment a contractor marks a ticket "complete". In CivicScan, a reported completion is merely a claim until an independent physical re-inspection or resident consensus verifies that the defect was actually fixed.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-amber-400">
                {pendingVerificationOrders.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Unverified Claims</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-teal-300">
                {verifications.filter((v) => v.result === 'passed').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Verified Fixed</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-rose-400">
                {issues.filter((i) => i.isRecurring).length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Recurring Failures</div>
            </div>
          </div>
        </div>

        {/* 5-Stage Lifecycle Visualizer Bar */}
        <div className="mt-8 pt-6 border-t border-teal-900/50">
          <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-3">
            CivicScan Mandatory 5-Stage Verification Standard:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Stage 1</span>
              <div className="font-bold text-white">Geotagged Report</div>
              <p className="text-[11px] text-slate-400">Photo + coordinates captured</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Stage 2</span>
              <div className="font-bold text-white">Triage & Inspection</div>
              <p className="text-[11px] text-slate-400">Physical field audit & scoping</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Stage 3</span>
              <div className="font-bold text-white">Work Order Assigned</div>
              <p className="text-[11px] text-slate-400">Department/contractor dispatched</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/40 space-y-1">
              <span className="text-[10px] font-mono text-amber-300">Stage 4</span>
              <div className="font-bold text-amber-300">Completion Reported</div>
              <p className="text-[11px] text-amber-200">Contractor claims work done</p>
            </div>
            <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/40 space-y-1">
              <span className="text-[10px] font-mono text-teal-300">Stage 5</span>
              <div className="font-bold text-teal-300">Verified Resolution</div>
              <p className="text-[11px] text-teal-200">Independent audit passed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Claims Queue vs Verification Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Work Orders Awaiting Independent Verification */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
              Completion Claims Awaiting Audit
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {pendingVerificationOrders.length}
            </span>
          </div>

          {pendingVerificationOrders.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-lg">
              No work orders currently awaiting verification.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingVerificationOrders.map((wo) => {
                const isSelected = wo.id === activeWo?.id;
                return (
                  <div
                    key={wo.id}
                    onClick={() => setSelectedWoId(wo.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {wo.id}
                      </span>
                      <PriorityBadge priority={wo.priority} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{wo.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{wo.contractorOrCrew}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Target Issue: {wo.issueId}</span>
                      <span className="text-amber-700 font-semibold flex items-center">
                        Audit Pending
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historical Verified Resolutions List */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <FileCheck2 className="w-4 h-4 mr-1.5 text-teal-600" />
              Recent Verified Resolutions ({verifications.length})
            </h4>
            <div className="space-y-2">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-700">{v.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        v.result === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {v.result.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-700 line-clamp-1">{v.findingsNotes}</p>
                  <div className="text-[10px] text-slate-400">
                    By {v.verifiedBy} via {v.verificationMethod.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Side-by-Side Photographic Audit & Verification Execution Workbench */}
        {activeWo ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Active Work Order Claim Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Work Order: {activeWo.id}
                    </span>
                    <WorkOrderStatusBadge status={activeWo.status} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">{activeWo.title}</h2>
                  <p className="text-xs text-slate-600 mt-1">{activeWo.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400">Assigned Contractor</div>
                  <div className="text-xs font-bold text-slate-800">{activeWo.contractorOrCrew}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{activeWo.assignedDepartment}</div>
                </div>
              </div>

              {/* Side-by-Side Damage vs Completion Evidence */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center justify-between">
                  <span>Photographic Evidence Comparison</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Examine surface finish before signing verification
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Damage Photo */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="text-rose-700 font-bold">1. Original Defect Photo</span>
                      <span className="text-[11px] text-slate-400">At Initial Report</span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-slate-200 h-44">
                      <img
                        src={linkedIssue?.primaryPhotoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
                        alt="Original defect"
                        className="w-full h-44 object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {linkedIssue?.description || 'Initial damage observed at location.'}
                    </p>
                  </div>

                  {/* Contractor Reported Repair Photo */}
                  <div className="border border-amber-300 rounded-xl overflow-hidden bg-amber-50/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                      <span className="font-bold">2. Contractor Repair Photo (Claim)</span>
                      <span className="text-[11px] text-amber-700">Awaiting Verification</span>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-amber-200 h-44">
                      <img
                        src={
                          activeWo.completionReport?.completionPhotos[0] ||
                          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
                        }
                        alt="Contractor completion"
                        className="w-full h-44 object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2">
                      {activeWo.completionReport?.workSummary || 'Contractor reported repair finished.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contractor Work Summary Details */}
              {activeWo.completionReport && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Contractor Completion Submission:</span>
                    <span className="text-slate-500 font-normal">
                      Reported by {activeWo.completionReport.reportedByCrew} on{' '}
                      {new Date(activeWo.completionReport.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong>Materials: </strong>
                    {activeWo.completionReport.materialsUsed}
                  </p>
                  {activeWo.completionReport.technicianNotes && (
                    <p className="text-slate-600">
                      <strong>Notes: </strong>
                      {activeWo.completionReport.technicianNotes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Independent Verification Execution Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Execute Independent Resolution Audit
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Verification Method
                  </label>
                  <select
                    value={verificationMethod}
                    onChange={(e) =>
                      setVerificationMethod(
                        e.target.value as ResolutionVerification['verificationMethod']
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
                  >
                    <option value="physical_reinspection">Physical On-Site Re-inspection (Inspector)</option>
                    <option value="photographic_audit">Geotagged Photographic Audit</option>
                    <option value="resident_survey_consensus">Citizen Survey / RWA Consensus</option>
                    <option value="sensor_reading">Civic Drainage/Vibration Sensor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Auditing Inspector / Authority
                  </label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium">
                    {store.currentUser.name} ({store.currentUser.organization})
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-semibold text-slate-700">
                  Verification Findings & Condition Audit
                </label>
                <textarea
                  rows={2}
                  value={findingsNotes}
                  onChange={(e) => setFindingsNotes(e.target.value)}
                  placeholder="Record observations: e.g. Surface level test, water flow check, tactile alignment..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-semibold text-slate-700">
                  Engineering Limitation Disclaimer
                </label>
                <input
                  type="text"
                  value={limitationDisclaimer}
                  onChange={(e) => setLimitationDisclaimer(e.target.value)}
                  placeholder="e.g. Verified under dry conditions; monsoon storm flow requires secondary check."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleExecuteVerification('failed')}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject & Reopen (Defect Persists / Substandard)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteVerification('passed')}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Certify Verified Resolution</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
