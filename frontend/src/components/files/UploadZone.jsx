import React, { useRef, useState, useEffect } from 'react';
import { CloudUpload, X, File as FileIcon, Check, Play, FileText, Archive, Image as ImageIcon } from 'lucide-react';
import fileService from '../../services/fileService';

const isImageFile = (file) => {
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file.name);
};

const getFileIcon = (file, size = 24) => {
  const mimeType = file.type || '';
  const name = file.name || '';
  
  if (isImageFile(file)) return <ImageIcon size={size} color="#8b5cf6" />;
  if (mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return <FileText size={size} color="#ef4444" />;
  if (mimeType.includes('word') || /\.(doc|docx)$/i.test(name)) return <FileText size={size} color="#3b82f6" />;
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || /\.(xls|xlsx|csv)$/i.test(name)) return <FileText size={size} color="#10b981" />;
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('archive') || /\.(zip|rar|7z|tar|gz)$/i.test(name)) return <Archive size={size} color="#f59e0b" />;
  
  return <FileIcon size={size} color="var(--accent)" />;
};

const PendingFileItem = ({ item, onNameChange, onRemove }) => {
  const isImage = isImageFile(item.file);
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px', background: 'var(--bg-card)', borderRadius: '8px',
      marginBottom: '8px', border: '1px solid var(--border-default)'
    }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isImage && item.objectUrl ? (
          <img src={item.objectUrl} alt={item.customName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          getFileIcon(item.file, 24)
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <input 
          type="text" 
          value={item.customName} 
          onChange={(e) => onNameChange(item.id, e.target.value)}
          style={{
            width: '100%', padding: '6px 12px', fontSize: '13px',
            background: 'var(--bg-input)', border: '1px solid var(--border-default)',
            color: 'var(--text-primary)', borderRadius: '6px', outline: 'none'
          }}
          className="focus:border-accent transition-colors"
          placeholder="File name"
        />
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {(item.file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
      <button 
        onClick={() => onRemove(item.id)}
        style={{
          padding: '8px', borderRadius: '6px', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        className="hover:bg-error hover:text-white transition-colors"
        title="Remove"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const UploadProgressItem = ({ uploadData, progress, onCancel }) => {
  const isImage = isImageFile(uploadData.file);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: 'var(--bg-card)', borderRadius: '8px',
      marginBottom: '8px', border: '1px solid var(--border-default)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isImage && uploadData.objectUrl ? (
            <img src={uploadData.objectUrl} alt={uploadData.customName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getFileIcon(uploadData.file, 16)
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }} className="truncate pr-4">{uploadData.customName}</span>
            <span style={{ color: 'var(--text-muted)' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
            <div 
              style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.3s ease' }}
            />
          </div>
        </div>
      </div>
      {progress < 100 && (
        <button 
          onClick={onCancel}
          style={{
            padding: '6px', marginLeft: '12px', borderRadius: '6px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          className="hover:bg-hover hover:text-error transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

const UploadZone = ({ projectId, taskId = null, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploads, setUploads] = useState({});
  const fileInputRef = useRef(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      pendingFiles.forEach(p => {
        if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
      });
      Object.values(uploads).forEach(u => {
        if (u.objectUrl) URL.revokeObjectURL(u.objectUrl);
      });
    };
  }, []); // Only run once to ensure we don't accidentally revoke while still showing

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    
    const newPending = Array.from(files).map(file => {
      const isImage = isImageFile(file);
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        customName: file.name,
        objectUrl: isImage ? URL.createObjectURL(file) : null
      };
    });
    
    setPendingFiles(prev => [...prev, ...newPending]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = null; // reset input
  };

  const handleNameChange = (id, newName) => {
    setPendingFiles(prev => prev.map(p => p.id === id ? { ...p, customName: newName } : p));
  };

  const handleRemovePending = (id) => {
    setPendingFiles(prev => {
      const file = prev.find(p => p.id === id);
      if (file && file.objectUrl) URL.revokeObjectURL(file.objectUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const cancelAllPending = () => {
    pendingFiles.forEach(p => {
      if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
    });
    setPendingFiles([]);
  };

  const startUpload = () => {
    pendingFiles.forEach(item => {
      const uploadId = item.id;
      setUploads(prev => ({ 
        ...prev, 
        [uploadId]: { 
          file: item.file, 
          customName: item.customName, 
          objectUrl: item.objectUrl,
          progress: 0 
        } 
      }));
      
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('customName', item.customName);
      if (taskId) {
        formData.append('taskId', taskId);
      }

      const uploadCall = fileService.uploadFile(projectId, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploads(prev => ({
          ...prev,
          [uploadId]: { ...prev[uploadId], progress: percentCompleted }
        }));
      });

      uploadCall.then((res) => {
        setUploads(prev => {
          const next = { ...prev };
          if (next[uploadId] && next[uploadId].objectUrl) {
            URL.revokeObjectURL(next[uploadId].objectUrl);
          }
          delete next[uploadId];
          return next;
        });
        if (onUploadComplete) onUploadComplete(res.data.data.file);
      }).catch(err => {
        console.error('Upload failed', err);
        setUploads(prev => {
          const next = { ...prev };
          if (next[uploadId] && next[uploadId].objectUrl) {
            URL.revokeObjectURL(next[uploadId].objectUrl);
          }
          delete next[uploadId];
          return next;
        });
      });
    });
    
    // Clear pending
    setPendingFiles([]);
  };

  const activeUploads = Object.entries(uploads);

  return (
    <div style={{ width: '100%' }}>
      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%', height: '140px', borderRadius: '12px',
          border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border-default)'}`,
          background: isDragging ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-card)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all var(--transition-fast)',
          gap: '12px'
        }}
        className="hover:border-text-muted"
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: isDragging ? 'var(--accent)' : 'var(--border-default)',
          color: isDragging ? '#fff' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--transition-fast)'
        }}>
          <CloudUpload size={24} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>
            Click to select or drag & drop files
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Images, Documents, PDFs (max. 25MB)
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple 
        />
      </div>

      {/* Pending Files (Confirmation Step) */}
      {pendingFiles.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Review Selected Files ({pendingFiles.length})</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={cancelAllPending}
                style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border-default)', color: 'var(--text-primary)', background: 'transparent' }}
                className="hover:bg-hover transition-colors"
              >
                Cancel All
              </button>
              <button 
                onClick={startUpload}
                style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '4px', border: '1px solid transparent', color: '#fff', background: 'var(--accent)' }}
                className="hover:bg-accent-hover transition-colors flex items-center gap-1"
              >
                <Play size={12} /> Upload
              </button>
            </div>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {pendingFiles.map(item => (
              <PendingFileItem 
                key={item.id} 
                item={item} 
                onNameChange={handleNameChange}
                onRemove={handleRemovePending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Uploads */}
      {activeUploads.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Uploading ({activeUploads.length})
          </h3>
          {activeUploads.map(([id, upload]) => (
            <UploadProgressItem 
              key={id} 
              uploadData={upload} 
              progress={upload.progress}
              onCancel={() => {
                setUploads(prev => {
                  const next = { ...prev };
                  if (next[id] && next[id].objectUrl) {
                    URL.revokeObjectURL(next[id].objectUrl);
                  }
                  delete next[id];
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
