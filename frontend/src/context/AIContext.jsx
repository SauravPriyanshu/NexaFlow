import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { runAI as runAIService } from '../services/aiService';

const AIContext = createContext();
export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summarize');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(null);
  const [contextualSuggestion, setContextualSuggestion] = useState(null);

  const [tabState, setTabState] = useState({
    summarize: { subType: 'meeting_notes', inputs: { meeting_notes: '', chat_thread: '', document: '' }, result: null },
    generate:  { subType: 'docs', projectName: '', description: '', features: [], techStack: [], result: null, setupSteps: '' },
    explain:   { language: 'JavaScript', codeInputs: { JavaScript: '', TypeScript: '', Python: '', Java: '', Go: '', Rust: '', SQL: '', Other: '' }, question: '', result: null },
    improve:   { subType: 'general', inputs: { email: '', documentation: '', task_description: '', general: '' }, result: null },
    convert:   { subType: 'meeting_notes', content: '', result: null, addedTaskIds: [] }
  });

  const openAI = useCallback((tab = 'summarize') => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const closeAI = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const dispatchContextualSuggestion = useCallback((suggestion) => {
    setContextualSuggestion(suggestion);
  }, []);

  const updateTabState = useCallback((tab, updates) => {
    setTabState(prev => {
      const resolvedUpdates = typeof updates === 'function' ? updates(prev[tab]) : updates;
      return {
        ...prev,
        [tab]: { ...prev[tab], ...resolvedUpdates }
      };
    });
  }, []);

  const clearResult = useCallback((tab) => {
    setTabState(prev => ({
      ...prev,
      [tab]: { ...prev[tab], result: null }
    }));
    setError(null);
  }, []);

  // Handle rate limit countdown
  useEffect(() => {
    let interval = null;
    if (rateLimitCountdown !== null && rateLimitCountdown > 0) {
      interval = setInterval(() => {
        setRateLimitCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitCountdown]);

  const runAI = useCallback(async (type, input) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...input };
      if (payload.subType) payload.type = payload.subType;
      if (type === 'summarize') payload.text = payload.inputs?.[payload.subType] || '';

      const response = await runAIService(type, payload);
      setTabState(prev => ({
        ...prev,
        [type]: { ...prev[type], result: response.data }
      }));
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      
      if (status === 429) {
        // Try to parse retry-after, or default to 60s
        const retryAfter = err.response?.headers?.['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter, 10) : 60;
        setRateLimitCountdown(delay);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        openAI();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAI]);

  return (
    <AIContext.Provider value={{
      isOpen, activeTab, loading, error, rateLimitCountdown, tabState, contextualSuggestion,
      openAI, closeAI, setTab, updateTabState, clearResult, runAI, dispatchContextualSuggestion
    }}>
      {children}
    </AIContext.Provider>
  );
};
