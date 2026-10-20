import React, { useState } from 'react';
import { IssueCategory, IssueReport, LocationSource, VisionAnalysisResult } from '../../types/civic';
import { store } from '../../services/store';
import { analyzeCivicImage, fileToBase64 } from '../../services/visionService';
import { CivicMap } from '../map/CivicMap';
import {
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Info,
  Clock,
  Loader2,
} from 'lucide-react';

const CATEGORIES: {
  category: IssueCategory;
  subcategories: string[];
  description: string;
  icon: string;
}[] = [
  {
    category: 'Roads and transportation',
    icon: '🛣️',
    description: 'Potholes, broken asphalt, dangerous speed bumps, damaged curbs & sidewalks.',
    subcategories: [
      'Potholes / Surface Crater',
      'Broken Road Surface / Alligator Cracks',
      'Damaged Speed Breaker',
      'Unsafe Sidewalk / Footpath Paver',
      'Pedestrian Crossing Barrier',
    ],
  },
  {
    category: 'Drainage and flooding',
    icon: '🌧️',
    description: 'Street ponding, blocked catch basins, overflowing manholes, silted culverts.',
    subcategories: [
      'Waterlogging / Standing Surface Water',
      'Blocked Drainage Inlet / Catch Basin',
      'Broken Manhole Cover',
      'Sewer Overflow',
      'Damaged Culvert / Retaining Wall',
    ],
  },
  {
    category: 'Water and utilities',
    icon: '💧',
    description: 'Pressurized water pipe bursts, continuous leaks, broken valves or utility hydrants.',
    subcategories: [
      'Visible Water Pipeline Leak',
      'Broken Supply Valve',
      'Low / Contaminated Supply Incident',
      'Damaged Utility Fixture',
    ],
  },
  {
    category: 'Streetlights and electrical infrastructure',
    icon: '💡',
    description: 'Non-functioning streetlights, exposed wiring, flickering luminaires, leaning poles.',
    subcategories: [
      'Non-functioning Streetlight Luminaire',
      'Exposed Wiring / Open Junction Box',
      'Flickering or Dim Streetlight Corridor',
      'Damaged or Leaning Light Pole',
    ],
  },
  {
    category: 'Waste and sanitation',
    icon: '🗑️',
    description: 'Overflowing public bins, unauthorized garbage dumping, uncollected commercial waste.',
    subcategories: [
      'Overflowing Municipal Bin',
      'Repeated Waste Dumping / Blackspot',
      'Uncollected Organic Commercial Waste',
      'Damaged Waste Enclosure',
    ],
  },
  {
    category: 'Public spaces',
    icon: '🌳',
    description: 'Damaged park equipment, broken benches, missing guardrails, signage hazards.',
    subcategories: [
      'Broken Public Bench / Play Equipment',
      'Damaged Safety Guardrail',
      'Missing or Obscured Street Sign',
      'Accessibility Obstruction',
    ],
  },
];

interface ReportIssueWizardProps {
  onReportCreated?: (report: IssueReport) => void;
  onCancel?: () => void;
}

export const ReportIssueWizard: React.FC<ReportIssueWizardProps> = ({
  onReportCreated,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form State
  const [category, setCategory] = useState<IssueCategory>('Roads and transportation');
  const [subcategory, setSubcategory] = useState<string>('Potholes / Surface Crater');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [observedAt, setObservedAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Photo & Vision State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);

  // Location State
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.6412);
  const [addressText, setAddressText] = useState('Ring Road Arterial, Ward 12');
  const [ward, setWard] = useState('Ward 12');
  const [locationSource, setLocationSource] = useState<LocationSource>('gps_verified');
  const [accuracyMeters, setAccuracyMeters] = useState<number>(5);
  const [isLocating, setIsLocating] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Submitted result
  const [submittedReport, setSubmittedReport] = useState<IssueReport | null>(null);

  // Handle Photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const b64 = await fileToBase64(file);
      setImagePreview(b64);
      setImageBase64(b64);

      // Trigger CivicScan Vision analysis
      setIsAnalyzing(true);
      const analysis = await analyzeCivicImage({
        imageBase64: b64,
        mimeType: file.type || 'image/jpeg',
        categoryHint: category,
        descriptionHint: description,
      });

      setVisionResult(analysis);
      if (analysis.suggestedCategory && CATEGORIES.some((c) => c.category === analysis.suggestedCategory)) {
        setCategory(analysis.suggestedCategory as IssueCategory);
      }
      if (analysis.suggestedSubcategory) {
        setSubcategory(analysis.suggestedSubcategory);
      }
      if (!title && analysis.suggestedSubcategory) {
        setTitle(`Observed ${analysis.suggestedSubcategory}`);
      }
    } catch (err) {
      console.error('Error reading photo:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Sample Photos for quick testing
  const selectSamplePhoto = async (url: string, defaultTitle: string, cat: IssueCategory, subcat: string) => {
    setImagePreview(url);
    setImageBase64(url);
    setCategory(cat);
    setSubcategory(subcat);
    setTitle(defaultTitle);
    setIsAnalyzing(true);
    const analysis = await analyzeCivicImage({
      imageBase64: url,
      categoryHint: cat,
      descriptionHint: defaultTitle,
    });
    setVisionResult(analysis);
    setIsAnalyzing(false);
  };

  // GPS locate with Browser API
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracyMeters(Math.round(pos.coords.accuracy));
        setLocationSource('gps_verified');
        setAddressText(`Verified GPS fix: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Default to safe simulated GPS location
        setLat(12.9721);
        setLng(77.6405);
        setLocationSource('map_pin_manual');
        setAddressText('Ward 12 Central Corridor, Domlur (Manual pin default)');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Map Pin Click
  const handleMapPinSelected = (pinnedLat: number, pinnedLng: number) => {
    setLat(pinnedLat);
    setLng(pinnedLng);
    setLocationSource('map_pin_manual');
    setAccuracyMeters(8);
    setAddressText(`Pinned coordinates: ${pinnedLat.toFixed(5)}, ${pinnedLng.toFixed(5)}`);
  };

  // Submit Handler
  const handleSubmit = () => {
    const user = store.currentUser;

    const report = store.submitReport({
      reporterId: user.id,
      reporterName: user.name,
      reporterRole: user.role,
      category,
      subcategory,
      title: title || `${subcategory} near ${addressText}`,
      description: description || 'Resident submitted infrastructure observation via CivicScan web portal.',
      location: {
        lat,
        lng,
        accuracyMeters,
        source: locationSource,
        addressText,
        ward,
      },
      observedAt: new Date(observedAt).toISOString(),
      attachments: imagePreview
        ? [
            {
              id: `ATT-${Date.now()}`,
              url: imagePreview,
              caption: imageCaption,
              capturedAt: new Date(observedAt).toISOString(),
              uploadedAt: new Date().toISOString(),
              fileSizeBytes: 2100000,
              mimeType: 'image/jpeg',
              isPublicSafe: !isPrivate,
              visionAnalysis: visionResult || undefined,
            },
          ]
        : [],
      isPrivate,
    });

    setSubmittedReport(report);
    setStep(6);
    if (onReportCreated) onReportCreated(report);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Step Header Indicator */}
      <div className="bg-slate-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
              Civic Issue Report Engine
            </span>
            <h2 className="text-xl font-bold mt-0.5">
              {step === 1 && 'Step 1: Select Infrastructure Problem Category'}
              {step === 2 && 'Step 2: Describe Observations & Condition'}
              {step === 3 && 'Step 3: Capture Photo & CivicScan Vision Analysis'}
              {step === 4 && 'Step 4: Confirm Accurate Geographic Location'}
              {step === 5 && 'Step 5: Review & Submit to Municipal Queue'}
              {step === 6 && 'Report Submitted & Tracked'}
            </h2>
          </div>
          {onCancel && step < 6 && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= s ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 md:p-8">
        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Select the primary municipal domain. CivicScan will cross-reference this with historical area assets and inspection records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((catItem) => (
                <div
                  key={catItem.category}
                  onClick={() => {
                    setCategory(catItem.category);
                    setSubcategory(catItem.subcategories[0]);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-4 ${
                    category === catItem.category
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    {catItem.icon}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{catItem.category}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {catItem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subcategory dropdown */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Specific Defect Type ({category})
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {CATEGORIES.find((c) => c.category === category)?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center space-x-2 transition"
              >
                <span>Continue to Description</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Issue Description */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. Hazardous deep pothole near Metro Pillar 142`}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Observed Condition
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you saw: dimensions, traffic hazard, whether this appeared after rain, or if it has occurred repeatedly at this exact spot..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Tip: State visible facts (e.g. water pooling) rather than assuming causes without evidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Observation Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={observedAt}
                  onChange={(e) => setObservedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Municipal Ward
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Ward 12">Ward 12 (Indira Nagar & Domlur)</option>
                  <option value="Ward 14">Ward 14 (Koramangala & Market)</option>
                  <option value="Ward 18">Ward 18 (MG Road & CBD)</option>
                  <option value="Ward 22">Ward 22 (Ulsoor Lake)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-lg flex items-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center space-x-2 transition"
              >
                <span>Continue to Photo Capture</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Photo Capture & CivicScan Vision Analysis */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Upload or Capture Photographic Evidence</h3>
              <p className="text-xs text-slate-500">
                Photographs are analyzed by CivicScan Vision (Gemini 3.8 Flash). Visible observations are strictly separated from inferred causes.
              </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center bg-slate-50 transition">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="photo-upload"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Click to Take Photo or Browse Local Files
                </div>
                <div className="text-xs text-slate-500">JPEG, PNG, WebP up to 15MB</div>
              </label>

              {/* Quick sample photo selector for testing */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Or test with verified scenario photo:</span>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      selectSamplePhoto(
                        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
                        'Recurrent deep road crater with exposed ballast',
                        'Roads and transportation',
                        'Potholes / Surface Crater'
                      )
                    }
                    className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-500 rounded text-slate-700 shadow-2xs"
                  >
                    Scenario A: Recurring Pothole
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      selectSamplePhoto(
                        'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
                        'Curb waterlogging near Palm Grove gate',
                        'Drainage and flooding',
                        'Waterlogging / Standing Surface Water'
                      )
                    }
                    className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-500 rounded text-slate-700 shadow-2xs"
                  >
                    Scenario B: Waterlogging
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      selectSamplePhoto(
                        'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
                        'Sidewalk organic waste dump behind market',
                        'Waste and sanitation',
                        'Repeated Waste Dumping / Blackspot'
                      )
                    }
                    className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-500 rounded text-slate-700 shadow-2xs"
                  >
                    Scenario C: Waste Dumping
                  </button>
                </div>
              </div>
            </div>

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center space-x-3 text-indigo-900">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">CivicScan Vision Engine analyzing photograph...</span>
                  <p className="text-indigo-700 mt-0.5">
                    Extracting visible physical observations, checking safety hazards, and framing testable hypotheses.
                  </p>
                </div>
              </div>
            )}

            {/* Image Preview & AI Breakdown */}
            {imagePreview && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-56">
                    <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
                  </div>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Add descriptive photo caption..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-800"
                  />
                </div>

                {visionResult && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-900 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1" />
                        CivicScan Vision Findings
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono">
                        {visionResult.modelUsed}
                      </span>
                    </div>

                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                      <div className="font-semibold text-emerald-900 flex items-center">
                        <Eye className="w-3 h-3 mr-1 text-emerald-600" />
                        Visible Observations (Fact):
                      </div>
                      <ul className="list-disc pl-4 text-emerald-950 mt-1 space-y-0.5">
                        {visionResult.visibleObservations.map((obs, i) => (
                          <li key={i}>{obs}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 bg-amber-50 rounded border border-amber-200">
                      <div className="font-semibold text-amber-900 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                        Inferred Hypothesis (Pending Field Audit):
                      </div>
                      <ul className="list-disc pl-4 text-amber-950 mt-1 space-y-0.5">
                        {visionResult.inferredCauses.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      <strong>Missing Evidence:</strong> {visionResult.missingEvidence.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-lg flex items-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center space-x-2 transition"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Geographic Location Selection */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pinpoint Geographic Incident Coordinates</h3>
                <p className="text-xs text-slate-500">
                  Accurate coordinates allow the engine to detect recurring defects and match past work orders.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetDeviceLocation}
                disabled={isLocating}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-2xs transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Acquiring GPS Fix...' : 'Acquire Device GPS Fix'}</span>
              </button>
            </div>

            {/* Interactive Pin-Selector Map */}
            <div className="space-y-2">
              <CivicMap
                issues={store.issues}
                hotspots={store.hotspots}
                pinSelectMode={true}
                onPinSelected={handleMapPinSelected}
                heightClass="h-[320px]"
              />
              <p className="text-[11px] text-slate-500">
                Click anywhere on the map to position the coordinate pin. Existing nearby issues and hotspots are shown.
              </p>
            </div>

            {/* Location Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-700">Street / Landmark Address</span>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700">Location Source & Accuracy</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-slate-700">
                    {locationSource} (±{accuracyMeters}m)
                  </span>
                  <span className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-slate-700">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-lg flex items-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center space-x-2 transition"
              >
                <span>Review & Finalize</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase">{category}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{subcategory}</p>
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Submission attachment"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-300"
                  />
                )}
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <p>
                  <strong>Description: </strong>
                  {description || 'None provided'}
                </p>
                <p>
                  <strong>Location: </strong>
                  {addressText} ({ward}) • Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)} ({locationSource})
                </p>
                <p>
                  <strong>Observed At: </strong>
                  {new Date(observedAt).toLocaleString()}
                </p>
              </div>

              {/* Privacy Toggle */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Public Accountability Redaction</div>
                  <div className="text-[11px] text-slate-500">
                    Hide personal reporter identity on public transparency views.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
              </div>
            </div>

            {/* Strict CivicScan Disclosure */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-amber-700" />
                CivicScan Verification Principle
              </div>
              <p>
                Submitting this report enters it into the municipal validation queue with a distinct ID. It does NOT invent official municipal acknowledgment until human reviewers audit the evidence.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-lg flex items-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-md flex items-center space-x-2 transition"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit to CivicScan Engine</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation & Tracking */}
        {step === 6 && submittedReport && (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Reference ID: {submittedReport.id}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Report Successfully Registered
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your observation has been indexed into the CivicScan Intelligence layer. Nearby reports are being checked for duplicate clustering.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Initial Validation Status:</span>
                <span className="font-semibold text-slate-800">Submitted (Awaiting Triage)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Geographic Ward:</span>
                <span className="font-semibold text-slate-800">{submittedReport.location.ward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Photographic Evidence:</span>
                <span className="font-semibold text-slate-800">
                  {submittedReport.attachments.length} file(s) attached
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={() => {
                  setStep(1);
                  setTitle('');
                  setDescription('');
                  setImagePreview(null);
                  setVisionResult(null);
                  setSubmittedReport(null);
                }}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                Submit Another Report
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
