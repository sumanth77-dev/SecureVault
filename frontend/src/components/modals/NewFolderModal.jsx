import React, { useState } from 'react';
import { FolderPlus, X, Palette } from 'lucide-react';
import { Button } from '../common/Button';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../common/Toast';

export const NewFolderModal = ({ isOpen, onClose }) => {
  const { createFolder } = useDocuments();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  if (!isOpen) return null;

  const colorOptions = [
    { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { id: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
    { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { id: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
    { id: 'amber', label: 'Amber', class: 'bg-amber-500' },
    { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
    { id: 'slate', label: 'Slate', class: 'bg-slate-500' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createFolder({
      name: name.trim(),
      color,
      description: description.trim()
    });

    showToast(`Folder "${name}" created successfully.`, 'success');
    setName('');
    setDescription('');
    setColor('blue');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Create New Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tax Invoices & Audits"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" /> Color Tag
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.class} transition-all flex items-center justify-center ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of documents stored here..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={FolderPlus}>
              Create Folder
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
