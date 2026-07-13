export function highlightMatch(text, query) {
  if (!query || !text) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{
              background: 'rgba(6,182,212,0.2)',
              color: '#06b6d4',
              borderRadius: '2px',
              padding: '0 1px'
            }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}
