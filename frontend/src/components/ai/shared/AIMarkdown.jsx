import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIMarkdown = ({ text }) => {
  if (!text) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '20px', marginBottom: '10px' }} {...props} />,
        h2: ({node, ...props}) => <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '18px', marginBottom: '10px' }} {...props} />,
        h3: ({node, ...props}) => <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '16px', marginBottom: '8px' }} {...props} />,
        h4: ({node, ...props}) => <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '14px', marginBottom: '8px' }} {...props} />,
        p: ({node, ...props}) => <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }} {...props} />,
        ul: ({node, ...props}) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
        ol: ({node, ...props}) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
        li: ({node, ...props}) => <li style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '4px' }} {...props} />,
        strong: ({node, ...props}) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }} {...props} />,
        em: ({node, ...props}) => <em style={{ fontStyle: 'italic', color: 'var(--text-primary)' }} {...props} />,
        blockquote: ({node, ...props}) => (
          <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px', margin: '8px 0', color: '#64748b', fontStyle: 'italic' }} {...props} />
        ),
        a: ({node, ...props}) => <a style={{ color: 'var(--accent)', textDecoration: 'none' }} {...props} />,
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline ? (
            <div style={{ background: '#0a0d16', padding: '12px', borderRadius: '6px', margin: '12px 0', border: '1px solid var(--border-default)', overflowX: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', fontFamily: 'monospace', lineHeight: 1.5 }}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code style={{ background: 'var(--bg-sidebar)', color: 'var(--accent)', borderRadius: '4px', padding: '2px 6px', fontFamily: 'monospace', fontSize: '12px' }} {...props}>
              {children}
            </code>
          )
        },
        table: ({node, ...props}) => (
          <div style={{ overflowX: 'auto', margin: '12px 0', border: '1px solid var(--border-default)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }} {...props} />
          </div>
        ),
        th: ({node, ...props}) => <th style={{ padding: '10px 12px', textAlign: 'left', background: 'rgba(6,182,212,0.05)', color: 'var(--text-primary)', fontWeight: 500, borderBottom: '1px solid var(--border-default)' }} {...props} />,
        td: ({node, ...props}) => <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)' }} {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default AIMarkdown;
