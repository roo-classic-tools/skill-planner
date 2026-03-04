import { useState } from 'react';
import './Settings.css';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../hooks/useSettings';

function Settings() {
  const [showSettings, setShowSettings] = useState(false);
  const { t, locale, setLocale, availableLocales } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useSettings();

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <>
      <button 
        className="Settings-toggleButton" 
        onClick={toggleSettings}
        title={t('ui.settings')}
      >
        ⚙
      </button>
      
      {showSettings && (
        <div className="Settings-overlay" onClick={toggleSettings}>
          <div className="Settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="Settings-header">
              <h3>{t('ui.settings')}</h3>
              <button className="Settings-close" onClick={toggleSettings}>×</button>
            </div>
            
            <div className="Settings-content">
              <div className="Settings-section">
                <label className="Settings-label">
                  {t('ui.language')}
                </label>
                <select 
                  value={locale} 
                  onChange={(e) => setLocale(e.target.value)}
                  className="Settings-select"
                >
                  {availableLocales.map(loc => (
                    <option key={loc.code} value={loc.code}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="Settings-section">
                <label className="Settings-label">
                  {t('ui.theme')}
                </label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="Settings-select"
                >
                  <option value="light">{t('ui.lightMode')}</option>
                  <option value="dark">{t('ui.darkMode')}</option>
                </select>
              </div>

              <div className="Settings-section">
                <label className="Settings-label">
                  {t('ui.showPrereqsAs')}
                </label>
                <select
                  value={settings.prereqDisplay}
                  onChange={(e) => updateSetting('prereqDisplay', e.target.value)}
                  className="Settings-select"
                >
                  <option value="icons">{t('ui.icons')}</option>
                  <option value="badges">{t('ui.badges')}</option>
                  <option value="both">{t('ui.both')}</option>
                  <option value="none">{t('ui.hidden')}</option>
                </select>
              </div>

              <div className="Settings-section">
                <label className="Settings-label">
                  {t('ui.showUnlocksAs')}
                </label>
                <select
                  value={settings.unlockDisplay}
                  onChange={(e) => updateSetting('unlockDisplay', e.target.value)}
                  className="Settings-select"
                >
                  <option value="icons">{t('ui.icons')}</option>
                  <option value="badges">{t('ui.badges')}</option>
                  <option value="both">{t('ui.both')}</option>
                  <option value="none">{t('ui.hidden')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;
