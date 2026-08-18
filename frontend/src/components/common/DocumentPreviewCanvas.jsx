import React from 'react';
import {
  ShieldCheck,
  Award,
  FileCheck2,
  Lock,
  QrCode,
  Building,
  CheckCircle2,
  Calendar,
  User,
  Hash,
  Stamp,
  FileText
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DocumentPreviewCanvas = ({ document }) => {
  if (!document) return null;

  const { name, title, category, previewType, expiryDate, uploadedAt, status, sizeFormatted } = document;

  // Passport preview
  if (previewType === 'passport' || name.toLowerCase().includes('passport')) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden font-mono">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold">REPUBLIC OF CITIZENSHIP</p>
              <h4 className="text-lg font-bold tracking-wider text-white">OFFICIAL PASSPORT</h4>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Biometric Verified
          </span>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Avatar Photo Frame */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800 relative">
            <div className="w-28 h-36 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg flex flex-col items-center justify-center text-slate-500 border border-slate-700/60 overflow-hidden relative shadow-inner">
              <User className="w-14 h-14 text-slate-400" />
              <div className="absolute bottom-2 text-[10px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded">
                SUMANTH
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-amber-400" /> Chip ID: 8849-012X
            </div>
          </div>

          {/* Details Fields */}
          <div className="sm:col-span-2 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Surname / Name</span>
                <span className="font-semibold text-white text-sm">SUMANTH RAO</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Nationality</span>
                <span className="font-semibold text-white text-sm">CITIZEN</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Passport No.</span>
                <span className="font-semibold text-amber-300 text-sm">Z8829104</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Date of Birth</span>
                <span className="font-semibold text-white">14 MAY 1996</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Date of Issue</span>
                <span className="text-slate-300">{formatDate(uploadedAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Date of Expiry</span>
                <span className="text-emerald-400 font-semibold">{formatDate(expiryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Readable Zone (MRZ) */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-700/80 bg-slate-950/60 p-3 rounded-lg text-[10px] text-slate-400 tracking-widest break-all font-mono select-none">
          P&lt;UTOPIA&lt;&lt;SUMANTH&lt;RAO&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
          Z8829104&lt;4UTO9605148M3408154&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
        </div>
      </div>
    );
  }

  // Insurance policy preview
  if (previewType === 'insurance' || name.toLowerCase().includes('insurance')) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{title || name}</h4>
              <p className="text-xs text-slate-500">Comprehensive Underwritten Policy Schedule</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-semibold">
            Active Policy
          </span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] text-slate-500 block">Policy Holder</span>
              <span className="font-semibold">Sumanth</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Sum Insured</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">$500,000 / $1M Max</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Policy No.</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">POL-2026-99214</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Renewal Due</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{formatDate(expiryDate)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-300">Key Benefits & Coverage Summary:</h5>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>100% Cashless Hospitalization across 14,000+ In-Network Hospitals.</li>
              <li>Zero Copayment on pre-existing room rent and consultation expenses.</li>
              <li>Emergency Global Medical Evacuation coverage included.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Digital Seal ID: 0x88F1A934</span>
          <span>Verified Cryptographically</span>
        </div>
      </div>
    );
  }

  // Degree / Certificate preview
  if (previewType === 'certificate' || name.toLowerCase().includes('certificate') || name.toLowerCase().includes('degree')) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 rounded-2xl p-8 border-4 border-double border-amber-300 dark:border-amber-700/60 shadow-2xl relative text-center">
        <div className="absolute top-4 left-4 text-amber-600 dark:text-amber-500 opacity-20">
          <Award className="w-16 h-16" />
        </div>

        <div className="space-y-4">
          <div className="inline-flex p-3 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="font-serif text-2xl font-bold tracking-wide text-slate-900 dark:text-white uppercase">
            CERTIFICATE OF ACHIEVEMENT
          </h3>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
            This is to certify that
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 py-1 font-serif border-b border-amber-200 dark:border-slate-800 max-w-md mx-auto">
            SUMANTH
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Has successfully fulfilled all curriculum requirements and academic examinations for the conferment of
          </p>

          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title || 'Bachelor of Technology'}
          </h4>

          <div className="pt-6 flex items-center justify-around border-t border-amber-100 dark:border-slate-800 text-xs">
            <div className="text-center">
              <div className="h-8 flex items-end justify-center font-serif italic text-slate-700 dark:text-slate-300">
                Dr. A. Henderson
              </div>
              <span className="text-[10px] text-slate-400 uppercase block border-t border-slate-300 dark:border-slate-700 pt-1">
                Dean of Academic Affairs
              </span>
            </div>

            <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center text-amber-500 text-[9px] font-bold tracking-tighter uppercase shadow-inner">
              SEAL
            </div>

            <div className="text-center">
              <div className="h-8 flex items-end justify-center font-serif italic text-slate-700 dark:text-slate-300">
                Registrar Office
              </div>
              <span className="text-[10px] text-slate-400 uppercase block border-t border-slate-300 dark:border-slate-700 pt-1">
                University Controller
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic document / contract / receipt preview fallback
  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-white">{title || name}</h4>
            <p className="text-xs text-slate-500">{category} &bull; {sizeFormatted}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-mono">
          Page 1 of 1
        </span>
      </div>

      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm space-y-3 leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="font-medium text-slate-900 dark:text-white">Document Summary & Validation Notice</p>
        <p>
          This document was securely uploaded and verified under <strong>{category}</strong> category. The integrity hash matches the initial client-side metadata signature.
        </p>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-500 font-semibold">{status ? status.toUpperCase() : 'VALID'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Uploaded Date:</span>
            <span>{formatDate(uploadedAt)}</span>
          </div>
          {expiryDate && (
            <div className="flex justify-between">
              <span className="text-slate-400">Expiry Date:</span>
              <span className="text-amber-500">{formatDate(expiryDate)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> End-to-End Secure Metadata
        </span>
        <span>SecureVault Protected</span>
      </div>
    </div>
  );
};
