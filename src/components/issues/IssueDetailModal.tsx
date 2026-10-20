import React, { useState } from 'react';
import { CivicIssue, IssueReport, WorkOrder, Inspection, ResolutionVerification } from '../../types/civic';
import { store } from '../../services/store';
import {
  PriorityBadge,
  OperationalStatusBadge,
  VerificationStateBadge,
  ValidationStatusBadge,
  WorkOrderStatusBadge,
} from '../common/StatusBadge';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  History,
  FileCheck2,
  Wrench,
  Camera,
  Layers,
  Sparkles,
  GitMerge,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface IssueDetailModalProps {
  issue: CivicIssue;
  onClose: () => void;
  onOpenReport?: (reportId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'reports' | 'work_order' | 'audit'>('timeline');

  const connectedReports = store.reports.filter((r) => issue.linkedReportIds.includes(r.id));
  const activeWorkOrder = store.workOrders.find((w) => w.id === issue.activeWorkOrderId);
  const activeInspection = store.inspections.find((i) => i.id === issue.activeInspectionId);
  const relatedVerifications = store.verifications.filter((v) => v.issueId === issue.id);
  const relatedAudits = store.auditLogs.filter((a) => a.entityId === issue.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {issue.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {issue.canonicalCategory}
              </span>
              <PriorityBadge priority={issue.priority} />
              <OperationalStatusBadge status={issue.operationalStatus} />
              <VerificationStateBadge state={issue.verificationState} />
              {issue.isRecurring && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                  ↺ Recurring Defect ({issue.recurrenceCount}x)
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{issue.title}</h2>
            <div className="flex items-center text-xs text-slate-500 space-x-3">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {issue.canonicalLocation.addressText} ({issue.canonicalLocation.ward})
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                First observed: {new Date(issue.firstObservedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Resolution Lifecycle & Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Connected Reports ({connectedReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('work_order')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'work_order'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Work Orders & Repair Evidence</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail & Provenance</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: LIFECYCLE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Recurrence Warning Banner if applicable */}
              {issue.isRecurring && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-red-950">
                  <div className="flex items-center space-x-2 font-bold text-red-900 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Recurrent Infrastructure Failure Detected</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    This location was previously marked complete or repaired on{' '}
                    {issue.lastRepairedAt ? new Date(issue.lastRepairedAt).toLocaleDateString() : 'recent date'}, but failed again after {issue.daysToRecurrence || 44} days. CivicScan has prevented silent closure and alerted municipal engineering for structural sub-base remediation.
                  </p>
                </div>
              )}

              {/* Primary Photo & Technical Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100">
                  <img
                    src={issue.primaryPhotoUrl}
                    alt={issue.title}
                    className="w-full h-56 object-cover"
                  />
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">Engineering Assessment</div>
                  <p className="text-slate-700 leading-relaxed">{issue.description}</p>
                  <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                    <div>
                      <strong>Assigned Department:</strong> {issue.assignedDepartment}
                    </div>
                    <div>
                      <strong>Priority Rationale:</strong> {issue.priorityRationale}
                    </div>
                    {issue.assetId && (
                      <div>
                        <strong>Connected Infrastructure Asset:</strong> {issue.assetId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vertical Lifecycle Stepper */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Transparent 5-Stage Verification Progress
                </h4>

                <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Observed */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <div className="font-bold text-slate-900">
                      1. Observation Recorded & Geotagged
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      First captured on {new Date(issue.firstObservedAt).toLocaleString()} via{' '}
                      {issue.canonicalLocation.source}.
                    </p>
                  </div>

                  {/* Step 2: Inspected */}
                  <div className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeInspection || issue.validationStatus === 'validated'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {activeInspection ? '✓' : '2'}
                    </span>
                    <div className="font-bold text-slate-900">2. Field Triage & Inspection</div>
                    <p className="text-slate-500 mt-0.5">
                      {activeInspection
                        ? `Inspection ${activeInspection.id} assigned to ${activeInspection.assignedInspectorName}. Status: ${activeInspection.status}`
                        : 'Validated by municipal engineering queue.'}
                    </p>
                  </div>

                  {/* Step 3: Work Order */}
                  <div className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeWorkOrder
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {activeWorkOrder ? '✓' : '3'}
                    </span>
                    <div className="font-bold text-slate-900">3. Work Order Dispatched</div>
                    <p className="text-slate-500 mt-0.5">
                      {activeWorkOrder
                        ? `Work Order ${activeWorkOrder.id} issued to ${activeWorkOrder.contractorOrCrew}. Status: ${activeWorkOrder.status}`
                        : 'Awaiting contractor work order dispatch.'}
                    </p>
                  </div>

                  {/* Step 4: Completion Claim */}
                  <div className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeWorkOrder?.status === 'completion_reported' ||
                        issue.operationalStatus === 'verified_resolved'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {activeWorkOrder?.status === 'completion_reported' ||
                      issue.operationalStatus === 'verified_resolved'
                        ? '✓'
                        : '4'}
                    </span>
                    <div className="font-bold text-slate-900">
                      4. Contractor Completion Reported (Unverified Claim)
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {activeWorkOrder?.completionReport
                        ? `Contractor submitted repair photos on ${new Date(
                            activeWorkOrder.completionReport.completedAt
                          ).toLocaleDateString()}. Claim pending independent audit.`
                        : 'Pending contractor field execution.'}
                    </p>
                  </div>

                  {/* Step 5: Verified Resolution */}
                  <div className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        issue.verificationState === 'verified_resolved'
                          ? 'bg-teal-600 text-white'
                          : issue.verificationState === 'reopened_recurring'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {issue.verificationState === 'verified_resolved' ? '✓' : '5'}
                    </span>
                    <div className="font-bold text-slate-900">5. Independent Verification</div>
                    <p className="text-slate-500 mt-0.5">
                      {issue.verificationState === 'verified_resolved'
                        ? 'Passed independent audit. Verified fixed.'
                        : issue.verificationState === 'reopened_recurring'
                        ? 'Verification failed or defect returned. Reopened.'
                        : 'Awaiting independent inspector sign-off before closure.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECTED INDIVIDUAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">
                    Connected Individual Observations ({connectedReports.length})
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Every resident report retains original photos, GPS metadata, and raw descriptions.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {connectedReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {r.id}
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs mt-1">{r.title}</h5>
                        <p className="text-slate-600">{r.description}</p>
                      </div>
                      <ValidationStatusBadge status={r.validationStatus} />
                    </div>

                    {r.attachments.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {r.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="w-24 h-24 rounded-lg overflow-hidden border border-slate-300"
                          >
                            <img
                              src={att.url}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Reporter: {r.reporterName}</span>
                      <span>Observed: {new Date(r.observedAt).toLocaleString()}</span>
                      <span>GPS: {r.location.source} (±{r.location.accuracyMeters || 5}m)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WORK ORDERS */}
          {activeTab === 'work_order' && (
            <div className="space-y-4">
              {activeWorkOrder ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {activeWorkOrder.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{activeWorkOrder.title}</h4>
                      <p className="text-slate-600 mt-0.5">{activeWorkOrder.description}</p>
                    </div>
                    <WorkOrderStatusBadge status={activeWorkOrder.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-[11px]">
                    <div>
                      <strong>Contractor / Crew:</strong> {activeWorkOrder.contractorOrCrew}
                    </div>
                    <div>
                      <strong>Department:</strong> {activeWorkOrder.assignedDepartment}
                    </div>
                    <div>
                      <strong>Target Date:</strong> {activeWorkOrder.targetCompletionDate}
                    </div>
                    <div>
                      <strong>Issued Date:</strong> {activeWorkOrder.createdDate}
                    </div>
                  </div>

                  {activeWorkOrder.completionReport && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 space-y-2">
                      <div className="font-bold text-amber-900 flex items-center">
                        <FileCheck2 className="w-4 h-4 mr-1 text-amber-600" />
                        Contractor Completion Claim:
                      </div>
                      <p className="text-slate-700">{activeWorkOrder.completionReport.workSummary}</p>
                      <p className="text-slate-500 text-[11px]">
                        <strong>Materials: </strong>
                        {activeWorkOrder.completionReport.materialsUsed}
                      </p>
                      {activeWorkOrder.completionReport.completionPhotos.length > 0 && (
                        <div className="flex gap-2">
                          {activeWorkOrder.completionReport.completionPhotos.map((p, i) => (
                            <img
                              key={i}
                              src={p}
                              alt="Completion"
                              className="w-24 h-24 rounded-lg object-cover border border-slate-300"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl">
                  No active work order currently assigned.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Immutable Transition Audit Trail</h4>
              <div className="space-y-2">
                {relatedAudits.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{a.action}</span>
                      <span className="text-slate-400">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600">{a.details}</p>
                    <div className="text-[10px] text-slate-400">
                      Actor: {a.actorName} ({a.actorRole})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
