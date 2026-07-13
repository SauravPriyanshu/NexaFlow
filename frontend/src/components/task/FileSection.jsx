import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Download, Trash2, File as FileIcon, Image as ImageIcon, FileText, Archive } from 'lucide-react';
import fileService from '../../services/fileService';
import { useToast } from '../../context/ToastContext';
import { formatFileSize } from '../../utils/formatFileSize';

const FileSection = ({ taskId, projectId }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fileService.getFilesByTask(taskId);
        setFiles(res.data.data.files || []);
      } catch (err) {
        console.error('Failed to load attachments', err);
      }
    };
    if (taskId) fetchFiles();
  }, [taskId]);

  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // For simplicity in UI, handle first file upload progress, but loop for multiple
    const file = selectedFiles[0];
    
    setIsUploading(true);
    setUploadProgress({ name: file.name, progress: 0 });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    try {
      const res = await fileService.uploadFile(projectId, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, progress: percentCompleted }));
      });
      
      setFiles(prev => [res.data.data.file, ...prev]);
      toast.success('File attached');
    } catch (err) {
      toast.error('Failed to attach file');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await fileService.deleteFile(id);
      setFiles(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      toast.error('Failed to delete attachment');
    }
  };

  const getFileIcon = (file) => {
    if (file.resourceType === 'image' || file.mimeType?.startsWith('image/')) {
      const thumbUrl = file.cloudinaryUrl.replace('/upload/', '/upload/w_200,h_200,c_fill/');
      return <img src={thumbUrl} alt={file.name} className="w-8 h-8 object-cover rounded" />;
    }
    if (file.mimeType === 'application/pdf') return <FileText size={24} className="text-red-500" />;
    if (file.mimeType?.includes('zip')) return <Archive size={24} className="text-yellow-500" />;
    return <FileIcon size={24} className="text-slate-500" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-medium text-text-muted flex items-center gap-2 uppercase tracking-wide">
          Attachments {files.length > 0 && <span className="text-text-sub text-xs bg-surface px-2 rounded-full lowercase tracking-normal">{files.length}</span>}
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            height: '24px', padding: '0 10px', fontSize: '12px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px',
            color: '#fff', background: 'var(--accent)', border: 'none', cursor: 'pointer'
          }}
          className="hover:bg-accent-hover transition-colors"
        >
          <Paperclip size={14} /> Attach file
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      {isUploading && uploadProgress && (
        <div className="bg-surface p-2 rounded-lg border border-border-custom mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-main truncate mr-2">{uploadProgress.name}</span>
            <span className="text-text-sub">{uploadProgress.progress}%</span>
          </div>
          <div className="w-full h-1 bg-[var(--border-default)] rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress.progress}%` }} />
          </div>
        </div>
      )}

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file._id} className="group flex items-center justify-between bg-surface p-2 rounded-lg border border-border-custom hover:border-[var(--border-default)] transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 shrink-0 bg-[var(--bg-sidebar)] rounded flex items-center justify-center">
                  {getFileIcon(file)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-text-main truncate" title={file.name}>{file.name}</p>
                  <p className="text-[11px] text-text-hint">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <a 
                  href={file.cloudinaryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download 
                  className="p-1.5 text-text-sub hover:text-accent rounded bg-[var(--bg-sidebar)]"
                >
                  <Download size={14} />
                </a>
                <button 
                  onClick={() => handleDelete(file._id)}
                  className="p-1.5 text-text-sub hover:text-error rounded bg-[var(--bg-sidebar)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isUploading && <p className="text-sm text-text-hint">No attachments yet.</p>
      )}
    </div>
  );
};

export default FileSection;
