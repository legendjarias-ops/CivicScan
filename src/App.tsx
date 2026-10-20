/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ViewTab } from './components/common/Sidebar';
import { HomeDashboard } from './components/dashboards/HomeDashboard';
import { ReportIssueWizard } from './components/report/ReportIssueWizard';
import { AreaScanner } from './components/scan/AreaScanner';
import { IssueExplorer } from './components/issues/IssueExplorer';
import { ConsolidationManager } from './components/issues/ConsolidationManager';
import { VerifiedResolutionTracker } from './components/operations/VerifiedResolutionTracker';
import { HotspotIntelligence } from './components/hotspots/HotspotIntelligence';
import { InspectionCenter } from './components/operations/InspectionCenter';
import { InfrastructureRegistry } from './components/operations/InfrastructureRegistry';
import { DataQualityView } from './components/data-quality/DataQualityView';
import { CivicMap } from './components/map/CivicMap';
import { IssueDetailModal } from './components/issues/IssueDetailModal';
import { CivicIssue, IssueReport } from './types/civic';
import { store } from './services/store';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  const handleOpenReportWizard = () => {
    setCurrentTab('report');
  };

  const handleSelectIssue = (issue: CivicIssue) => {
    setSelectedIssue(issue);
  };

  const handleReportCreated = (report: IssueReport) => {
    // If report was created, we can view in explorer or home
    setCurrentTab('explorer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed Header Navbar */}
      <Navbar
        onOpenReportWizard={handleOpenReportWizard}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Application Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {currentTab === 'home' && (
            <HomeDashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'report' && (
            <div className="py-4">
              <ReportIssueWizard
                onReportCreated={handleReportCreated}
                onCancel={() => setCurrentTab('home')}
              />
            </div>
          )}

          {currentTab === 'scan' && (
            <AreaScanner
              onOpenReport={(reportId) => {
                const report = store.reports.find((r) => r.id === reportId);
                if (report?.canonicalIssueId) {
                  const issue = store.issues.find((i) => i.id === report.canonicalIssueId);
                  if (issue) setSelectedIssue(issue);
                } else {
                  setCurrentTab('explorer');
                }
              }}
            />
          )}

          {currentTab === 'explorer' && (
            <IssueExplorer
              onSelectIssue={handleSelectIssue}
              onOpenReportWizard={handleOpenReportWizard}
            />
          )}

          {currentTab === 'map' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Civic Geospatial Map & Hotspots
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Interactive multi-layer cartography displaying verified resolutions, unverified contractor claims, unmerged citizen reports, and recurrence hotspots.
                </p>
              </div>
              <CivicMap
                issues={store.issues}
                reports={store.reports}
                hotspots={store.hotspots}
                assets={store.assets}
                onSelectIssue={handleSelectIssue}
                heightClass="h-[680px]"
              />
            </div>
          )}

          {currentTab === 'consolidation' && (
            <ConsolidationManager
              onOpenIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'verification' && (
            <VerifiedResolutionTracker
              onOpenIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'hotspots' && (
            <HotspotIntelligence
              onSelectIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'inspections' && (
            <InspectionCenter
              onSelectIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'assets' && (
            <InfrastructureRegistry
              onSelectIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'quality' && (
            <DataQualityView />
          )}
        </main>
      </div>

      {/* Selected Issue Deep-Dive Lifecycle Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
