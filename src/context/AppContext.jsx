import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [dataMode, setDataMode] = useState(() => {
    return localStorage.getItem('dataMode') || 'mock'; // 'mock' | 'live'
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('cricApiKey') || '';
  });

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    localStorage.setItem('dataMode', dataMode);
  }, [dataMode]);

  useEffect(() => {
    localStorage.setItem('cricApiKey', apiKey);
  }, [apiKey]);

  const toggleDataMode = () => {
    setDataMode(prev => (prev === 'mock' ? 'live' : 'mock'));
    if (dataMode === 'mock') setQuotaExceeded(false); // Reset when switching back to live attempt
  };

  return (
    <AppContext.Provider value={{
      dataMode,
      setDataMode,
      toggleDataMode,
      apiKey,
      setApiKey,
      quotaExceeded,
      setQuotaExceeded
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
