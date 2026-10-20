import {
  UserProfile,
  CivicIssue,
  IssueReport,
  InfrastructureAsset,
  Inspection,
  WorkOrder,
  ResolutionVerification,
  AreaScan,
  HotspotCluster,
  AuditRecord,
  NotificationItem,
  GeoLocation,
  IssueReportLink,
  UserRole,
} from '../types/civic';
import {
  CURRENT_USER,
  AVAILABLE_USERS,
  INITIAL_REPORTS,
  INITIAL_ISSUES,
  INITIAL_ASSETS,
  INITIAL_INSPECTIONS,
  INITIAL_WORK_ORDERS,
  INITIAL_VERIFICATIONS,
  INITIAL_SCANS,
  INITIAL_HOTSPOTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const STORAGE_KEY_PREFIX = 'civicscan_state_v1_';

function loadOr<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage, using fallback`, e);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

// Distance calculation using Haversine formula (meters)
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

class CivicScanStore {
  private listeners: Set<() => void> = new Set();

  currentUser: UserProfile = loadOr('currentUser', CURRENT_USER);
  reports: IssueReport[] = loadOr('reports', INITIAL_REPORTS);
  issues: CivicIssue[] = loadOr('issues', INITIAL_ISSUES);
  assets: InfrastructureAsset[] = loadOr('assets', INITIAL_ASSETS);
  inspections: Inspection[] = loadOr('inspections', INITIAL_INSPECTIONS);
  workOrders: WorkOrder[] = loadOr('workOrders', INITIAL_WORK_ORDERS);
  verifications: ResolutionVerification[] = loadOr('verifications', INITIAL_VERIFICATIONS);
  scans: AreaScan[] = loadOr('scans', INITIAL_SCANS);
  hotspots: HotspotCluster[] = loadOr('hotspots', INITIAL_HOTSPOTS);
  auditLogs: AuditRecord[] = loadOr('auditLogs', INITIAL_AUDIT_LOGS);
  notifications: NotificationItem[] = loadOr('notifications', INITIAL_NOTIFICATIONS);

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private persistAll(): void {
    save('currentUser', this.currentUser);
    save('reports', this.reports);
    save('issues', this.issues);
    save('assets', this.assets);
    save('inspections', this.inspections);
    save('workOrders', this.workOrders);
    save('verifications', this.verifications);
    save('scans', this.scans);
    save('hotspots', this.hotspots);
    save('auditLogs', this.auditLogs);
    save('notifications', this.notifications);
  }

  setCurrentUser(user: UserProfile): void {
    this.currentUser = user;
    save('currentUser', this.currentUser);
    this.notify();
  }

  switchRole(role: UserRole): void {
    const found = AVAILABLE_USERS.find((u) => u.role === role);
    if (found) {
      this.currentUser = found;
    } else {
      this.currentUser = { ...this.currentUser, role };
    }
    save('currentUser', this.currentUser);
    this.notify();
  }

  resetToDemo(): void {
    this.currentUser = CURRENT_USER;
    this.reports = INITIAL_REPORTS;
    this.issues = INITIAL_ISSUES;
    this.assets = INITIAL_ASSETS;
    this.inspections = INITIAL_INSPECTIONS;
    this.workOrders = INITIAL_WORK_ORDERS;
    this.verifications = INITIAL_VERIFICATIONS;
    this.scans = INITIAL_SCANS;
    this.hotspots = INITIAL_HOTSPOTS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.persistAll();
    this.notify();
  }

  addAudit(action: string, entityType: AuditRecord['entityType'], entityId: string, details: string): void {
    const record: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    this.auditLogs = [record, ...this.auditLogs];
    save('auditLogs', this.auditLogs);
  }

  addNotification(title: string, message: string, linkType?: NotificationItem['linkType'], linkId?: string): void {
    const item: NotificationItem = {
      id: `NOT-${Date.now().toString().slice(-6)}`,
      userId: this.currentUser.id,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      linkType,
      linkId,
    };
    this.notifications = [item, ...this.notifications];
    save('notifications', this.notifications);
  }

  markNotificationRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    save('notifications', this.notifications);
    this.notify();
  }

  // --- SUBMIT ISSUE REPORT ---
  submitReport(reportData: Omit<IssueReport, 'id' | 'submittedAt' | 'validationStatus'>): IssueReport {
    const id = `REP-2026-${String(this.reports.length + 1).padStart(3, '0')}`;
    const newReport: IssueReport = {
      ...reportData,
      id,
      submittedAt: new Date().toISOString(),
      validationStatus: 'submitted',
    };

    this.reports = [newReport, ...this.reports];
    this.addAudit('REPORT_SUBMITTED', 'report', id, `New report "${newReport.title}" registered in ${newReport.location.ward}.`);

    // Check for nearby canonical issues to auto-detect potential consolidation match
    const potentialMatches = this.findDuplicateCandidatesForReport(newReport);
    if (potentialMatches.length > 0) {
      const topMatch = potentialMatches[0];
      this.addNotification(
        'Potential Duplicate Report Detected',
        `Report ${id} is within ${topMatch.distanceMeters}m of existing issue ${topMatch.issue.id}. Ready for consolidation review.`,
        'issue',
        topMatch.issue.id
      );
    }

    this.persistAll();
    this.notify();
    return newReport;
  }

  // --- DUPLICATE DETECTION / INTELLIGENCE ENGINE ---
  findDuplicateCandidatesForReport(report: IssueReport): {
    issue: CivicIssue;
    distanceMeters: number;
    matchScore: number;
    matchRationale: string;
    isLikelyRecurrence: boolean;
  }[] {
    const results: {
      issue: CivicIssue;
      distanceMeters: number;
      matchScore: number;
      matchRationale: string;
      isLikelyRecurrence: boolean;
    }[] = [];

    for (const issue of this.issues) {
      const dist = calculateDistanceMeters(
        report.location.lat,
        report.location.lng,
        issue.canonicalLocation.lat,
        issue.canonicalLocation.lng
      );

      // Only evaluate within 300 meters
      if (dist <= 300) {
        let score = 0;
        const reasons: string[] = [];

        // Distance scoring
        if (dist <= 25) {
          score += 45;
          reasons.push(`Exact geographic colocation (within ${dist}m)`);
        } else if (dist <= 75) {
          score += 35;
          reasons.push(`High spatial proximity (${dist}m)`);
        } else {
          score += 20;
          reasons.push(`Same street corridor (${dist}m)`);
        }

        // Category matching
        if (issue.canonicalCategory === report.category) {
          score += 35;
          reasons.push(`Identical municipal category: ${report.category}`);
        } else {
          // Cross-domain related (e.g. waterlogging + drainage)
          reasons.push(`Different category (${report.category} vs ${issue.canonicalCategory})`);
        }

        // Subcategory match
        if (issue.subcategory && report.subcategory && issue.subcategory.toLowerCase() === report.subcategory.toLowerCase()) {
          score += 10;
          reasons.push(`Matching subcategory (${report.subcategory})`);
        }

        // Check if issue was previously fixed / repaired -> Recurrence hypothesis
        const isLikelyRecurrence = !!(issue.lastRepairedAt || issue.verificationState === 'verified_resolved' || issue.operationalStatus === 'completion_reported');
        if (isLikelyRecurrence) {
          reasons.push(`Historical repair recorded on ${issue.lastRepairedAt ? new Date(issue.lastRepairedAt).toLocaleDateString() : 'earlier date'}; indicates possible repair recurrence.`);
        }

        if (score >= 40) {
          results.push({
            issue,
            distanceMeters: dist,
            matchScore: Math.min(score, 99),
            matchRationale: reasons.join(' • '),
            isLikelyRecurrence,
          });
        }
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  // --- CONSOLIDATION: MERGE REPORT INTO EXISTING ISSUE ---
  mergeReportIntoIssue(reportId: string, targetIssueId: string, rationale: string): void {
    const reportIndex = this.reports.findIndex((r) => r.id === reportId);
    const issueIndex = this.issues.findIndex((i) => i.id === targetIssueId);

    if (reportIndex === -1 || issueIndex === -1) return;

    const report = this.reports[reportIndex];
    const issue = this.issues[issueIndex];

    // Preserve original report, just assign canonicalIssueId and validationStatus
    this.reports[reportIndex] = {
      ...report,
      canonicalIssueId: targetIssueId,
      validationStatus: 'validated',
    };

    const linkedReportIds = Array.from(new Set([...issue.linkedReportIds, reportId]));
    const lastObservedAt =
      new Date(report.observedAt).getTime() > new Date(issue.lastObservedAt).getTime()
        ? report.observedAt
        : issue.lastObservedAt;

    // Check if this report reopens a resolved issue or flags recurrence
    let isRecurring = issue.isRecurring;
    let recurrenceCount = issue.recurrenceCount;
    let operationalStatus = issue.operationalStatus;
    let verificationState = issue.verificationState;

    if (issue.lastRepairedAt || issue.operationalStatus === 'verified_resolved' || issue.verificationState === 'verified_resolved') {
      isRecurring = true;
      recurrenceCount += 1;
      operationalStatus = 'reopened';
      verificationState = 'reopened_recurring';
    }

    this.issues[issueIndex] = {
      ...issue,
      linkedReportIds,
      lastObservedAt,
      isRecurring,
      recurrenceCount,
      operationalStatus,
      verificationState,
      updatedAt: new Date().toISOString(),
    };

    this.addAudit(
      'REPORT_CONSOLIDATED',
      'issue',
      targetIssueId,
      `Report ${reportId} consolidated under ${targetIssueId}. Rationale: ${rationale}`
    );

    this.persistAll();
    this.notify();
  }

  // --- SEPARATE REPORT FROM CONSOLIDATED ISSUE (REVERSE MERGE) ---
  separateReportFromIssue(reportId: string): CivicIssue | null {
    const reportIndex = this.reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) return null;

    const report = this.reports[reportIndex];
    const oldIssueId = report.canonicalIssueId;

    if (!oldIssueId) return null;

    // Remove from old issue
    const oldIssueIndex = this.issues.findIndex((i) => i.id === oldIssueId);
    if (oldIssueIndex !== -1) {
      this.issues[oldIssueIndex] = {
        ...this.issues[oldIssueIndex],
        linkedReportIds: this.issues[oldIssueIndex].linkedReportIds.filter((id) => id !== reportId),
        updatedAt: new Date().toISOString(),
      };
    }

    // Create new independent issue for this report
    const newIssueId = `ISS-2026-${String(this.issues.length + 101)}`;
    const newIssue: CivicIssue = {
      id: newIssueId,
      canonicalCategory: report.category,
      subcategory: report.subcategory,
      title: report.title,
      description: report.description,
      canonicalLocation: report.location,
      linkedReportIds: [report.id],
      primaryPhotoUrl: report.attachments[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      firstObservedAt: report.observedAt,
      lastObservedAt: report.observedAt,
      validationStatus: 'validated',
      operationalStatus: 'pending_triage',
      verificationState: 'unverified',
      priority: 'Medium',
      priorityRationale: 'Separated from merged entity following reviewer determination.',
      assignedDepartment: this.getDefaultDepartmentForCategory(report.category),
      isRecurring: false,
      recurrenceCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reports[reportIndex] = {
      ...report,
      canonicalIssueId: newIssueId,
    };

    this.issues = [newIssue, ...this.issues];

    this.addAudit(
      'REPORT_DECONSOLIDATED',
      'issue',
      newIssueId,
      `Report ${reportId} separated from ${oldIssueId} into independent issue ${newIssueId}.`
    );

    this.persistAll();
    this.notify();
    return newIssue;
  }

  // --- CREATE CANONICAL ISSUE DIRECTLY FROM REPORT ---
  createCanonicalIssueFromReport(reportId: string, priority: CivicIssue['priority'] = 'Medium'): CivicIssue | null {
    const reportIndex = this.reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) return null;

    const report = this.reports[reportIndex];
    const newIssueId = `ISS-2026-${String(this.issues.length + 101)}`;

    const newIssue: CivicIssue = {
      id: newIssueId,
      canonicalCategory: report.category,
      subcategory: report.subcategory,
      title: report.title,
      description: report.description,
      canonicalLocation: report.location,
      linkedReportIds: [report.id],
      primaryPhotoUrl: report.attachments[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      firstObservedAt: report.observedAt,
      lastObservedAt: report.observedAt,
      validationStatus: 'validated',
      operationalStatus: 'pending_triage',
      verificationState: 'unverified',
      priority,
      priorityRationale: `Validated by ${this.currentUser.name} as distinct actionable civic defect.`,
      assignedDepartment: this.getDefaultDepartmentForCategory(report.category),
      isRecurring: false,
      recurrenceCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reports[reportIndex] = {
      ...report,
      canonicalIssueId: newIssueId,
      validationStatus: 'validated',
    };

    this.issues = [newIssue, ...this.issues];

    this.addAudit(
      'ISSUE_VALIDATED_CREATED',
      'issue',
      newIssueId,
      `Report ${reportId} validated and established as canonical issue ${newIssueId}.`
    );

    this.persistAll();
    this.notify();
    return newIssue;
  }

  getDefaultDepartmentForCategory(cat: IssueReport['category']): string {
    switch (cat) {
      case 'Roads and transportation':
        return 'Roads & Bridges Department';
      case 'Drainage and flooding':
        return 'Stormwater & Drainage Maintenance';
      case 'Water and utilities':
        return 'Water Supply & Sewerage Board';
      case 'Streetlights and electrical infrastructure':
        return 'Electrical & Public Lighting Division';
      case 'Waste and sanitation':
        return 'Solid Waste Management';
      case 'Public spaces':
        return 'Horticulture & Public Spaces';
      default:
        return 'General Municipal Works';
    }
  }

  // --- WORK ORDERS ---
  createWorkOrder(data: {
    issueId: string;
    title: string;
    description: string;
    assignedDepartment: string;
    contractorOrCrew: string;
    priority: CivicIssue['priority'];
    targetCompletionDate: string;
  }): WorkOrder {
    const id = `WO-2026-${String(this.workOrders.length + 80).padStart(3, '0')}`;
    const newWo: WorkOrder = {
      ...data,
      id,
      status: 'assigned',
      createdDate: new Date().toISOString().split('T')[0],
    };

    this.workOrders = [newWo, ...this.workOrders];

    // Update issue state
    const issueIndex = this.issues.findIndex((i) => i.id === data.issueId);
    if (issueIndex !== -1) {
      this.issues[issueIndex] = {
        ...this.issues[issueIndex],
        operationalStatus: 'work_in_progress',
        activeWorkOrderId: id,
        updatedAt: new Date().toISOString(),
      };
    }

    this.addAudit('WORK_ORDER_CREATED', 'work_order', id, `Work order "${newWo.title}" assigned to ${newWo.contractorOrCrew}.`);
    this.persistAll();
    this.notify();
    return newWo;
  }

  reportWorkOrderCompletion(
    workOrderId: string,
    report: NonNullable<WorkOrder['completionReport']>
  ): void {
    const woIndex = this.workOrders.findIndex((w) => w.id === workOrderId);
    if (woIndex === -1) return;

    this.workOrders[woIndex] = {
      ...this.workOrders[woIndex],
      status: 'completion_reported',
      completionReport: report,
    };

    const targetIssueId = this.workOrders[woIndex].issueId;
    const issueIndex = this.issues.findIndex((i) => i.id === targetIssueId);
    if (issueIndex !== -1) {
      this.issues[issueIndex] = {
        ...this.issues[issueIndex],
        operationalStatus: 'completion_reported',
        verificationState: 'verification_scheduled',
        updatedAt: new Date().toISOString(),
      };
    }

    this.addAudit(
      'WORK_COMPLETION_REPORTED',
      'work_order',
      workOrderId,
      `Contractor reported completion. Status is now Completion Reported. Independent verification pending.`
    );

    this.addNotification(
      'Work Completion Reported — Verification Required',
      `Crew reported completion on ${this.workOrders[woIndex].title} (${workOrderId}). Field inspector audit needed.`,
      'work_order',
      workOrderId
    );

    this.persistAll();
    this.notify();
  }

  // --- RESOLUTION VERIFICATION ---
  verifyResolution(data: {
    workOrderId: string;
    verificationMethod: ResolutionVerification['verificationMethod'];
    result: 'passed' | 'failed' | 'partial_resolution';
    findingsNotes: string;
    evidencePhotos: string[];
    limitationDisclaimer: string;
  }): ResolutionVerification {
    const wo = this.workOrders.find((w) => w.id === data.workOrderId);
    const issueId = wo?.issueId || '';

    const id = `VRF-2026-${String(this.verifications.length + 20).padStart(3, '0')}`;
    const newVerif: ResolutionVerification = {
      id,
      workOrderId: data.workOrderId,
      issueId,
      verifiedBy: this.currentUser.name,
      verifierRole: this.currentUser.organization,
      verifiedAt: new Date().toISOString(),
      verificationMethod: data.verificationMethod,
      result: data.result,
      findingsNotes: data.findingsNotes,
      evidencePhotos: data.evidencePhotos,
      limitationDisclaimer: data.limitationDisclaimer,
    };

    this.verifications = [newVerif, ...this.verifications];

    // Update Work order and Issue statuses based on verified result
    const woIndex = this.workOrders.findIndex((w) => w.id === data.workOrderId);
    const issueIndex = this.issues.findIndex((i) => i.id === issueId);

    if (data.result === 'passed') {
      if (woIndex !== -1) {
        this.workOrders[woIndex] = { ...this.workOrders[woIndex], status: 'verified_complete' };
      }
      if (issueIndex !== -1) {
        this.issues[issueIndex] = {
          ...this.issues[issueIndex],
          operationalStatus: 'verified_resolved',
          verificationState: 'verified_resolved',
          lastRepairedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      this.addAudit(
        'RESOLUTION_VERIFIED_PASSED',
        'issue',
        issueId,
        `Independent verification PASSED by ${this.currentUser.name} via ${data.verificationMethod}.`
      );
    } else {
      // Failed or partial -> Reopen issue
      if (woIndex !== -1) {
        this.workOrders[woIndex] = { ...this.workOrders[woIndex], status: 'reopened' };
      }
      if (issueIndex !== -1) {
        this.issues[issueIndex] = {
          ...this.issues[issueIndex],
          operationalStatus: 'reopened',
          verificationState: 'failed_verification',
          isRecurring: true,
          recurrenceCount: this.issues[issueIndex].recurrenceCount + 1,
          updatedAt: new Date().toISOString(),
        };
      }
      this.addAudit(
        'RESOLUTION_VERIFICATION_FAILED',
        'issue',
        issueId,
        `Verification FAILED. Defect persists. Issue reopened for corrective work order.`
      );
    }

    this.persistAll();
    this.notify();
    return newVerif;
  }

  // --- INSPECTION MANAGEMENT ---
  createInspection(data: {
    issueId?: string;
    assetId?: string;
    assignedInspectorId: string;
    assignedInspectorName: string;
    scheduledDate: string;
    checklist: { item: string; checked: boolean; note?: string }[];
    notes?: string;
  }): Inspection {
    const id = `INS-2026-${String(this.inspections.length + 50).padStart(3, '0')}`;
    const newIns: Inspection = {
      ...data,
      id,
      status: 'scheduled',
    };

    this.inspections = [newIns, ...this.inspections];

    if (data.issueId) {
      const issueIndex = this.issues.findIndex((i) => i.id === data.issueId);
      if (issueIndex !== -1) {
        this.issues[issueIndex] = {
          ...this.issues[issueIndex],
          operationalStatus: 'inspection_scheduled',
          activeInspectionId: id,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    this.addAudit('INSPECTION_SCHEDULED', 'inspection', id, `Inspection scheduled for ${data.assignedInspectorName}.`);
    this.persistAll();
    this.notify();
    return newIns;
  }

  completeInspection(
    inspectionId: string,
    findings: NonNullable<Inspection['findings']>,
    updatedChecklist: Inspection['checklist'],
    notes?: string
  ): void {
    const insIndex = this.inspections.findIndex((i) => i.id === inspectionId);
    if (insIndex === -1) return;

    this.inspections[insIndex] = {
      ...this.inspections[insIndex],
      status: 'completed',
      completedAt: new Date().toISOString(),
      findings,
      checklist: updatedChecklist,
      notes: notes || this.inspections[insIndex].notes,
    };

    const targetIssueId = this.inspections[insIndex].issueId;
    if (targetIssueId) {
      const issueIndex = this.issues.findIndex((i) => i.id === targetIssueId);
      if (issueIndex !== -1) {
        let opStatus: CivicIssue['operationalStatus'] = 'pending_triage';
        if (findings.recommendedAction === 'immediate_work_order') {
          opStatus = 'work_order_pending';
        }
        this.issues[issueIndex] = {
          ...this.issues[issueIndex],
          operationalStatus: opStatus,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    this.addAudit(
      'INSPECTION_COMPLETED',
      'inspection',
      inspectionId,
      `Inspector submitted findings: ${findings.observedCondition}. Recommended: ${findings.recommendedAction}`
    );

    this.persistAll();
    this.notify();
  }

  // --- AREA SCANNING ---
  createAreaScan(data: Omit<AreaScan, 'id' | 'observations' | 'coveragePercentage' | 'actualKmCovered'>): AreaScan {
    const id = `SCN-2026-${String(this.scans.length + 10).padStart(3, '0')}`;
    const newScan: AreaScan = {
      ...data,
      id,
      observations: [],
      coveragePercentage: 0,
      actualKmCovered: 0,
    };

    this.scans = [newScan, ...this.scans];
    this.addAudit('AREA_SCAN_CREATED', 'scan', id, `Area scan "${newScan.name}" planned for ${newScan.ward}.`);
    this.persistAll();
    this.notify();
    return newScan;
  }

  addScanObservation(scanId: string, obs: Omit<AreaScan['observations'][0], 'id' | 'timestamp'>): void {
    const scanIndex = this.scans.findIndex((s) => s.id === scanId);
    if (scanIndex === -1) return;

    const newObs = {
      ...obs,
      id: `OBS-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
    };

    const updatedObservations = [...this.scans[scanIndex].observations, newObs];
    // Recalculate coverage and covered distance estimate
    const count = updatedObservations.length;
    const estKm = Math.min(this.scans[scanIndex].plannedKm, Number((count * 0.35).toFixed(2)));
    const coverage = Math.min(100, Math.round((estKm / (this.scans[scanIndex].plannedKm || 1)) * 100));

    this.scans[scanIndex] = {
      ...this.scans[scanIndex],
      observations: updatedObservations,
      actualKmCovered: estKm,
      coveragePercentage: coverage,
    };

    this.persistAll();
    this.notify();
  }

  convertScanObservationToReport(scanId: string, obsId: string): IssueReport | null {
    const scan = this.scans.find((s) => s.id === scanId);
    if (!scan) return null;
    const obs = scan.observations.find((o) => o.id === obsId);
    if (!obs) return null;

    const newReport = this.submitReport({
      reporterId: scan.leadObserverId,
      reporterName: scan.leadObserverName,
      reporterRole: 'inspector',
      category: obs.category,
      subcategory: obs.subcategory,
      title: `${obs.category}: ${obs.subcategory} (from ${scan.name})`,
      description: obs.notes,
      location: {
        lat: obs.lat,
        lng: obs.lng,
        accuracyMeters: 5,
        source: 'gps_verified',
        addressText: `Observed during systematic sweep in ${scan.ward}`,
        ward: scan.ward,
      },
      observedAt: obs.timestamp,
      attachments: obs.photoUrl
        ? [
            {
              id: `ATT-OBS-${Date.now()}`,
              url: obs.photoUrl,
              capturedAt: obs.timestamp,
              uploadedAt: new Date().toISOString(),
              fileSizeBytes: 1500000,
              mimeType: 'image/jpeg',
              isPublicSafe: true,
            },
          ]
        : [],
      isPrivate: false,
    });

    // Mark observation as converted
    const scanIndex = this.scans.findIndex((s) => s.id === scanId);
    if (scanIndex !== -1) {
      this.scans[scanIndex].observations = this.scans[scanIndex].observations.map((o) =>
        o.id === obsId ? { ...o, convertedReportId: newReport.id } : o
      );
      this.persistAll();
    }

    return newReport;
  }

  finishAreaScan(scanId: string, summary: string): void {
    const scanIndex = this.scans.findIndex((s) => s.id === scanId);
    if (scanIndex === -1) return;

    this.scans[scanIndex] = {
      ...this.scans[scanIndex],
      status: 'completed',
      endedAt: new Date().toISOString(),
      summary,
    };

    this.addAudit('AREA_SCAN_COMPLETED', 'scan', scanId, `Scan "${this.scans[scanIndex].name}" finalized.`);
    this.persistAll();
    this.notify();
  }

  // --- STATS & METRICS (Honest and Derived) ---
  getMetrics() {
    const totalReports = this.reports.length;
    const totalIssues = this.issues.length;
    const validatedIssues = this.issues.filter((i) => i.validationStatus === 'validated').length;
    const recurringIssues = this.issues.filter((i) => i.isRecurring).length;
    const activeWorkOrders = this.workOrders.filter(
      (w) => w.status === 'assigned' || w.status === 'in_progress'
    ).length;
    const completionsAwaitingVerification = this.workOrders.filter(
      (w) => w.status === 'completion_reported'
    ).length;
    const verifiedResolutions = this.verifications.filter((v) => v.result === 'passed').length;
    const failedVerifications = this.verifications.filter((v) => v.result === 'failed').length;
    const totalAreaScans = this.scans.length;
    const completedScans = this.scans.filter((s) => s.status === 'completed').length;
    const totalHotspots = this.hotspots.length;

    return {
      totalReports,
      totalIssues,
      validatedIssues,
      recurringIssues,
      activeWorkOrders,
      completionsAwaitingVerification,
      verifiedResolutions,
      failedVerifications,
      totalAreaScans,
      completedScans,
      totalHotspots,
      recurrenceRate: totalIssues > 0 ? Math.round((recurringIssues / totalIssues) * 100) : 0,
      verificationRate:
        completionsAwaitingVerification + verifiedResolutions > 0
          ? Math.round(
              (verifiedResolutions /
                (completionsAwaitingVerification + verifiedResolutions)) *
                100
            )
          : 0,
    };
  }
}

export const store = new CivicScanStore();
