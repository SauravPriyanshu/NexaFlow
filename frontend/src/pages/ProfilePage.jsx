import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import userService from '../services/userService';
import { Camera, Save, Moon, Sun, Monitor } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const toast = useToast();
  usePageTitle('Profile Settings');
  
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Image size should be less than 1MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      const updates = { name, theme };
      if (avatarBase64) {
        updates.avatar = avatarBase64;
      }
      
      const res = await userService.updateProfile(updates);
      // The backend returns the updated user, we need to update our AuthContext
      // Actually we can just wait for the reload or update the auth context if there's a function for it
      // Let's assume login(token, user) can just update user if we pass the same token, or we just reload
      // But typically AuthContext might not expose a generic `setUser`. Let's just reload the page or show success.
      toast.success('Profile updated successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '32px' }}>
        Profile Settings
      </h1>
      
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
          Personal Information
        </h2>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-input)',
                border: '2px dashed var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative', cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
              className="group hover:border-accent transition-colors"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '32px', color: 'var(--text-muted)' }}>{name?.charAt(0)?.toUpperCase()}</span>
              )}
              
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s ease'
              }} className="group-hover:opacity-100">
                <Camera size={24} color="#fff" />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleImageChange}
            />
            
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to upload</span>
          </div>
          
          {/* Form Fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Full Name
              </label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%', height: '40px', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                  borderRadius: '6px', padding: '0 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                }}
                className="focus:border-accent transition-colors"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Email Address
              </label>
              <input 
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%', height: '40px', background: 'var(--bg-page)', border: '1px solid var(--border-default)',
                  borderRadius: '6px', padding: '0 12px', color: 'var(--text-muted)', fontSize: '14px', cursor: 'not-allowed'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Theme Preferences */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Appearance
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Customize how NexaFlow looks on your device.
        </p>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setTheme('light')}
            style={{
              flex: 1, padding: '16px', borderRadius: '8px', border: `2px solid ${theme === 'light' ? 'var(--accent)' : 'var(--border-default)'}`,
              background: 'var(--bg-input)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              color: theme === 'light' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
            className="hover:border-accent transition-colors"
          >
            <Sun size={24} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Light Mode</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            style={{
              flex: 1, padding: '16px', borderRadius: '8px', border: `2px solid ${theme === 'dark' ? 'var(--accent)' : 'var(--border-default)'}`,
              background: 'var(--bg-input)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              color: theme === 'dark' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
            className="hover:border-accent transition-colors"
          >
            <Moon size={24} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Dark Mode</span>
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            height: '40px', padding: '0 24px', borderRadius: '6px', background: 'var(--accent)', color: '#fff',
            fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1
          }}
          className="hover:bg-accent-hover transition-colors"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
    </div>
  );
};

export default ProfilePage;
