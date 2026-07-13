import React, { useState } from 'react';
import { Pencil, CheckCircle, Copy } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import SubTypeSelector from '../shared/SubTypeSelector';
import AITextarea from '../shared/AITextarea';
import AISubmitButton from '../shared/AISubmitButton';
import AIThinking from '../shared/AIThinking';
import AIError from '../shared/AIError';
import AIMarkdown from '../shared/AIMarkdown';

const ImproveTab = () => {
  const { tabState, updateTabState, runAI, loading, error, rateLimitCountdown, clearResult } = useAI();
  const state = tabState.improve;
  const [copied, setCopied] = useState(false);

  const placeholders = {
    email: "Hi, I wanted to follow up on our previous discussion...",
    documentation: "This function takes a user object and...",
    task_description: "Fix the bug in auth",
    general: "Paste any text to improve..."
  };

  const handleSubmit = () => {
    runAI('improve', { ...state, text: state.inputs?.[state.subType] || '' });
  };

  const handleCopy = () => {
    if (!state.result?.improved) return;
    navigator.clipboard.writeText(state.result.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div>
      <SubTypeSelector
        options={[
          { value: 'email', label: '📧 Email' },
          { value: 'documentation', label: '📖 Documentation' },
          { value: 'task_description', label: '✅ Task description' },
          { value: 'general', label: '✏️ General text' }
        ]}
        value={state.subType}
        onChange={(val) => updateTabState('improve', { subType: val })}
      />

      <AITextarea
        label="Original text"
        placeholder={placeholders[state.subType]}
        value={state.inputs?.[state.subType] || ''}
        onChange={(val) => updateTabState('improve', prev => ({ inputs: { ...(prev.inputs || {}), [state.subType]: val } }))}
        maxChars={4000}
        minHeight="140px"
      />

      <AISubmitButton
        label="Improve writing"
        icon={Pencil}
        loading={loading}
        disabled={!(state.inputs?.[state.subType] || '').trim()}
        onClick={handleSubmit}
      />
      
      {loading && <AIThinking />}
      <AIError error={error} onRetry={handleSubmit} countdown={rateLimitCountdown} />
      
      {state.result && !loading && (
        <div style={{ marginTop: '20px', animation: 'result-in 300ms ease-out forwards' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            
            {/* Original Card */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</div>
              </div>
              <div style={{ padding: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: '240px', overflowY: 'auto', flex: 1 }}>
                <AIMarkdown text={state.inputs?.[state.subType] || ''} />
              </div>
            </div>

            {/* Improved Card */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-default)', background: 'rgba(6,182,212,0.04)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--accent)" />
                <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Improved</div>
              </div>
              <div style={{ padding: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: '240px', overflowY: 'auto', flex: 1 }}>
                <AIMarkdown text={state.result.improved} />
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-default)' }}>
                <button
                  onClick={handleCopy}
                  style={{ width: '100%', height: '32px', borderRadius: '6px', fontSize: '12px', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  className="hover:bg-white/10"
                >
                  <Copy size={14} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ImproveTab;
