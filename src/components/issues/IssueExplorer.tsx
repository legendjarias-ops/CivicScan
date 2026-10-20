import React, { useState, useEffect } from 'react';
import { CivicIssue, IssueReport } from '../../types/civic';
import { store } from '../../services/store';
import {
  PriorityBadge,
  OperationalStatusBadge,
  VerificationStateBadge,
  ValidationStatusBadge,
} from '../common/StatusBadge';
import { CivicMap } from '../map/CivicMap';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  ArrowRight,
  Eye,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';

interface IssueExplorerProps {
  onSelectIssue: (issue: CivicIssue) => void;
  onOpenReportWizard?: () => void;
}

export const IssueExplorer: React.FC<IssueExplorerProps> = ({
  onSelectIssue,
  onOpenReportWizard,
}) => {
  const [issues, setIssues] = useState<CivicIssue[]>(store.issues);
  const [reports, setReports] = useState<IssueReport[]>(store.reports);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'recurring' | 'unverified' | 'verified'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setIssues([...store.issues]);
      setReports([...store.reports]);
    });
    return unsub;
  }, []);

  const filteredIssues = issues.filter((issue) => {
    // Search query
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.canonicalLocation.addressText.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchesCategory = selectedCategory === 'all' || issue.canonicalCategory === selectedCategory;

    // Ward
    const matchesWard = selectedWard === 'all' || issue.canonicalLocation.ward === selectedWard;

    // Quick filter
    let matchesQuick = true;
    if (quickFilter === 'recurring') matchesQuick = issue.isRecurring;
    if (quickFilter === 'unverified') matchesQuick = issue.operationalStatus === 'completion_reported';
    if (quickFilter === 'verified') matchesQuick = issue.operationalStatus === 'verified_resolved';

    return matchesSearch && matchesCategory && matchesWard && matchesQuick;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Civic Issue & Infrastructure Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect canonical infrastructure defects, connected citizen reports, and ongoing repair workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenReportWizard && (
            <button
              onClick={onOpenReportWizard}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Report New Defect</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and View Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Top Controls: Search + Dropdowns + View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, street, or landmark..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Category & Ward Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="Roads and transportation">Roads and transportation</option>
              <option value="Drainage and flooding">Drainage and flooding</option>
              <option value="Water and utilities">Water and utilities</option>
              <option value="Streetlights and electrical infrastructure">Streetlights</option>
              <option value="Waste and sanitation">Waste and sanitation</option>
              <option value="Public spaces">Public spaces</option>
            </select>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700"
            >
              <option value="all">All Wards</option>
              <option value="Ward 12">Ward 12</option>
              <option value="Ward 14">Ward 14</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'map' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Interactive Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              quickFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            onClick={() => setQuickFilter('recurring')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
              quickFilter === 'recurring'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Recurring Defect Alerts ({issues.filter((i) => i.isRecurring).length})</span>
          </button>
          <button
            onClick={() => setQuickFilter('unverified')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
              quickFilter === 'unverified'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Awaiting Verification ({issues.filter((i) => i.operationalStatus === 'completion_reported').length})</span>
          </button>
          <button
            onClick={() => setQuickFilter('verified')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
              quickFilter === 'verified'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Resolved ({issues.filter((i) => i.operationalStatus === 'verified_resolved').length})</span>
          </button>
        </div>
      </div>

      {/* VIEW: INTERACTIVE MAP */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <CivicMap
            issues={filteredIssues}
            reports={reports}
            hotspots={store.hotspots}
            assets={store.assets}
            onSelectIssue={onSelectIssue}
            heightClass="h-[520px]"
          />
        </div>
      )}

      {/* VIEW: GRID CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Photo & Badges */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-100">
                  <img
                    src={issue.primaryPhotoUrl}
                    alt={issue.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="text-[10px] font-mono font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded">
                      {issue.id}
                    </span>
                    {issue.isRecurring && (
                      <span className="text-[10px] font-bold text-white bg-red-600/90 backdrop-blur-xs px-2 py-0.5 rounded flex items-center">
                        ↺ Recurring ({issue.recurrenceCount}x)
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <PriorityBadge priority={issue.priority} />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {issue.canonicalCategory}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-2 group-hover:text-indigo-600 transition">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center text-slate-500">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  <span className="truncate">{issue.canonicalLocation.addressText}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {issue.linkedReportIds.length} connected report(s)
                  </span>
                  <OperationalStatusBadge status={issue.operationalStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Issue ID & Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location / Ward</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4">Recurrence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="p-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                        {issue.id}
                      </span>
                      <div className="font-bold text-slate-900 mt-0.5 max-w-xs truncate">
                        {issue.title}
                      </div>
                    </td>
                    <td className="p-4">{issue.canonicalCategory}</td>
                    <td className="p-4">
                      <div>{issue.canonicalLocation.ward}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {issue.canonicalLocation.addressText}
                      </div>
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="p-4">
                      <OperationalStatusBadge status={issue.operationalStatus} />
                    </td>
                    <td className="p-4">
                      {issue.isRecurring ? (
                        <span className="text-red-700 font-bold flex items-center">
                          ↺ {issue.recurrenceCount}x
                        </span>
                      ) : (
                        <span className="text-slate-400">Single</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(issue);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
