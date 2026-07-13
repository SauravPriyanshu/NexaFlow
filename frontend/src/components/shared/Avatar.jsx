import React from 'react';

const COLORS = ['#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899'];

const SIZES = {
  sm: { box: 24, font: 10 },
  md: { box: 32, font: 12 },
  lg: { box: 40, font: 14 },
  xl: { box: 48, font: 16 }
};

export const Avatar = ({ user, size = 'md' }) => {
  if (!user) return null;
  const s = SIZES[size] || SIZES.md;
  
  if (user.avatar) {
    return (
      <img 
        src={user.avatar} 
        alt={user.name || 'Avatar'} 
        style={{ width: s.box, height: s.box, borderRadius: '50%', objectFit: 'cover' }} 
      />
    );
  }
  
  const nameStr = user.name || '?';
  const nameParts = nameStr.split(' ').filter(Boolean);
  const initials = nameParts.length > 1 
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : nameParts[0][0].toUpperCase();
    
  const color = COLORS[nameStr.charCodeAt(0) % COLORS.length];

  return (
    <div style={{
      width: s.box, height: s.box, borderRadius: '50%',
      background: color, color: 'var(--bg-page)',
      fontSize: s.font, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 3, size = 'sm' }) => {
  if (!users) return null;
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  const s = SIZES[size] || SIZES.sm;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((u, i) => (
        <div key={u._id || i} style={{ marginLeft: i > 0 ? '-6px' : '0', border: '2px solid var(--bg-page)', borderRadius: '50%' }}>
          <Avatar user={u} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div style={{
          marginLeft: '-6px', border: '2px solid var(--bg-page)', borderRadius: '50%',
          width: s.box, height: s.box, background: 'var(--border-default)', color: 'var(--text-secondary)',
          fontSize: s.font, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
