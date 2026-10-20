import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import {
  LayoutDashboard,
  PlusCircle,
  Footprints,
  Compass,
  Map as MapIcon,
  GitMerge,
  ShieldCheck,
  TrendingUp,
  ClipboardCheck,
  Building2,
  ShieldAlert,
  ChevronRight,
  Layers,
} from 'lucide-react';

export type ViewTab =
  | 'home'
  | 'report'
  | 'scan'
  | 'explorer'
  | 'map'
  | 'consolidation'
  | 'verification'
  | 'hotspots'
  | 'inspections'
  | 'assets'
  | 'quality';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState(store.getMetrics());

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setMetrics(store.getMetrics());
    });
    return unsub;
  }, []);

  const navItems: {
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'home',
      label: 'Home Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'report',
      label: 'Report a Civic Defect',
      icon: <PlusCircle className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'scan',
      label: 'Proactive Area Scanning',
      icon: <Footprints className="w-4 h-4 text-emerald-500" />,
      badge: `${metrics.completedScans} sweeps`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'explorer',
      label: 'Issue Explorer',
      icon: <Compass className="w-4 h-4 text-blue-500" />,
      badge: metrics.totalIssues,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'map',
      label: 'Civic Geospatial Map',
      icon: <MapIcon className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'consolidation',
      label: 'Issue Consolidation',
      icon: <GitMerge className="w-4 h-4 text-purple-500" />,
      badge: 'Smart Engine',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'verification',
      label: 'Verified Resolution Tracking',
      icon: <ShieldCheck className="w-4 h-4 text-teal-500" />,
      badge: `${metrics.completionsAwaitingVerification} unverified`,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'hotspots',
      label: 'Hotspots & Recurrence',
      icon: <TrendingUp className="w-4 h-4 text-rose-500" />,
      badge: `${metrics.recurringIssues} repeat`,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'inspections',
      label: 'Inspection Center',
      icon: <ClipboardCheck className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'assets',
      label: 'Infrastructure Registry',
      icon: <Building2 className="w-4 h-4 text-slate-500" />,
    },
    {
      id: 'quality',
      label: 'Data Quality & Audit',
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 space-y-6 overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Operations
          </div>
          {navItems.slice(0, 3).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence & Resolution
          </div>
          {navItems.slice(3, 8).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Municipal Governance
          </div>
          {navItems.slice(8).map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
          <div className="font-bold text-slate-800">CivicScan Standard</div>
          <p>Verified outcomes over unverified claims. Separate visible observations from root causes.</p>
        </div>
      </aside>
    </>
  );
};
