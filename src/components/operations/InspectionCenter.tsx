import React, { useState, useEffect } from 'react';
import { Inspection, CivicIssue } from '../../types/civic';
import { store } from '../../services/store';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
  Plus,
} from 'lucide-react';

interface InspectionCenterProps {
  onSelectIssue?: (issue: CivicIssue) => void;
}

export const InspectionCenter: React.FC<InspectionCenterProps> = ({ onSelectIssue }) => {
  const [inspections, setInspections] = useState<Inspection[]>(store.inspections);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(inspections[0]?.id || '');

  // Form state for completing active inspection
  const [observedCondition, setObservedCondition] = useState('');
  const [recommendedAction, setRecommendedAction] = useState<
    'immediate_work_order' | 'monitor' | 'no_defect_found' | 'refer_to_utility'
  >('immediate_work_order');
  const [hazardPresent, setHazardPresent] = useState(true);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setInspections([...store.inspections]);
    });
    return unsub;
  }, []);

  const activeInspection = inspections.find((i) => i.id === selectedInspectionId) || inspections[0];
  const linkedIssue = store.issues.find((i) => i.id === activeInspection?.issueId);

  const handleToggleChecklistItem = (itemIndex: number) => {
    if (!activeInspection) return;
    const updatedChecklist = activeInspection.checklist.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );
    activeInspection.checklist = updatedChecklist;
    setInspections([...store.inspections]);
  };

  const handleSubmitFindings = () => {
    if (!activeInspection) return;
    store.completeInspection(
      activeInspection.id,
      {
        issueConfirmed: true,
        observedCondition: observedCondition || 'Physical verification conducted on site.',
        hazardPresent,
        recommendedAction,
        evidencePhotos: [
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        ],
        uncertaintyNotes: 'Core sub-base sample recommended if surface recurrence persists.',
      },
      activeInspection.checklist
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-sky-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Authorized Field Operations & Quality Audits</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Inspection Center & Field Operations
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Certified municipal inspectors review incoming citizen reports on the ground. Checklists, tactile measurements, and photographic evidence establish verified physical scope before committing municipal capital work orders.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-sky-300">
                {inspections.filter((i) => i.status === 'scheduled' || i.status === 'in_progress').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Assigned</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-emerald-400">
                {inspections.filter((i) => i.status === 'completed').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Inspection Queue & Execution Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Assigned Field Inspections ({inspections.length})
            </h3>
          </div>

          <div className="space-y-3">
            {inspections.map((ins) => {
              const isSelected = ins.id === activeInspection?.id;
              return (
                <div
                  key={ins.id}
                  onClick={() => setSelectedInspectionId(ins.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                      {ins.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ins.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ins.status === 'in_progress'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ins.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    Target: {ins.issueId || ins.assetId}
                  </h4>
                  <p className="text-[11px] text-slate-500">Inspector: {ins.assignedInspectorName}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{new Date(ins.scheduledDate).toLocaleDateString()}</span>
                    <span className="font-semibold text-sky-700">
                      {ins.checklist.filter((c) => c.checked).length} / {ins.checklist.length} checklist items
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Field Inspection Workbench */}
        {activeInspection ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {activeInspection.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Scheduled: {new Date(activeInspection.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                    Field Inspection Audit: {activeInspection.issueId}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Assigned Officer: {activeInspection.assignedInspectorName}
                  </p>
                </div>

                {linkedIssue && onSelectIssue && (
                  <button
                    onClick={() => onSelectIssue(linkedIssue)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <span>View Connected Issue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Interactive Field Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Mandatory Field Quality Checklist
                </h4>
                <div className="space-y-2">
                  {activeInspection.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleChecklistItem(idx)}
                      className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition text-xs ${
                        item.checked
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-medium'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <div>{item.item}</div>
                        {item.note && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            Measurement note: {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Record Findings & Recommend Action */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Record Inspector Findings & Municipal Recommendation
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Recommended Engineering Action
                    </label>
                    <select
                      value={recommendedAction}
                      onChange={(e) => setRecommendedAction(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    >
                      <option value="immediate_work_order">Immediate Capital Work Order Required</option>
                      <option value="monitor">Low Risk — Monitor during regular sweep</option>
                      <option value="no_defect_found">No Defect Found / Transient Condition</option>
                      <option value="refer_to_utility">Refer to External Water/Electric Utility</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <input
                      type="checkbox"
                      id="hazardCheck"
                      checked={hazardPresent}
                      onChange={(e) => setHazardPresent(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <label htmlFor="hazardCheck" className="text-xs font-bold text-rose-900 cursor-pointer">
                      Immediate Public Safety Hazard Present (Mark for urgent barricading)
                    </label>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block font-semibold text-slate-700">
                    Inspector Ground Observations
                  </label>
                  <textarea
                    rows={3}
                    value={observedCondition}
                    onChange={(e) => setObservedCondition(e.target.value)}
                    placeholder="Document exact dimensions, failure mechanism (e.g. sub-base water saturation, loose aggregate, blocked silt trap)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitFindings}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Certified Inspection Findings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
