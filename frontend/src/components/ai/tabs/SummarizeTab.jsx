import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import SubTypeSelector from '../shared/SubTypeSelector';
import AITextarea from '../shared/AITextarea';
import AISubmitButton from '../shared/AISubmitButton';
import AIThinking from '../shared/AIThinking';
import AIError from '../shared/AIError';
import AIResult from '../shared/AIResult';
import AIMarkdown from '../shared/AIMarkdown';

const SummarizeTab = () => {
  const { tabState, updateTabState, runAI, loading, error, rateLimitCountdown, setTab } = useAI();
  const state = tabState.summarize;

  const placeholders = {
    meeting_notes: "Paste your meeting notes here...\n\nExample:\n- Attendees: Alex, Sam, Jordan\n- Discussed Q3 roadmap\n- Alex will lead the auth module",
    chat_thread: "Paste the chat conversation...\n\n[10:32] Alex: Should we use Redis for caching?\n[10:35] Sam: Yes, let's go with TTL of 10 min",
    document: "Paste the document text..."
  };

  const handleSubmit = () => {
    runAI('summarize', state);
  };

  const switchToConvertTab = (summaryText) => {
    updateTabState('convert', { content: summaryText });
    setTab('convert');
  };

  return (
    <div>
      <SubTypeSelector
        options={[
          { value: 'meeting_notes', label: '📋 Meeting notes' },
          { value: 'chat_thread', label: '💬 Chat thread' },
          { value: 'document', label: '📄 Document' }
        ]}
        value={state.subType}
        onChange={(val) => updateTabState('summarize', { subType: val })}
      />
      <AITextarea
        label="Content to summarize"
        placeholder={placeholders[state.subType]}
        value={state.inputs?.[state.subType] || ''}
        onChange={(val) => updateTabState('summarize', prev => ({ inputs: { ...(prev.inputs || {}), [state.subType]: val } }))}
        maxChars={10000}
        minHeight="180px"
      />
      <AISubmitButton
        label="Summarize"
        icon={Sparkles}
        loading={loading}
        disabled={!(state.inputs?.[state.subType] || '').trim()}
        onClick={handleSubmit}
      />
      
      {loading && <AIThinking />}
      <AIError error={error} onRetry={handleSubmit} countdown={rateLimitCountdown} />
      
      {state.result && !loading && (
        <AIResult
          title="Summary"
          copyText={state.result.summary}
          extras={
            <button 
              onClick={() => switchToConvertTab(state.result.summary)}
              style={{ display: 'flex', alignItems: 'center', height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '12px', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', transition: 'background 0.15s' }}
              className="hover:bg-accent-dim"
            >
              Convert to tasks →
            </button>
          }
        >
          <AIMarkdown text={state.result.summary} />
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '10px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>~{state.result.summary?.split(' ').length || 0} words</span>
            <span>·</span>
            <span>Generated successfully</span>
          </div>
        </AIResult>
      )}
    </div>
  );
};

export default SummarizeTab;
