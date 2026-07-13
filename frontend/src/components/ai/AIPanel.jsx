import React, { useEffect, useState } from 'react';
import { Wand2, X, Sparkles, FileText, Code2, Pencil, ListTodo } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import SummarizeTab from './tabs/SummarizeTab';
import GenerateTab from './tabs/GenerateTab';
import ExplainTab from './tabs/ExplainTab';
import ImproveTab from './tabs/ImproveTab';
import ConvertTab from './tabs/ConvertTab';

const AIPanel = () => {
  const { isOpen, closeAI, activeTab, setTab, contextualSuggestion, dispatchContextualSuggestion } = useAI();
  const [render, setRender] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      // Small delay to allow render before starting animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlideIn(true));
      });
    } else {
      setSlideIn(false);
      // Wait for exit animation
      const timer = setTimeout(() => setRender(false), 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!render) return null;

  const tabs = [
    { id: 'summarize', label: 'Summarize', icon: Sparkles },
    { id: 'generate', label: 'Generate', icon: FileText },
    { id: 'explain', label: 'Explain', icon: Code2 },
    { id: 'improve', label: 'Improve', icon: Pencil },
    { id: 'convert', label: 'Convert', icon: ListTodo }
  ];

  const handleClose = () => {
    setSlideIn(false);
    setTimeout(() => {
      closeAI();
    }, 220); // wait for animation
  };

  return (
    <>
      {/* OVERLAY */}
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
          opacity: slideIn ? 1 : 0, transition: 'opacity 220ms ease-in'
        }}
        onClick={handleClose}
      />

      {/* PANEL */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '480px', maxWidth: '100vw', zIndex: 51,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border-default)',
        transform: slideIn ? 'translateX(0)' : 'translateX(100%)',
        transition: slideIn ? 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)' : 'transform 220ms ease-in'
      }}>
        
        {/* PANEL HEADER */}
        <div style={{
          padding: '0 20px', height: '64px', borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', overflow: 'hidden', flexShrink: 0
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(139,92,246,0.06) 100%)'
          }} />
          
          <div style={{
            width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(139,92,246,0.2) 100%)',
            border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6,182,212,0.15)', position: 'relative', zIndex: 1
          }}>
            <span className="ai-gradient-text" style={{ display: 'flex' }}><Wand2 size={18} /></span>
          </div>

          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              NexaFlow <span className="ai-gradient-text">AI</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
              Powered by Groq
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', position: 'relative', zIndex: 1, alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-sidebar)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: 'var(--text-muted)' }}>
              ⌘J
            </div>
            <button 
              onClick={handleClose}
              style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
              className="hover:bg-white/5 hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PANEL TABS */}
        <div style={{
          height: '44px', flexShrink: 0, padding: '0 20px', borderBottom: '1px solid var(--border-default)',
          display: 'flex', gap: '0', overflowX: 'auto'
        }} className="no-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                style={{
                  height: '44px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease',
                  borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: 'transparent'
                }}
                className={!isActive ? "hover:text-text-secondary" : ""}
              >
                <tab.icon size={14} color={isActive ? 'var(--accent)' : 'currentColor'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* PANEL BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          {/* CONTEXTUAL SUGGESTION BANNER */}
          {contextualSuggestion && (
            <div style={{ 
              marginBottom: '20px', padding: '16px', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(6,182,212,0.2)', display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Suggested for you</span>
                <button onClick={() => dispatchContextualSuggestion(null)} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} className="hover:text-text-primary">
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {contextualSuggestion.text}
              </p>
              <button
                onClick={() => {
                  if (contextualSuggestion.action) contextualSuggestion.action();
                }}
                style={{
                  alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '6px', background: 'var(--accent)',
                  color: '#fff', fontSize: '12px', fontWeight: 500
                }}
                className="hover:bg-accent-hover transition-colors"
              >
                {contextualSuggestion.buttonText || 'Try it'}
              </button>
            </div>
          )}

          {activeTab === 'summarize' && <SummarizeTab />}
          {activeTab === 'generate' && <GenerateTab />}
          {activeTab === 'explain' && <ExplainTab />}
          {activeTab === 'improve' && <ImproveTab />}
          {activeTab === 'convert' && <ConvertTab />}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
};

export default AIPanel;
