import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CivicIssue, IssueReport, HotspotCluster, InfrastructureAsset, AreaScan } from '../../types/civic';
import { PriorityBadge, OperationalStatusBadge, VerificationStateBadge } from '../common/StatusBadge';
import { Layers, MapPin, AlertCircle, RefreshCw, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

interface CivicMapProps {
  issues: CivicIssue[];
  reports?: IssueReport[];
  hotspots?: HotspotCluster[];
  assets?: InfrastructureAsset[];
  scans?: AreaScan[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: CivicIssue) => void;
  pinSelectMode?: boolean;
  onPinSelected?: (lat: number, lng: number) => void;
  heightClass?: string;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  issues,
  reports = [],
  hotspots = [],
  assets = [],
  scans = [],
  selectedIssueId,
  onSelectIssue,
  pinSelectMode = false,
  onPinSelected,
  heightClass = 'h-[540px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);

  // Layer filter states
  const [showIssues, setShowIssues] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showAssets, setShowAssets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewIssue, setPreviewIssue] = useState<CivicIssue | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center on Metro Ward 12 (Bengaluru coordinate hub: 12.9716, 77.6412)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.6412],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | CivicScan Intelligence',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Handle pin placement if in pin selection mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (pinSelectMode && onPinSelected) {
        const { lat, lng } = e.latlng;
        onPinSelected(lat, lng);

        if (pinMarkerRef.current) {
          pinMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const pinIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: `<div class="w-8 h-8 -ml-4 -mt-8 text-indigo-600 drop-shadow-md flex items-center justify-center font-bold">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          pinMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Hotspots (Pulsing circles)
    if (showHotspots) {
      hotspots.forEach((hs) => {
        const circle = L.circle([hs.centerLat, hs.centerLng], {
          radius: hs.radiusMeters,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '4, 4',
        });
        circle.bindTooltip(
          `<strong>${hs.name}</strong><br/>Recurrence Rate: ${hs.recurrenceRate}% • ${hs.distinctIssueCount} Distinct Issues`,
          { direction: 'top' }
        );
        layer.addLayer(circle);
      });
    }

    // 2. Issues Markers
    if (showIssues) {
      issues
        .filter((issue) => selectedCategory === 'all' || issue.canonicalCategory === selectedCategory)
        .forEach((issue) => {
          let markerColor = '#3b82f6'; // default blue
          if (issue.priority === 'Critical' || issue.isRecurring) {
            markerColor = '#dc2626'; // red for recurring or critical
          } else if (issue.operationalStatus === 'completion_reported') {
            markerColor = '#f59e0b'; // amber for unverified completion
          } else if (issue.operationalStatus === 'verified_resolved') {
            markerColor = '#10b981'; // green for verified
          }

          const isSelected = issue.id === selectedIssueId;
          const html = `
            <div class="relative cursor-pointer transition-transform duration-200 hover:scale-125 ${isSelected ? 'scale-125 ring-4 ring-indigo-500 rounded-full' : ''}">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg" style="background-color: ${markerColor}; border: 2px solid white;">
                ${issue.isRecurring ? '↺' : issue.priority === 'Critical' ? '!' : '●'}
              </div>
              ${issue.isRecurring ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>' : ''}
            </div>
          `;

          const icon = L.divIcon({
            className: 'civic-issue-marker',
            html,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([issue.canonicalLocation.lat, issue.canonicalLocation.lng], { icon });

          marker.on('click', () => {
            setPreviewIssue(issue);
            if (onSelectIssue) onSelectIssue(issue);
          });

          marker.bindTooltip(
            `<strong>${issue.title}</strong><br/>${issue.canonicalCategory} • ${issue.isRecurring ? 'Recurring (' + issue.recurrenceCount + 'x)' : issue.priority}`,
            { direction: 'top', offset: [0, -10] }
          );

          layer.addLayer(marker);
        });
    }

    // 3. Unmerged Reports (Small translucent dots)
    if (showReports) {
      reports
        .filter((r) => !r.canonicalIssueId)
        .forEach((r) => {
          const reportIcon = L.divIcon({
            className: 'report-dot',
            html: `<div class="w-4 h-4 rounded-full bg-purple-600 border border-white opacity-80 shadow-xs"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          const marker = L.marker([r.location.lat, r.location.lng], { icon: reportIcon });
          marker.bindTooltip(`Unmerged Report: ${r.title} (${r.location.source})`, { direction: 'top' });
          layer.addLayer(marker);
        });
    }

    // 4. Infrastructure Assets (Square markers)
    if (showAssets) {
      assets.forEach((ast) => {
        const assetIcon = L.divIcon({
          className: 'asset-marker',
          html: `<div class="w-5 h-5 bg-slate-800 border-2 border-amber-400 rounded-xs flex items-center justify-center text-[9px] text-white font-mono font-bold shadow-md">A</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const marker = L.marker([ast.location.lat, ast.location.lng], { icon: assetIcon });
        marker.bindTooltip(`Asset: ${ast.name} (${ast.condition})`, { direction: 'top' });
        layer.addLayer(marker);
      });
    }
  }, [issues, reports, hotspots, assets, showIssues, showReports, showHotspots, showAssets, selectedCategory, selectedIssueId]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
      {/* Map Control Toolbar */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Map Intelligence Layers:</span>
          <button
            onClick={() => setShowIssues(!showIssues)}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              showIssues ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Issues ({issues.length})
          </button>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              showHotspots ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hotspots ({hotspots.length})
          </button>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              showReports ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unmerged Reports
          </button>
          <button
            onClick={() => setShowAssets(!showAssets)}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              showAssets ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Assets ({assets.length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-slate-500 font-medium">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="Roads and transportation">Roads & Transport</option>
            <option value="Drainage and flooding">Drainage & Flooding</option>
            <option value="Water and utilities">Water & Utilities</option>
            <option value="Streetlights and electrical infrastructure">Streetlights</option>
            <option value="Waste and sanitation">Waste & Sanitation</option>
          </select>
        </div>
      </div>

      {/* Pin selection instruction banner */}
      {pinSelectMode && (
        <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-medium animate-pulse">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Click anywhere on the map to pin precise incident coordinates.</span>
          </div>
          <span className="text-indigo-600">Location source will be recorded as Map Pin (Manual)</span>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1.5 max-w-xs pointer-events-auto">
        <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">Geospatial Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
          <span className="text-slate-700">Recurring Defect / Critical Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-700">Completion Reported (Unverified)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-teal-600 inline-block"></span>
          <span className="text-slate-700">Verified Resolved Outcome</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
          <span className="text-slate-700">Unmerged Individual Report</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 border-2 border-red-500 border-dashed rounded-full inline-block"></span>
          <span className="text-slate-700">Recurrence Hotspot Cluster (Zone)</span>
        </div>
      </div>

      {/* Quick Issue Preview Drawer (When marker is clicked) */}
      {previewIssue && (
        <div className="absolute top-14 right-4 z-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                {previewIssue.id}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                {previewIssue.title}
              </h4>
            </div>
            <button
              onClick={() => setPreviewIssue(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <PriorityBadge priority={previewIssue.priority} />
            <OperationalStatusBadge status={previewIssue.operationalStatus} />
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p className="flex items-center text-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {previewIssue.canonicalLocation.addressText}
            </p>
            {previewIssue.isRecurring && (
              <p className="p-2 bg-red-50 text-red-800 rounded border border-red-200 text-xs font-semibold">
                ↺ Recurring Issue ({previewIssue.recurrenceCount} times reported). Failed patch detected.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {previewIssue.linkedReportIds.length} connected report(s)
            </span>
            {onSelectIssue && (
              <button
                onClick={() => onSelectIssue(previewIssue)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center space-x-1 transition"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
