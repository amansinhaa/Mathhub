import { useState, useEffect, useMemo } from 'react';

export function usePathname(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '/';
}

export function useRouter() {
  return {
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.replace(url);
      }
    },
  };
}

export function useSearchParams(): URLSearchParams {
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search;
    }
    return '';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateSearch = () => {
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', updateSearch);
    return () => window.removeEventListener('popstate', updateSearch);
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}

