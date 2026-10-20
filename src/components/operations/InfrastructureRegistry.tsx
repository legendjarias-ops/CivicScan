import React, { useState, useEffect } from 'react';
import { InfrastructureAsset, CivicIssue } from '../../types/civic';
import { store } from '../../services/store';
import {
  Layers,
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  Search,
} from 'lucide-react';

interface InfrastructureRegistryProps {
  onSelectIssue?: (issue: CivicIssue) => void;
}

export const InfrastructureRegistry: React.FC<InfrastructureRegistryProps> = ({ onSelectIssue }) => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>(store.assets);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAssets([...store.assets]);
    });
    return unsub;
  }, []);

  const filteredAssets = assets.filter((a) => {
    const matchesType = filterType === 'all' || a.assetType === filterType;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.responsibleDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const activeAsset = assets.find((a) => a.id === selectedAssetId) || filteredAssets[0];
  const linkedIssues = store.issues.filter((i) => i.assetId === activeAsset?.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Municipal Physical Asset Ledger</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              City Infrastructure Asset Registry
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every civic issue in CivicScan ties back to an authoritative physical municipal asset—whether a road segment, drainage culvert, high-mast luminaire, or waste enclosure—to track lifetime maintenance and structural wear.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-white">{assets.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Indexed Assets</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-rose-400">
                {assets.filter((a) => a.condition === 'Poor' || a.condition === 'Critical Failure').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Degraded Health</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Assets List & Asset Profile Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Catalog */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
            >
              <option value="all">All Asset Types</option>
              <option value="road_segment">Road Segments</option>
              <option value="drain_culvert">Drainage Culverts</option>
              <option value="streetlight">Streetlight Columns</option>
              <option value="waste_depot">Waste Enclosures</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            {filteredAssets.map((asset) => {
              const isSelected = asset.id === activeAsset?.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
                        {asset.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{asset.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asset.condition === 'Good'
                          ? 'bg-emerald-100 text-emerald-800'
                          : asset.condition === 'Fair'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {asset.condition}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">{asset.responsibleDepartment}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{asset.ward}</span>
                    <span className="font-semibold text-indigo-700">
                      {asset.linkedIssueCount} linked defect(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Asset Details & Linked Infrastructure Defects */}
        {activeAsset ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {activeAsset.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                      {activeAsset.assetType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                      {activeAsset.ward}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1.5">{activeAsset.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {activeAsset.location.addressText}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400">Current Health Index</div>
                  <div
                    className={`text-base font-extrabold ${
                      activeAsset.condition === 'Good'
                        ? 'text-emerald-600'
                        : activeAsset.condition === 'Fair'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {activeAsset.condition}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Commissioned: {activeAsset.installedYear || '2020'}
                  </div>
                </div>
              </div>

              {/* Maintenance Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Responsible Body</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {activeAsset.responsibleDepartment}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Last Audited Date</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {activeAsset.lastInspectionDate || 'Recent'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Total Incident History</div>
                  <div className="font-bold text-indigo-700 mt-0.5">
                    {linkedIssues.length} issues tracked
                  </div>
                </div>
              </div>

              {activeAsset.notes && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">Engineering Specification Notes</div>
                  <p>{activeAsset.notes}</p>
                </div>
              )}

              {/* Linked Civic Issues */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Civic Issues Connected to this Asset ({linkedIssues.length})
                </h4>

                {linkedIssues.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                    No active civic defects reported against this asset.
                  </div>
                ) : (
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
                            Status: {issue.operationalStatus.replace('_', ' ')} • Priority:{' '}
                            {issue.priority}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-indigo-600 font-semibold text-xs flex items-center space-x-1 hover:bg-slate-100">
                          <span>Inspect History</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
