import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  Calendar,
  Folder,
  Tag,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../common/Toast';
import { formatBytes } from '../../utils/formatters';

export const UploadModal = ({ isOpen, onClose, defaultFolderId = null }) => {
  const { folders, addDocument } = useDocuments();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Personal',
    folderId: defaultFolderId || (folders[0]?.id || 'folder-personal'),
    expiryDate: '',
    description: '',
    previewType: 'contract'
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setError('');
    let detectedCategory = 'Personal';
    let detectedPreviewType = 'contract';
    const lowerName = file.name.toLowerCase();

    if (lowerName.includes('passport') || lowerName.includes('id') || lowerName.includes('licence') || lowerName.includes('license') || lowerName.includes('aadhaar')) {
      detectedCategory = 'Identity';
      detectedPreviewType = lowerName.includes('passport') ? 'passport' : 'id_card';
    } else if (lowerName.includes('degree') || lowerName.includes('diploma') || lowerName.includes('cert') || lowerName.includes('transcript')) {
      detectedCategory = 'Education';
      detectedPreviewType = 'certificate';
    } else if (lowerName.includes('insurance') || lowerName.includes('policy') || lowerName.includes('health')) {
      detectedCategory = 'Insurance';
      detectedPreviewType = 'insurance';
    } else if (lowerName.includes('tax') || lowerName.includes('invoice') || lowerName.includes('statement') || lowerName.includes('bank')) {
      detectedCategory = 'Finance';
      detectedPreviewType = 'finance';
    } else if (lowerName.includes('resume') || lowerName.includes('cv') || lowerName.includes('offer') || lowerName.includes('contract')) {
      detectedCategory = 'Work';
      detectedPreviewType = lowerName.includes('resume') || lowerName.includes('cv') ? 'resume' : 'contract';
    }

    setFormData(prev => ({
      ...prev,
      name: file.name,
      category: detectedCategory,
      previewType: detectedPreviewType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name && !selectedFile) {
      setError('Please select a file or provide a document name.');
      return;
    }

    setIsUploading(true);
    setError('');

    // Smooth upload progress bar
    for (let progress = 15; progress <= 90; progress += 25) {
      await new Promise(resolve => setTimeout(resolve, 60));
      setUploadProgress(progress);
    }

    try {
      const sizeBytes = selectedFile ? selectedFile.size : 2500000;
      await addDocument({
        file: selectedFile,
        name: formData.name || selectedFile?.name || 'Document.pdf',
        title: (formData.name || selectedFile?.name || '').replace(/\.[^/.]+$/, ''),
        category: formData.category,
        folderId: formData.folderId,
        expiryDate: formData.expiryDate || null,
        description: formData.description,
        sizeBytes,
        previewType: formData.previewType
      });

      setUploadProgress(100);
      showToast(`"${formData.name || selectedFile?.name}" uploaded successfully.`, 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Upload Document</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 bg-slate-50/60 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(selectedFile.size)} &bull; Click to replace</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-blue-600 dark:text-blue-400 hover:underline">Click to browse</span> or drag & drop file
                </p>
                <p className="text-xs text-slate-400">
                  Supports PDF, PNG, JPG, JPEG, WEBP (Up to 50 MB)
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress bar (during upload) */}
          {isUploading && (
            <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Supabase Storage &amp; Encrypting...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Passport_2026.pdf"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Personal">Personal</option>
                  <option value="Identity">Identity</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Certificates">Certificates</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assign Folder
                </label>
                <select
                  value={formData.folderId}
                  onChange={e => setFormData({ ...formData, folderId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date <span className="text-slate-400 font-normal">(Optional for renewal alerts)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add notes, serial number or renewal details..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isUploading}
              icon={UploadCloud}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
