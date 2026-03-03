import { useState, useEffect, createContext, useContext } from 'react';

const STORAGE_KEY = 'skillPlanner_settings';

const defaultSettings = {
  prereqDisplay: 'icons', // 'icons', 'badges', 'both', or 'none'
  unlockDisplay: 'icons', // 'icons', 'badges', 'both', or 'none'
};

// Create context
const SettingsContext = createContext();

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

// Provider component
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const value = {
    settings,
    updateSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
