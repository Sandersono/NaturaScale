
import React, { useState, useEffect, createContext, useContext } from 'react';

type RouteMode = 'auth' | 'admin' | 'shop';

interface RouterContextData {
  path: string;
  mode: RouteMode;
  navigate: (path: string) => void;
  queryParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextData>({} as RouterContextData);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname);
  
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  let mode: RouteMode = 'auth';
  if (path.startsWith('/admin')) mode = 'admin';
  else if (path.startsWith('/app')) mode = 'shop';

  const queryParams = new URLSearchParams(window.location.search);

  return (
    <RouterContext.Provider value={{ path, mode, navigate, queryParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);
