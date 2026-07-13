import React from 'react';
import { Code2 } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import AITextarea from '../shared/AITextarea';
import AISubmitButton from '../shared/AISubmitButton';
import AIThinking from '../shared/AIThinking';
import AIError from '../shared/AIError';
import AIResult from '../shared/AIResult';
import AIMarkdown from '../shared/AIMarkdown';

const ExplainTab = () => {
  const { tabState, updateTabState, runAI, loading, error, rateLimitCountdown, clearResult } = useAI();
  const state = tabState.explain;

  const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'SQL', 'Other'];

  const handleSubmit = () => {
    runAI('explain', { ...state, code: state.codeInputs[state.language] || '' });
  };

  const placeholders = {
    JavaScript: `// Paste your code here\nconst cache = await redis.get(key);\nif (cache) return JSON.parse(cache);`,
    TypeScript: `// Paste your code here\ninterface User { id: string; }\nfunction getUser(id: string): User { ... }`,
    Python: `# Paste your code here\ndef process_data(df):\n    return df.groupby('id').sum()`,
    Java: `// Paste your code here\npublic class Main {\n    public static void main(String[] args) { ... }\n}`,
    Go: `// Paste your code here\nfunc processMessage(msg chan string) {\n    fmt.Println(<-msg)\n}`,
    Rust: `// Paste your code here\nfn main() {\n    let mut vec = Vec::new();\n    vec.push(1);\n}`,
    SQL: `-- Paste your code here\nSELECT users.name, COUNT(orders.id)\nFROM users LEFT JOIN orders ON ...\nGROUP BY users.id;`,
    Other: `// Paste your code here\n`
  };



  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px' }}>Language</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {languages.map(lang => {
            const isActive = state.language === lang;
            return (
              <button
                key={lang}
                onClick={() => updateTabState('explain', { language: lang })}
                style={{
                  height: '28px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border-default)'}`,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
                }}
                className={!isActive ? "hover:bg-white/5 hover:text-text-secondary" : ""}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <AITextarea
        label="Code snippet"
        placeholder={placeholders[state.language] || placeholders.Other}
        value={state.codeInputs[state.language] || ''}
        onChange={(val) => updateTabState('explain', { codeInputs: { ...state.codeInputs, [state.language]: val } })}
        monospace={true}
        minHeight="200px"
      />
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px' }}>Specific question (optional)</div>
        <input 
          type="text"
          value={state.question}
          onChange={(e) => updateTabState('explain', { question: e.target.value })}
          placeholder="e.g. Why is this function async? What does $lookup do?"
          style={{ width: '100%', height: '40px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
          className="focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all"
        />
      </div>

      <AISubmitButton
        label="Explain code"
        icon={Code2}
        loading={loading}
        disabled={!(state.codeInputs[state.language] || '').trim()}
        onClick={handleSubmit}
      />
      
      {loading && <AIThinking />}
      <AIError error={error} onRetry={handleSubmit} countdown={rateLimitCountdown} />
      
      {state.result && !loading && (
        <AIResult
          title="Explanation"
          copyText={state.result.explanation}
          extras={
            <button 
              onClick={() => clearResult('explain')}
              style={{ display: 'flex', alignItems: 'center', height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '12px', background: 'transparent', color: '#ef4444', cursor: 'pointer', transition: 'background 0.15s' }}
              className="hover:bg-red-500/10"
            >
              Clear
            </button>
          }
        >
          <AIMarkdown text={state.result.explanation} />
        </AIResult>
      )}
    </div>
  );
};

export default ExplainTab;
