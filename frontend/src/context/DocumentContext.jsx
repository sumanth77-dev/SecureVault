import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { formatBytes, getExpiryStatus } from '../utils/formatters';
import { documentService } from '../services/documentService';
import { folderService } from '../services/folderService';
import { shareService } from '../services/shareService';
import { dashboardService } from '../services/dashboardService';
import { auditService } from '../services/auditService';
import { useAuth } from './AuthContext';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [documents, setDocuments] = useState(() =>
    getStorageItem('sv_documents', [])
  );

  const [folders, setFolders] = useState(() =>
    getStorageItem('sv_folders', [])
  );

  const [sharedDocuments, setSharedDocuments] = useState(() =>
    getStorageItem('sv_shared_docs', [])
  );

  const [activities, setActivities] = useState(() =>
    getStorageItem('sv_activities', [])
  );

  const [isLoading, setIsLoading] = useState(false);

  // Clear or sync data
  useEffect(() => {
    if (!isAuthenticated) {
      setDocuments([]);
      setFolders([]);
      setSharedDocuments([]);
      setActivities([]);
      removeStorageItem('sv_documents');
      removeStorageItem('sv_folders');
      removeStorageItem('sv_shared_docs');
      removeStorageItem('sv_activities');
    }
  }, [isAuthenticated]);

  // Sync to localStorage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setStorageItem('sv_documents', documents);
    }
  }, [documents, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setStorageItem('sv_folders', folders);
    }
  }, [folders, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setStorageItem('sv_shared_docs', sharedDocuments);
    }
  }, [sharedDocuments, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setStorageItem('sv_activities', activities);
    }
  }, [activities, isAuthenticated]);

  // Fetch real data from backend API
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [docsRes, foldersRes, sharesRes, logsRes] = await Promise.allSettled([
        documentService.getDocuments(),
        folderService.getFolders(),
        shareService.getShares(),
        auditService.getAuditLogs()
      ]);

      if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value?.documents)) {
        setDocuments(docsRes.value.documents);
      }

      if (foldersRes.status === 'fulfilled' && Array.isArray(foldersRes.value)) {
        setFolders(foldersRes.value);
      }

      if (sharesRes.status === 'fulfilled' && Array.isArray(sharesRes.value)) {
        setSharedDocuments(sharesRes.value);
      }

      if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value)) {
        setActivities(logsRes.value);
      }
    } catch (err) {
      console.warn('API data fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Add an activity helper
  const recordActivity = (type, title, description, badge, documentId = null) => {
    const newActivity = {
      id: 'act-' + Date.now(),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      user: user?.name || 'User',
      documentId,
      badge: badge || 'Activity'
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 40)]);
  };

  // Document Operations
  const addDocument = async (docData) => {
    const sizeBytes = docData.file?.size || docData.sizeBytes || 0;
    
    // Create optimistic doc
    const optimisticDoc = {
      id: 'doc-' + Date.now(),
      name: docData.name || docData.file?.name || 'Document.pdf',
      title: docData.title || (docData.name || docData.file?.name || '').replace(/\.[^/.]+$/, ''),
      folderId: docData.folderId || 'folder-personal',
      category: docData.category || 'Personal',
      fileType: docData.fileType || ((docData.name || '').endsWith('.png') ? 'png' : (docData.name || '').endsWith('.jpg') ? 'jpg' : 'pdf'),
      sizeBytes: sizeBytes,
      sizeFormatted: formatBytes(sizeBytes),
      uploadedAt: new Date().toISOString(),
      expiryDate: docData.expiryDate || null,
      status: docData.expiryDate ? getExpiryStatus(docData.expiryDate).status : 'valid',
      description: docData.description || 'Uploaded securely to vault.',
      tags: docData.tags || [docData.category || 'Personal', 'Secure'],
      isStarred: false,
      previewType: docData.previewType || 'contract',
      versions: [
        {
          version: 'v1.0',
          date: new Date().toISOString().split('T')[0],
          notes: 'Initial upload',
          size: formatBytes(sizeBytes)
        }
      ],
      activityLog: [
        {
          id: 'log-' + Date.now(),
          action: 'Uploaded Document',
          timestamp: new Date().toISOString(),
          user: 'Sumanth'
        }
      ]
    };

    try {
      if (docData.file) {
        const uploaded = await documentService.uploadDocument({
          file: docData.file,
          name: docData.name,
          category: docData.category,
          folderId: docData.folderId,
          description: docData.description,
          expiryDate: docData.expiryDate
        });
        if (uploaded) {
          setDocuments(prev => [uploaded, ...prev.filter(d => d.id !== optimisticDoc.id)]);
          recordActivity('upload', `Uploaded ${uploaded.name}`, `Added to ${uploaded.category} folder.`, 'Uploaded', uploaded.id);
          return uploaded;
        }
      }
    } catch (err) {
      console.warn('Backend upload failed, using local optimistic record:', err);
    }

    setDocuments(prev => [optimisticDoc, ...prev]);

    // Update folder item count and size
    setFolders(prev =>
      prev.map(f =>
        f.id === optimisticDoc.folderId
          ? {
              ...f,
              itemCount: f.itemCount + 1,
              sizeMB: parseFloat(((f.sizeMB || 0) + sizeBytes / (1024 * 1024)).toFixed(1)),
              updatedAt: new Date().toISOString()
            }
          : f
      )
    );

    recordActivity('upload', `Uploaded ${optimisticDoc.name}`, `Added to ${optimisticDoc.category} folder.`, 'Uploaded', optimisticDoc.id);

    return optimisticDoc;
  };

  const updateDocument = async (id, updatedFields) => {
    try {
      await documentService.updateDocument(id, updatedFields);
    } catch (err) {
      console.warn('API update doc error:', err);
    }

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          const updated = { ...doc, ...updatedFields };
          if (updatedFields.expiryDate !== undefined) {
            updated.status = getExpiryStatus(updatedFields.expiryDate).status;
          }
          return updated;
        }
        return doc;
      })
    );
  };

  const deleteDocument = async (id) => {
    const docToDelete = documents.find(d => d.id === id);
    if (!docToDelete) return;

    try {
      await documentService.deleteDocument(id);
    } catch (err) {
      console.warn('API delete doc error:', err);
    }

    setDocuments(prev => prev.filter(d => d.id !== id));

    // Update folder stats
    setFolders(prev =>
      prev.map(f =>
        f.id === docToDelete.folderId
          ? {
              ...f,
              itemCount: Math.max(0, f.itemCount - 1),
              sizeMB: Math.max(0, parseFloat(((f.sizeMB || 0) - (docToDelete.sizeBytes || 0) / (1024 * 1024)).toFixed(1)))
            }
          : f
      )
    );

    recordActivity('delete', `Deleted ${docToDelete.name}`, 'Document removed from vault.', 'Deleted');
  };

  const toggleStarDocument = async (id) => {
    const doc = documents.find(d => d.id === id);
    const newStarred = !doc?.isStarred;

    try {
      await documentService.updateDocument(id, { isStarred: newStarred });
    } catch (err) {
      console.warn('API star toggle error:', err);
    }

    setDocuments(prev =>
      prev.map(d =>
        d.id === id ? { ...d, isStarred: newStarred } : d
      )
    );
  };

  // Folder Operations
  const createFolder = async ({ name, color = 'blue', description = '' }) => {
    let newFolder = {
      id: 'folder-' + Date.now(),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      icon: 'Folder',
      color,
      description: description || `Documents categorized under ${name}`,
      itemCount: 0,
      sizeMB: 0,
      updatedAt: new Date().toISOString()
    };

    try {
      const created = await folderService.createFolder({ name, color, description });
      if (created) {
        newFolder = created;
      }
    } catch (err) {
      console.warn('API create folder error:', err);
    }

    setFolders(prev => [...prev, newFolder]);
    recordActivity('folder', `Created folder "${name}"`, 'New category created.', 'Folder');
    return newFolder;
  };

  const renameFolder = async (id, newName) => {
    try {
      await folderService.updateFolder(id, { name: newName });
    } catch (err) {
      console.warn('API rename folder error:', err);
    }

    setFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f))
    );
  };

  const deleteFolder = async (id) => {
    const folder = folders.find(f => f.id === id);
    if (!folder) return;

    try {
      await folderService.deleteFolder(id);
    } catch (err) {
      console.warn('API delete folder error:', err);
    }

    setFolders(prev => prev.filter(f => f.id !== id));
    // Unassign documents in this folder to Personal
    setDocuments(prev =>
      prev.map(doc => (doc.folderId === id ? { ...doc, folderId: null } : doc))
    );
    recordActivity('delete', `Deleted folder "${folder.name}"`, 'Documents unassigned.', 'Deleted');
  };

  // Share Operations
  const createSharedLink = async ({ documentId, sharedWith, recipientEmail, expiryOption, hasPassword, password, allowDownload, maxDownloads }) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return null;

    let expiresAt = null;
    const now = new Date();
    if (expiryOption === '1 hour') {
      expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    } else if (expiryOption === '24 hours') {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (expiryOption === '7 days') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expiryOption === '30 days') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    let newShare = {
      id: 'share-' + Date.now(),
      token: 'sv_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4),
      documentId,
      documentName: doc.name,
      sharedWith: sharedWith || 'External Recipient',
      recipientEmail: recipientEmail || '',
      createdAt: now.toISOString(),
      expiresAt,
      expiryOption: expiryOption || '24 hours',
      hasPassword: Boolean(hasPassword && password),
      password: password || '',
      allowDownload: allowDownload !== undefined ? allowDownload : true,
      accessCount: 0,
      status: 'active',
      views: []
    };

    try {
      const created = await shareService.createShare({
        documentId,
        sharedWith,
        recipientEmail,
        expiryOption,
        expiresAt,
        hasPassword: Boolean(hasPassword && password),
        password,
        allowDownload,
        maxDownloads
      });
      if (created) {
        newShare = created;
      }
    } catch (err) {
      console.warn('API create share error:', err);
    }

    setSharedDocuments(prev => [newShare, ...prev]);
    recordActivity('share', `Created secure link for ${doc.name}`, `Shared with ${newShare.sharedWith} (${newShare.expiryOption}).`, 'Shared', doc.id);

    return newShare;
  };

  const revokeSharedLink = async (shareId) => {
    try {
      await shareService.revokeShare(shareId);
    } catch (err) {
      console.warn('API revoke share error:', err);
    }

    setSharedDocuments(prev =>
      prev.map(s => (s.id === shareId ? { ...s, status: 'revoked' } : s))
    );
    recordActivity('security', 'Revoked document access link', 'Access terminated for external recipient.', 'Revoked');
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalDocs = documents.length;
    const totalFold = folders.length;
    const totalShared = sharedDocuments.filter(s => s.status === 'active').length;

    let expiringSoonCount = 0;
    let expiredCount = 0;
    let totalSizeBytes = 0;
    let pdfBytes = 0;
    let imageBytes = 0;
    let docBytes = 0;
    let otherBytes = 0;

    documents.forEach(doc => {
      totalSizeBytes += doc.sizeBytes || 0;
      const statusInfo = getExpiryStatus(doc.expiryDate);
      if (statusInfo.status === 'expiring') expiringSoonCount++;
      if (statusInfo.status === 'expired') expiredCount++;

      const type = (doc.fileType || '').toLowerCase();
      if (type === 'pdf') {
        pdfBytes += doc.sizeBytes || 0;
      } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(type)) {
        imageBytes += doc.sizeBytes || 0;
      } else if (['doc', 'docx', 'txt', 'rtf'].includes(type)) {
        docBytes += doc.sizeBytes || 0;
      } else {
        otherBytes += doc.sizeBytes || 0;
      }
    });

    const storageUsedMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
    const storageLimitMB = 1024; // 1 GB Quota
    const rawPercentage = (totalSizeBytes / (storageLimitMB * 1024 * 1024)) * 100;
    const storagePercentage = totalSizeBytes === 0
      ? 0
      : rawPercentage < 0.1
      ? parseFloat(rawPercentage.toFixed(2))
      : parseFloat(rawPercentage.toFixed(1));

    const storageBreakdown = [
      { name: 'PDF Documents', value: parseFloat((pdfBytes / (1024 * 1024)).toFixed(2)), color: '#2563eb' },
      { name: 'Scanned Images', value: parseFloat((imageBytes / (1024 * 1024)).toFixed(2)), color: '#059669' },
      { name: 'Certificates & Text', value: parseFloat((docBytes / (1024 * 1024)).toFixed(2)), color: '#6366f1' },
      { name: 'Other Archives', value: parseFloat((otherBytes / (1024 * 1024)).toFixed(2)), color: '#64748b' }
    ];

    const expiringSoonDocs = documents
      .filter(d => getExpiryStatus(d.expiryDate).status === 'expiring')
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return {
      totalDocs,
      totalFolders: totalFold,
      totalShared,
      expiringSoonCount,
      expiredCount,
      totalSizeBytes,
      storageUsedMB,
      storageLimitMB,
      storagePercentage,
      storageBreakdown,
      expiringSoonDocs
    };
  }, [documents, folders, sharedDocuments]);

  // Global Search function
  const searchAll = (query) => {
    if (!query || !query.trim()) return { documents: [], folders: [], shared: [] };
    const q = query.toLowerCase().trim();

    const matchedDocs = documents.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        (d.title && d.title.toLowerCase().includes(q)) ||
        d.category.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
    );

    const matchedFolders = folders.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );

    const matchedShared = sharedDocuments.filter(
      s =>
        (s.documentName && s.documentName.toLowerCase().includes(q)) ||
        (s.sharedWith && s.sharedWith.toLowerCase().includes(q)) ||
        (s.recipientEmail && s.recipientEmail.toLowerCase().includes(q))
    );

    return {
      documents: matchedDocs,
      folders: matchedFolders,
      shared: matchedShared
    };
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        folders,
        sharedDocuments,
        activities,
        metrics,
        isLoading,
        fetchAllData,
        addDocument,
        updateDocument,
        deleteDocument,
        toggleStarDocument,
        createFolder,
        renameFolder,
        deleteFolder,
        createSharedLink,
        revokeSharedLink,
        recordActivity,
        searchAll
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocuments must be used within DocumentProvider');
  return context;
};
