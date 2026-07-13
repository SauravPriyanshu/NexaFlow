import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — NexaFlow` : 'NexaFlow';
    return () => { document.title = prev; };
  }, [title]);
}
