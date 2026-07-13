import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import searchService from '../services/searchService';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstance';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState({ tasks: [], projects: [], users: [], files: [] });
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [flatResults, setFlatResults] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      axiosInstance.get('/orgs').then(res => {
        if (res.data.data && res.data.data.length > 0) {
          setActiveOrgId(res.data.data[0]._id);
        }
      }).catch(err => console.error(err));
    } else {
      setActiveOrgId(null);
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('nexaflow_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveRecentSearch = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const recent = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('nexaflow_searches', JSON.stringify(recent));
  };

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => {
    setIsOpen(false);
    setQueryState('');
    setResults({ tasks: [], projects: [], users: [], files: [] });
    setHighlightedIndex(-1);
  };

  const setFilter = (type) => {
    setActiveFilter(type);
    setHighlightedIndex(-1);
  };

  const search = useCallback(async (q, types = []) => {
    if (!q || q.length < 2) {
      setResults({ tasks: [], projects: [], users: [], files: [] });
      setFlatResults([]);
      return;
    }
    const orgId = activeOrgId; 
    if (!orgId) return;

    try {
      setLoading(true);
      const res = await searchService.globalSearch(orgId, q, types, 4); // Limit to 4 per type
      const r = res.data.results;
      setResults(r || { tasks: [], projects: [], users: [], files: [] });
      
      // Build flat results for keyboard nav
      const flat = [];
      if (r.tasks) r.tasks.slice(0,4).forEach(t => flat.push({ type: 'task', item: t }));
      if (r.projects) r.projects.slice(0,4).forEach(p => flat.push({ type: 'project', item: p }));
      if (r.users) r.users.slice(0,4).forEach(u => flat.push({ type: 'user', item: u }));
      if (r.files) r.files.slice(0,4).forEach(f => flat.push({ type: 'file', item: f }));
      setFlatResults(flat);
      setHighlightedIndex(flat.length > 0 ? 0 : -1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        search(query, activeFilter === 'all' ? [] : [activeFilter]);
      } else {
        setResults({ tasks: [], projects: [], users: [], files: [] });
        setFlatResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, activeFilter, search]);

  const setQuery = (q) => {
    setQueryState(q);
    setHighlightedIndex(-1);
  };

  const navigateResults = useCallback((direction) => {
    if (flatResults.length === 0) return;
    setHighlightedIndex(prev => {
      let next = prev + direction;
      if (next < 0) next = flatResults.length - 1;
      if (next >= flatResults.length) next = 0;
      return next;
    });
  }, [flatResults.length]);

  return (
    <SearchContext.Provider value={{
      isOpen, setIsOpen, openSearch, closeSearch,
      query, setQuery,
      results, loading,
      activeFilter, setFilter,
      highlightedIndex, navigateResults,
      recentSearches, saveRecentSearch,
      flatResults
    }}>
      {children}
    </SearchContext.Provider>
  );
};
