import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CloudUpload, ArrowLeft, Trash2, X } from 'lucide-react';
import UploadZone from '../components/files/UploadZone';
import FileGrid from '../components/files/FileGrid';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import fileService from '../services/fileService';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';
import projectService from '../services/projectService';
import { usePageTitle } from '../hooks/usePageTitle';

const FilesPageContent = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const toast = useToast();
  const { selectProject, currentProject } = useProject();
  usePageTitle(currentProject ? `Files - ${currentProject.name}` : 'Files');
  
  const uploadZoneRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const projRes = await projectService.getProjectById(projectId);
        selectProject(projRes.data);
      } catch (err) {
        console.error('Failed to load project', err);
      }
    };
    if (projectId) init();
  }, [projectId, selectProject]);

  const fetchFiles = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const res = await fileService.getFilesByProject(projectId, { page: pageNum, limit: 20 });
      const newFiles = res.data.data.files || [];
      const pagination = res.data.data.pagination;
      
      if (pageNum === 1) {
        setFiles(newFiles);
      } else {
        setFiles(prev => [...prev, ...newFiles]);
      }
      
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFiles(1);
    }
  }, [projectId]);

  const handleUploadComplete = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
    toast.success('File uploaded successfully');
  };

  const handleDelete = async (id) => {
    try {
      await fileService.deleteFile(id);
      setFiles(prev => prev.filter(f => f._id !== id));
      setSelectedFiles(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('File deleted');
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedFiles.size === 0) return;
    setIsBulkDeleteModalOpen(false);
    setIsDeletingBulk(true);
    try {
      await Promise.all(Array.from(selectedFiles).map(id => fileService.deleteFile(id)));
      setFiles(prev => prev.filter(f => !selectedFiles.has(f._id)));
      setSelectedFiles(new Set());
      setIsSelectionMode(false);
      toast.success(`${selectedFiles.size} files deleted`);
    } catch (err) {
      toast.error('Failed to delete some files');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleRename = async (id, newName) => {
    try {
      const res = await fileService.renameFile(id, newName);
      setFiles(prev => prev.map(f => f._id === id ? res.data.data.file : f));
      toast.success('File renamed');
    } catch (err) {
      toast.error('Failed to rename file');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-page)' }}>
      {/* HEADER */}
      <div style={{
        height: '64px', padding: '0 32px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => currentProject?.orgId && navigate(`/orgs/${typeof currentProject.orgId === 'object' ? currentProject.orgId._id : currentProject.orgId}/projects`)}
            aria-label="Go back"
            style={{
              width: '32px', height: '32px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', background: 'transparent',
              border: '1px solid var(--border-default)'
            }}
            className="hover:bg-hover hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>Files</h1>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{files.length} items</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isSelectionMode ? (
            <>
              <button 
                onClick={() => { setIsSelectionMode(false); setSelectedFiles(new Set()); }}
                style={{
                  height: '36px', padding: '0 12px', borderRadius: '6px',
                  background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  border: '1px solid var(--border-default)'
                }}
                className="hover:bg-hover hover:text-text-primary transition-colors"
              >
                <X size={16} /> Cancel
              </button>
              {selectedFiles.size > 0 && (
                <button 
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  disabled={isDeletingBulk}
                  style={{
                    height: '36px', padding: '0 16px', borderRadius: '6px',
                    background: 'var(--error)', color: '#fff', fontSize: '14px', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: isDeletingBulk ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)', opacity: isDeletingBulk ? 0.7 : 1
                  }}
                  className="hover:opacity-90"
                >
                  <Trash2 size={16} />
                  {isDeletingBulk ? 'Deleting...' : `Delete Selected (${selectedFiles.size})`}
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={() => setIsSelectionMode(true)}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '6px',
                background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                border: '1px solid var(--border-default)'
              }}
              className="hover:bg-hover hover:text-text-primary transition-colors"
            >
              Select
            </button>
          )}
          
          <button 
            onClick={() => {
              const fileInput = document.querySelector('input[type="file"]');
              if (fileInput) fileInput.click();
            }}
            style={{
              height: '36px', padding: '0 16px', borderRadius: '6px',
              background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              transition: 'all var(--transition-fast)', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)'
            }}
            className="hover:bg-accent-hover"
          >
            <CloudUpload size={18} />
            Upload Files
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }} className="custom-scrollbar hardware-scroll">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div ref={uploadZoneRef}>
            <UploadZone 
              projectId={projectId} 
              onUploadComplete={handleUploadComplete} 
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                All Files
              </h2>
            </div>
            
            {loading && page === 1 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-default)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <FileGrid 
                files={files} 
                onDelete={handleDelete}
                onRename={handleRename}
                selectedFiles={selectedFiles}
                onToggleSelect={handleToggleSelect}
                isSelectionMode={isSelectionMode}
              />
            )}

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <button 
                  onClick={() => fetchFiles(page + 1)}
                  disabled={loading}
                  style={{
                    padding: '8px 24px', borderRadius: '6px',
                    background: 'var(--bg-card)', color: 'var(--text-secondary)',
                    fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)', border: '1px solid var(--border-default)'
                  }}
                  className="hover:bg-hover"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Selected Files"
        message={`Are you sure you want to delete ${selectedFiles.size} selected file${selectedFiles.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default function FilesPage() {
  return <FilesPageContent />;
}
