import React, { useState, useEffect } from 'react';
import { AreaScan, ScanObservation, IssueCategory, PriorityLevel } from '../../types/civic';
import { store } from '../../services/store';
import { PriorityBadge } from '../common/StatusBadge';
import {
  Footprints,
  MapPin,
  Camera,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Shield,
  Eye,
  Plus,
} from 'lucide-react';

interface AreaScannerProps {
  onScanCompleted?: (scan: AreaScan) => void;
  onOpenReport?: (reportId: string) => void;
}

export const AreaScanner: React.FC<AreaScannerProps> = ({ onScanCompleted, onOpenReport }) => {
  const [scans, setScans] = useState<AreaScan[]>(store.scans);
  const [selectedScanId, setSelectedScanId] = useState<string>(scans[0]?.id || '');
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState(0.85);
  const [liveCoveragePct, setLiveCoveragePct] = useState(72);

  // New observation modal in active scan
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [newObsCategory, setNewObsCategory] = useState<IssueCategory>('Roads and transportation');
  const [newObsSubcategory, setNewObsSubcategory] = useState('Surface Deterioration');
  const [newObsSeverity, setNewObsSeverity] = useState<PriorityLevel>('Medium');
  const [newObsNotes, setNewObsNotes] = useState('');
  const [newObsPhoto, setNewObsPhoto] = useState<string>('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');

  // Plan a new scan state
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [newScanName, setNewScanName] = useState('');
  const [newScanType, setNewScanType] = useState<AreaScan['type']>('community_walk');
  const [newScanWard, setNewScanWard] = useState('Ward 12');
  const [newScanAreaDesc, setNewScanAreaDesc] = useState('');
  const [newScanPlannedKm, setNewScanPlannedKm] = useState(1.5);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setScans([...store.scans]);
    });
    return unsub;
  }, []);

  const activeScan = scans.find((s) => s.id === selectedScanId) || scans[0];

  const handleStartLiveSweep = () => {
    setIsLiveScanning(true);
  };

  const handleStopLiveSweep = () => {
    setIsLiveScanning(false);
    if (activeScan) {
      store.finishAreaScan(
        activeScan.id,
        `Systematic sweep completed. ${activeScan.observations.length} civic observations recorded with ${liveCoveragePct}% planned corridor coverage.`
      );
    }
  };

  const handleAddObservation = () => {
    if (!activeScan) return;
    store.addScanObservation(activeScan.id, {
      lat: 12.972 + (Math.random() - 0.5) * 0.005,
      lng: 77.64 + (Math.random() - 0.5) * 0.005,
      category: newObsCategory,
      subcategory: newObsSubcategory,
      severity: newObsSeverity,
      notes: newObsNotes || 'Identified during systematic area foot patrol sweep.',
      photoUrl: newObsPhoto,
    });
    setShowAddObsModal(false);
    setNewObsNotes('');
  };

  const handleConvertObservation = (scanId: string, obsId: string) => {
    const createdReport = store.convertScanObservationToReport(scanId, obsId);
    if (createdReport && onOpenReport) {
      onOpenReport(createdReport.id);
    }
  };

  const handleCreateScanPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newScan = store.createAreaScan({
      name: newScanName || `Proactive ${newScanType.replace('_', ' ')} — ${newScanWard}`,
      type: newScanType,
      ward: newScanWard,
      targetAreaDescription: newScanAreaDesc || 'Systematic neighborhood sweep along key arterial routes.',
      status: 'planned',
      leadObserverId: store.currentUser.id,
      leadObserverName: store.currentUser.name,
      plannedKm: Number(newScanPlannedKm) || 1.2,
    });
    setSelectedScanId(newScan.id);
    setShowNewScanModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Footprints className="w-3.5 h-3.5" />
              <span>Proactive Area Scanning & Infrastructure Sweeps</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Systematic Infrastructure Sweeps
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Don’t wait for resident complaints. Proactive field walks, housing society sweeps, and municipal audits identify defects early, establish baseline area coverage, and detect repeat failures before they escalate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewScanModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center space-x-2 backdrop-blur-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Area Scan</span>
            </button>
            {!isLiveScanning ? (
              <button
                onClick={handleStartLiveSweep}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Field Sweep</span>
              </button>
            ) : (
              <button
                onClick={handleStopLiveSweep}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center space-x-2 animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish & Finalize Sweep</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Sweep Indicator if active */}
        {isLiveScanning && (
          <div className="mt-6 pt-6 border-t border-indigo-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-indigo-400/20">
              <div className="text-[11px] text-indigo-300">Active Sweep Status</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
                Live GPS Tracking
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-indigo-400/20">
              <div className="text-[11px] text-indigo-300">Distance Surveyed</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {liveDistanceKm} km / {activeScan?.plannedKm || 1.5} km
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-indigo-400/20">
              <div className="text-[11px] text-indigo-300">Corridor Coverage</div>
              <div className="text-sm font-bold text-indigo-200 mt-0.5">{liveCoveragePct}% Complete</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-indigo-400/20 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-indigo-300">Logged Defects</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {activeScan?.observations.length || 0} findings
                </div>
              </div>
              <button
                onClick={() => setShowAddObsModal(true)}
                className="px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Finding</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Scan Registry & Selected Scan Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Area Scans */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-600" />
              Area Scan Registry ({scans.length})
            </h3>
            <span className="text-[11px] text-slate-500">Ward 12 & 14</span>
          </div>

          <div className="space-y-3">
            {scans.map((s) => {
              const isSelected = s.id === activeScan?.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedScanId(s.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        {s.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{s.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        s.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'in_progress'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{s.targetAreaDescription}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center">
                      <Footprints className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {s.actualKmCovered} / {s.plannedKm} km ({s.coveragePercentage}%)
                    </span>
                    <span className="font-semibold text-indigo-700">
                      {s.observations.length} observations
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle & Right: Active Scan Details & Systematic Observations */}
        {activeScan ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Scan Metadata Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {activeScan.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                      {activeScan.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                      {activeScan.ward}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">{activeScan.name}</h2>
                  <p className="text-xs text-slate-600 mt-1">{activeScan.targetAreaDescription}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400">Lead Observer</div>
                  <div className="text-xs font-bold text-slate-800">{activeScan.leadObserverName}</div>
                  {activeScan.startedAt && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(activeScan.startedAt).toLocaleDateString()} •{' '}
                      {new Date(activeScan.startedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress & Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[11px] text-slate-500 font-medium">Coverage Completed</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {activeScan.coveragePercentage}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${activeScan.coveragePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[11px] text-slate-500 font-medium">Corridor Distance</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {activeScan.actualKmCovered} km
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Planned: {activeScan.plannedKm} km
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[11px] text-slate-500 font-medium">Recorded Findings</div>
                  <div className="text-base font-bold text-indigo-700 mt-0.5">
                    {activeScan.observations.length} defects
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {activeScan.observations.filter((o) => o.convertedReportId).length} converted to reports
                  </div>
                </div>
              </div>

              {activeScan.summary && (
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-1">
                  <div className="font-bold flex items-center text-indigo-900">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    Inspector Sweep Summary
                  </div>
                  <p>{activeScan.summary}</p>
                </div>
              )}
            </div>

            {/* Observations List */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Geotagged Sweep Observations ({activeScan.observations.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Every observation is captured with precise GPS coordinates. Convert any finding into a formal municipal report.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddObsModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Observation</span>
                </button>
              </div>

              {activeScan.observations.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                  No observations logged yet for this sweep. Click "Log Observation" to record findings.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeScan.observations.map((obs, idx) => (
                    <div
                      key={obs.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              OBS #{idx + 1}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 mt-1">{obs.subcategory}</h4>
                            <span className="text-[11px] text-slate-500">{obs.category}</span>
                          </div>
                          <PriorityBadge priority={obs.severity} />
                        </div>

                        {obs.photoUrl && (
                          <div className="rounded-lg overflow-hidden border border-slate-200 max-h-36">
                            <img
                              src={obs.photoUrl}
                              alt={obs.subcategory}
                              className="w-full h-36 object-cover"
                            />
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed">{obs.notes}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {obs.lat.toFixed(5)}, {obs.lng.toFixed(5)}
                        </span>

                        {obs.convertedReportId ? (
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Report #{obs.convertedReportId}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConvertObservation(activeScan.id, obs.id)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[11px] transition flex items-center space-x-1"
                          >
                            <span>Convert to Report</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal: Add Observation */}
      {showAddObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <Camera className="w-5 h-5 text-indigo-600 mr-2" />
                Log Sweep Observation
              </h3>
              <button
                onClick={() => setShowAddObsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={newObsCategory}
                  onChange={(e) => setNewObsCategory(e.target.value as IssueCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
                >
                  <option value="Roads and transportation">Roads and transportation</option>
                  <option value="Drainage and flooding">Drainage and flooding</option>
                  <option value="Water and utilities">Water and utilities</option>
                  <option value="Streetlights and electrical infrastructure">Streetlights and electrical infrastructure</option>
                  <option value="Waste and sanitation">Waste and sanitation</option>
                  <option value="Public spaces">Public spaces</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Defect Description / Subcategory</label>
                <input
                  type="text"
                  value={newObsSubcategory}
                  onChange={(e) => setNewObsSubcategory(e.target.value)}
                  placeholder="e.g. Broken Paver Slabs, Silted Drain Ingress..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessed Severity</label>
                <select
                  value={newObsSeverity}
                  onChange={(e) => setNewObsSeverity(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspector Notes</label>
                <textarea
                  rows={3}
                  value={newObsNotes}
                  onChange={(e) => setNewObsNotes(e.target.value)}
                  placeholder="State physical measurements, observed obstruction, or safety hazards..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddObsModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddObservation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Save Observation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Plan New Scan */}
      {showNewScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateScanPlan}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <Footprints className="w-5 h-5 text-indigo-600 mr-2" />
                Schedule Systematic Area Scan
              </h3>
              <button
                type="button"
                onClick={() => setShowNewScanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scan / Sweep Name</label>
                <input
                  type="text"
                  required
                  value={newScanName}
                  onChange={(e) => setNewScanName(e.target.value)}
                  placeholder="e.g. Ward 12 Pre-Monsoon Drainage Walk"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sweep Type</label>
                  <select
                    value={newScanType}
                    onChange={(e) => setNewScanType(e.target.value as AreaScan['type'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
                  >
                    <option value="community_walk">Community Citizen Walk</option>
                    <option value="housing_society_sweep">Housing Society Facility Sweep</option>
                    <option value="municipal_field_inspection">Municipal Field Inspection</option>
                    <option value="followup_verification">Follow-up Repair Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ward</label>
                  <input
                    type="text"
                    value={newScanWard}
                    onChange={(e) => setNewScanWard(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Planned Target Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  value={newScanPlannedKm}
                  onChange={(e) => setNewScanPlannedKm(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corridor / Boundary Description</label>
                <textarea
                  rows={3}
                  value={newScanAreaDesc}
                  onChange={(e) => setNewScanAreaDesc(e.target.value)}
                  placeholder="Describe streets, arterial intersections, or society outer perimeter to inspect..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewScanModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Create Scan Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
