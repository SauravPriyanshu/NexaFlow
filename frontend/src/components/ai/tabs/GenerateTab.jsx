import React from 'react';
import { FileText, FileCode } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import SubTypeSelector from '../shared/SubTypeSelector';
import AITextarea from '../shared/AITextarea';
import AISubmitButton from '../shared/AISubmitButton';
import AIThinking from '../shared/AIThinking';
import AIError from '../shared/AIError';
import AIResult from '../shared/AIResult';
import AIMarkdown from '../shared/AIMarkdown';
import TagInput from '../TagInput';

const GenerateTab = () => {
  const { tabState, updateTabState, runAI, loading, error, rateLimitCountdown } = useAI();
  const state = tabState.generate;

  const handleSubmit = () => {
    runAI('generate', state);
  };

  const downloadMd = (result, name) => {
    const content = result.documentation || result.readme;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'project').replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div>
      <SubTypeSelector
        options={[
          { value: 'docs', label: '📚 Project docs' },
          { value: 'readme', label: '📝 README.md' }
        ]}
        value={state.subType}
        onChange={(val) => updateTabState('generate', { subType: val })}
      />

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px' }}>Project name</div>
        <input 
          type="text"
          value={state.projectName}
          onChange={(e) => updateTabState('generate', { projectName: e.target.value })}
          placeholder="e.g. NexaFlow — AI-Powered Workspace"
          style={{ width: '100%', height: '40px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
          className="focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px' }}>Description</div>
        <input 
          type="text"
          value={state.description}
          onChange={(e) => updateTabState('generate', { description: e.target.value })}
          placeholder="Brief description of what this project does"
          style={{ width: '100%', height: '40px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
          className="focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all"
        />
      </div>

      <TagInput 
        label="Key features" 
        placeholder="Type feature, press Enter"
        tags={state.features}
        onChange={(tags) => updateTabState('generate', { features: tags })}
      />

      <TagInput 
        label="Tech stack" 
        placeholder="e.g. Node.js, React, MongoDB"
        tags={state.techStack}
        onChange={(tags) => updateTabState('generate', { techStack: tags })}
      />

      {state.subType === 'readme' && (
        <AITextarea
          label="Setup instructions (optional)"
          placeholder="npm install&#10;npm run dev"
          value={state.setupSteps}
          onChange={(val) => updateTabState('generate', { setupSteps: val })}
          minHeight="80px"
        />
      )}

      <AISubmitButton
        label={state.subType === 'readme' ? 'Generate README' : 'Generate documentation'}
        icon={state.subType === 'readme' ? FileCode : FileText}
        loading={loading}
        disabled={!state.projectName || (!state.description && state.features.length === 0)}
        onClick={handleSubmit}
      />
      
      {loading && <AIThinking />}
      <AIError error={error} onRetry={handleSubmit} countdown={rateLimitCountdown} />
      
      {state.result && !loading && (
        <AIResult
          title={state.subType === 'readme' ? 'README.md' : 'Project Documentation'}
          copyText={state.result.documentation || state.result.readme}
          extras={
            <button 
              onClick={() => downloadMd(state.result, state.projectName)}
              style={{ display: 'flex', alignItems: 'center', height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '12px', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'background 0.15s' }}
              className="hover:bg-white/10"
            >
              Download .md
            </button>
          }
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 14px' }}>
            <AIMarkdown text={state.result.documentation || state.result.readme} />
          </div>
        </AIResult>
      )}
    </div>
  );
};

export default GenerateTab;
