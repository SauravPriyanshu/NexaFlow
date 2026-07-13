import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Archive, File, Download, Pencil, Trash2, Eye, CheckSquare, Square } from 'lucide-react';
import { formatFileSize } from '../../utils/formatFileSize';

const FileCard = ({ file, onDelete, onRename, isSelected, onToggleSelect, isSelectionMode }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isImage = file.resourceType === 'image' || file.mimeType?.startsWith('image/');
  
  const backendUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  const fullFileUrl = file.cloudinaryUrl?.startsWith('/') ? `${backendUrl}${file.cloudinaryUrl}` : file.cloudinaryUrl;

  const getFileIcon = (file) => {
    if (file.mimeType === 'application/pdf') return <FileText size={48} color="#ef4444" />;
    if (file.mimeType?.includes('word')) return <FileText size={48} color="#3b82f6" />;
    if (file.mimeType?.includes('excel') || file.mimeType?.includes('spreadsheet')) return <FileText size={48} color="#10b981" />;
    if (file.mimeType?.includes('zip') || file.mimeType?.includes('tar') || file.mimeType?.includes('archive')) return <Archive size={48} color="#f59e0b" />;
    return <File size={48} color="var(--text-muted)" />;
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(file._id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(file.name);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isSelectionMode) {
          e.preventDefault();
          onToggleSelect?.(file._id);
        }
      }}
      className="group cursor-pointer hover:border-accent hover:-translate-y-[2px] shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        background: isSelected ? 'var(--bg-sidebar)' : 'var(--bg-card)',
        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected ? '0 4px 12px rgba(6,182,212,0.1)' : 'none'
      }}
    >
      
      {/* SELECTION CHECKBOX */}
      {isSelectionMode && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect?.(file._id); }}
          style={{
            position: 'absolute', top: '8px', left: '8px', zIndex: 20,
            padding: '4px', borderRadius: '4px',
            background: isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.4)',
            color: '#fff', cursor: 'pointer', border: 'none', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
        </button>
      )}

      {/* THUMBNAIL AREA */}
      <div style={{
        height: '140px',
        background: '#0a0d14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isImage ? (
          <img 
            src={fullFileUrl.replace('/upload/', '/upload/w_400,h_300,c_fill/')} 
            alt={file.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          getFileIcon(file)
        )}

        {/* HOVER OVERLAY */}
        {!isSelectionMode && (
          <div 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 17, 23, 0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}
          >
          {isConfirmingDelete ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>Delete file?</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onDelete(file._id)} style={{ padding: '4px 12px', background: 'var(--error)', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                <button onClick={() => setIsConfirmingDelete(false)} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>No</button>
              </div>
            </div>
          ) : (
            <>
              <a 
                href={fullFileUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:bg-white/20 transition-colors hover:scale-110"
                title="View"
              >
                <Eye size={16} />
              </a>
              <a 
                href={fullFileUrl} target="_blank" rel="noopener noreferrer" download
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6,182,212,0.3)'
                }}
                className="hover:scale-110 transition-transform"
                title="Download"
              >
                <Download size={16} />
              </a>
              <button 
                onClick={() => setIsRenaming(true)} 
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:bg-white/20 transition-colors"
                title="Rename"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => setIsConfirmingDelete(true)} 
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:bg-error hover:text-white transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
        )}
      </div>

      {/* DETAILS AREA */}
      <div style={{ padding: '12px 16px' }}>
        {isRenaming ? (
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
              background: 'var(--bg-input)', border: '1px solid var(--accent)', borderRadius: '4px',
              padding: '2px 6px', outline: 'none', marginBottom: '4px'
            }}
          />
        ) : (
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }} className="truncate" title={file.name}>
            {file.name}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span className="truncate pr-2">{file.uploadedBy?.name || 'Unknown'}</span>
          <span style={{ flexShrink: 0 }}>{formatFileSize(file.size)}</span>
        </div>
      </div>

    </div>
  );
};

export default React.memo(FileCard);
