export type UserRole = 'resident' | 'inspector' | 'official' | 'society_lead';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  ward: string;
  phone?: string;
  avatarUrl?: string;
}

export type IssueCategory =
  | 'Roads and transportation'
  | 'Drainage and flooding'
  | 'Water and utilities'
  | 'Streetlights and electrical infrastructure'
  | 'Waste and sanitation'
  | 'Public spaces';

export type ValidationStatus =
  | 'submitted'
  | 'needs_more_info'
  | 'under_review'
  | 'validated'
  | 'rejected';

export type OperationalStatus =
  | 'pending_triage'
  | 'inspection_scheduled'
  | 'inspection_in_progress'
  | 'work_order_pending'
  | 'work_in_progress'
  | 'completion_reported'
  | 'verified_resolved'
  | 'reopened';

export type VerificationState =
  | 'unverified'
  | 'verification_scheduled'
  | 'verification_in_progress'
  | 'verified_resolved'
  | 'failed_verification'
  | 'reopened_recurring';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type LocationSource = 'gps_verified' | 'map_pin_manual' | 'address_lookup' | 'approximate_area';

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  source: LocationSource;
  addressText: string;
  ward: string;
  landmark?: string;
}

export interface VisionAnalysisResult {
  aiAvailable: boolean;
  isSimulated?: boolean;
  modelUsed: string;
  suggestedCategory: IssueCategory | string;
  suggestedSubcategory: string;
  visibleObservations: string[];
  inferredCauses: string[];
  hazardLevel: PriorityLevel;
  confidenceScore: number;
  confidenceAssessment: string;
  missingEvidence: string[];
  recommendedNextSteps: string[];
  reviewRequired: boolean;
  timestamp?: string;
}

export interface Attachment {
  id: string;
  url: string;
  caption?: string;
  capturedAt: string;
  uploadedAt: string;
  fileSizeBytes: number;
  mimeType: string;
  visionAnalysis?: VisionAnalysisResult;
  isPublicSafe: boolean;
}

export interface IssueReport {
  id: string; // e.g. REP-2026-001
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  category: IssueCategory;
  subcategory: string;
  title: string;
  description: string;
  location: GeoLocation;
  observedAt: string;
  submittedAt: string;
  attachments: Attachment[];
  validationStatus: ValidationStatus;
  canonicalIssueId?: string; // Linked canonical issue
  isPrivate: boolean;
  notes?: string;
}

export interface IssueReportLink {
  id: string;
  canonicalIssueId: string;
  reportId: string;
  matchScore: number; // 0-100 calculated
  matchRationale: string;
  reviewStatus: 'suggested' | 'confirmed_merged' | 'rejected_distinct';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CivicIssue {
  id: string; // e.g. ISS-2026-101
  canonicalCategory: IssueCategory;
  subcategory: string;
  title: string;
  description: string;
  canonicalLocation: GeoLocation;
  linkedReportIds: string[];
  primaryPhotoUrl: string;
  firstObservedAt: string;
  lastObservedAt: string;
  validationStatus: ValidationStatus;
  operationalStatus: OperationalStatus;
  verificationState: VerificationState;
  priority: PriorityLevel;
  priorityRationale: string;
  assignedDepartment: string;
  assetId?: string; // Linked physical asset
  isRecurring: boolean;
  recurrenceCount: number;
  daysToRecurrence?: number;
  lastRepairedAt?: string;
  activeWorkOrderId?: string;
  activeInspectionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InfrastructureAsset {
  id: string; // e.g. AST-RD-402
  assetType: 'road_segment' | 'drain_culvert' | 'manhole' | 'streetlight' | 'water_pipe' | 'waste_depot' | 'public_facility';
  name: string;
  ward: string;
  location: GeoLocation;
  installedYear?: number;
  condition: 'Good' | 'Fair' | 'Poor' | 'Critical Failure';
  lastInspectionDate?: string;
  linkedIssueCount: number;
  responsibleDepartment: string;
  notes?: string;
}

export interface Inspection {
  id: string; // e.g. INS-2026-042
  issueId?: string;
  assetId?: string;
  scanId?: string;
  assignedInspectorId: string;
  assignedInspectorName: string;
  scheduledDate: string;
  completedAt?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'unable_to_access';
  checklist: { item: string; checked: boolean; note?: string }[];
  findings?: {
    issueConfirmed: boolean;
    observedCondition: string;
    hazardPresent: boolean;
    recommendedAction: 'immediate_work_order' | 'monitor' | 'no_defect_found' | 'refer_to_utility';
    evidencePhotos: string[];
    uncertaintyNotes?: string;
  };
  notes?: string;
}

export interface WorkOrder {
  id: string; // e.g. WO-2026-088
  issueId: string;
  assetId?: string;
  title: string;
  description: string;
  assignedDepartment: string;
  contractorOrCrew: string;
  priority: PriorityLevel;
  targetCompletionDate: string;
  status:
    | 'draft'
    | 'assigned'
    | 'in_progress'
    | 'completion_reported'
    | 'verified_complete'
    | 'reopened';
  createdDate: string;
  completionReport?: {
    completedAt: string;
    workSummary: string;
    materialsUsed: string;
    completionPhotos: string[];
    reportedByCrew: string;
    technicianNotes?: string;
  };
}

export interface ResolutionVerification {
  id: string;
  workOrderId: string;
  issueId: string;
  verifiedBy: string;
  verifierRole: string;
  verifiedAt: string;
  verificationMethod: 'physical_reinspection' | 'photographic_audit' | 'resident_survey_consensus' | 'sensor_reading';
  result: 'passed' | 'failed' | 'partial_resolution';
  evidencePhotos: string[];
  findingsNotes: string;
  limitationDisclaimer: string;
}

export interface ScanObservation {
  id: string;
  lat: number;
  lng: number;
  category: IssueCategory;
  subcategory: string;
  severity: PriorityLevel;
  notes: string;
  photoUrl?: string;
  timestamp: string;
  convertedReportId?: string;
}

export interface AreaScan {
  id: string; // e.g. SCN-2026-005
  name: string;
  type: 'community_walk' | 'housing_society_sweep' | 'municipal_field_inspection' | 'followup_verification';
  ward: string;
  targetAreaDescription: string;
  routePolygon?: [number, number][]; // lat/lng points
  status: 'planned' | 'in_progress' | 'completed' | 'submitted_for_review';
  leadObserverId: string;
  leadObserverName: string;
  startedAt?: string;
  endedAt?: string;
  coveragePercentage: number;
  plannedKm: number;
  actualKmCovered: number;
  observations: ScanObservation[];
  summary?: string;
}

export interface HotspotCluster {
  id: string;
  name: string;
  ward: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  primaryCategory: IssueCategory;
  issueIds: string[];
  reportCount: number;
  distinctIssueCount: number;
  recurrenceRate: number; // percentage
  status: 'active_concern' | 'under_investigation' | 'systemic_fix_in_progress' | 'stabilized';
  contributingHypothesis: string;
  evidenceBasis: string;
  recommendedSystemicAction: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'report' | 'issue' | 'work_order' | 'inspection' | 'scan' | 'asset';
  entityId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkType?: 'issue' | 'work_order' | 'inspection' | 'scan';
  linkId?: string;
}
