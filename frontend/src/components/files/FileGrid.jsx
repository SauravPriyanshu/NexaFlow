import React from 'react';
import FileCard from './FileCard';

const FileGrid = ({ files, onDelete, onRename, selectedFiles = new Set(), onToggleSelect, isSelectionMode }) => {
  if (!files || files.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '64px 0', border: '1px dashed var(--border-default)', borderRadius: '12px',
        background: 'var(--bg-card)'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>📂</span>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>No files found</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Upload some files to get started.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '24px'
    }}>
      {files.map(file => (
        <FileCard 
          key={file._id} 
          file={file} 
          onDelete={onDelete}
          onRename={onRename}
          isSelected={selectedFiles.has(file._id)}
          onToggleSelect={onToggleSelect}
          isSelectionMode={isSelectionMode}
        />
      ))}
    </div>
  );
};

export default FileGrid;
