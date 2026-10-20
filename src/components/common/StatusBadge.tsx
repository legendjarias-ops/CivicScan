import React from 'react';
import { ValidationStatus, OperationalStatus, VerificationState, PriorityLevel, WorkOrder } from '../../types/civic';

export const ValidationStatusBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
  switch (status) {
    case 'validated':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-600"></span>
          Validated
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-600"></span>
          Under Review
        </span>
      );
    case 'needs_more_info':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-600"></span>
          Needs Info
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-600"></span>
          Rejected
        </span>
      );
    case 'submitted':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
          Submitted
        </span>
      );
  }
};

export const OperationalStatusBadge: React.FC<{ status: OperationalStatus }> = ({ status }) => {
  switch (status) {
    case 'verified_resolved':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-teal-600"></span>
          Verified Resolved
        </span>
      );
    case 'completion_reported':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Completion Reported (Unverified)
        </span>
      );
    case 'work_in_progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-600"></span>
          Work In Progress
        </span>
      );
    case 'work_order_pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-indigo-600"></span>
          Work Order Pending
        </span>
      );
    case 'inspection_in_progress':
    case 'inspection_scheduled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-sky-600"></span>
          Inspection Active
        </span>
      );
    case 'reopened':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse"></span>
          Reopened (Recurring)
        </span>
      );
    case 'pending_triage':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
          Pending Triage
        </span>
      );
  }
};

export const VerificationStateBadge: React.FC<{ state: VerificationState }> = ({ state }) => {
  switch (state) {
    case 'verified_resolved':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
          ✓ Verified Fixed
        </span>
      );
    case 'verification_scheduled':
    case 'verification_in_progress':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
          ⏳ Verification Pending
        </span>
      );
    case 'failed_verification':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300">
          ✗ Verification Failed
        </span>
      );
    case 'reopened_recurring':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-300">
          ↺ Recurrence Reopened
        </span>
      );
    case 'unverified':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal bg-slate-100 text-slate-600 border border-slate-200">
          Unverified
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-red-600 text-white shadow-xs">
          CRITICAL
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Low
        </span>
      );
  }
};

export const WorkOrderStatusBadge: React.FC<{ status: WorkOrder['status'] }> = ({ status }) => {
  switch (status) {
    case 'verified_complete':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-teal-600"></span>
          Verified Complete
        </span>
      );
    case 'completion_reported':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Completion Reported (Unverified)
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-600"></span>
          In Progress
        </span>
      );
    case 'assigned':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-indigo-600"></span>
          Assigned
        </span>
      );
    case 'reopened':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse"></span>
          Reopened (Failed Verification)
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
          Draft
        </span>
      );
  }
};

