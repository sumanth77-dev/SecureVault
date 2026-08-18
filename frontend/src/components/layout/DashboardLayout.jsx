import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer, MobileBottomBar } from './MobileNav';
import { UploadModal } from '../modals/UploadModal';
import { SearchModal } from '../modals/SearchModal';
import { ShareModal } from '../modals/ShareModal';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Topbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ onOpenUpload: () => setIsUploadOpen(true), onShare: (doc) => setShareDoc(doc) }} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomBar onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Global Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {shareDoc && (
        <ShareModal
          isOpen={Boolean(shareDoc)}
          onClose={() => setShareDoc(null)}
          document={shareDoc}
        />
      )}
    </div>
  );
};
