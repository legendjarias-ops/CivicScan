import React from 'react';
import { Attachment, GeoLocation } from '../../types/civic';
import { PriorityBadge } from './StatusBadge';
import { X, ShieldAlert, Sparkles, MapPin, Eye, AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';

interface EvidenceModalProps {
  attachment: Attachment;
  location?: GeoLocation;
  title?: string;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  attachment,
  location,
  title = 'Photographic Evidence & Provenance',
  onClose,
}) => {
  const vision = attachment.visionAnalysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">
              Captured: {new Date(attachment.capturedAt).toLocaleString()} • Uploaded:{' '}
              {new Date(attachment.uploadedAt).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[75vh] overflow-y-auto">
          {/* Left: Image & Metadata */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
              <img
                src={attachment.url}
                alt={attachment.caption || 'Civic infrastructure photo'}
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs rounded text-xs text-white font-mono">
                {(attachment.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB • {attachment.mimeType}
              </div>
            </div>

            {attachment.caption && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Reporter Caption: </span>
                {attachment.caption}
              </div>
            )}

            {location && (
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-lg space-y-1.5">
                <div className="flex items-center text-xs font-semibold text-sky-900">
                  <MapPin className="w-4 h-4 mr-1.5 text-sky-600" />
                  Geographic Provenance & Accuracy
                </div>
                <p className="text-xs text-slate-700">{location.addressText}</p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-600 pt-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-sky-200">
                    GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-sky-200">
                    Source: {location.source}
                  </span>
                  {location.accuracyMeters && (
                    <span className="bg-white px-2 py-0.5 rounded border border-sky-200">
                      Margin: ±{location.accuracyMeters}m
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: CivicScan Vision AI Analysis Breakdown */}
          <div className="space-y-4">
            {vision ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      CivicScan Vision Analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      {vision.modelUsed}
                    </span>
                    {vision.isSimulated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Simulated
                      </span>
                    )}
                  </div>
                </div>

                {/* Classification & Hazard */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[11px] text-slate-500 font-medium">Suggested Category</div>
                    <div className="text-xs font-bold text-slate-900">{vision.suggestedCategory}</div>
                    <div className="text-[11px] text-slate-600 truncate">{vision.suggestedSubcategory}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                    <div className="text-[11px] text-slate-500 font-medium">Assessed Hazard</div>
                    <div className="pt-0.5">
                      <PriorityBadge priority={vision.hazardLevel} />
                    </div>
                  </div>
                </div>

                {/* Visible Observations (Strictly Visible) */}
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1.5">
                  <div className="flex items-center text-xs font-bold text-emerald-900">
                    <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Visible Observations (Photographic Fact)
                  </div>
                  <ul className="text-xs text-emerald-950 space-y-1 pl-4 list-disc">
                    {vision.visibleObservations.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>

                {/* Inferred Causes (Hypotheses Requiring Field Proof) */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1.5">
                  <div className="flex items-center text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Inferred Hypotheses (Field Proof Required)
                  </div>
                  <ul className="text-xs text-amber-950 space-y-1 pl-4 list-disc">
                    {vision.inferredCauses.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 italic pt-1">
                    *CivicScan strict rule: Inferences are not treated as verified root causes without tactile field inspection.
                  </p>
                </div>

                {/* Missing Evidence / Photographic Limitations */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center text-xs font-bold text-slate-800">
                    <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    Missing Evidence (What 2D Photo Cannot Prove)
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                    {vision.missingEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* Confidence & Triage Note */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <span>Confidence: {(vision.confidenceScore * 100).toFixed(0)}%</span>
                  <span className="flex items-center text-indigo-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Pending Human Review Sign-Off
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500 space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-medium">No automated vision assessment recorded.</p>
                <p className="text-xs text-slate-400">
                  This image was submitted directly without prior AI preprocessing. Manual field verification recommended.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Close Evidence Window
          </button>
        </div>
      </div>
    </div>
  );
};
