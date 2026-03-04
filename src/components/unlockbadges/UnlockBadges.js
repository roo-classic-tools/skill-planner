import './UnlockBadges.css';
import { useTranslation } from '../../hooks/useTranslation';
import SkillSprite from '../skillsprite/SkillSprite';

function UnlockBadges({ dependents, onSetLevel, onHighlightSkill }) {
  const { t } = useTranslation();

  if (!dependents || dependents.length === 0) return null;

  return (
    <div className="UnlockBadges">
      <div className="UnlockBadges-heading">{t('ui.unlocks')}</div>
      <div className="UnlockBadges-list">
        {dependents.map((dep) => {
          const isMet = dep.currentLevel >= dep.requiredLevel;
          return (
            <div
              key={dep.id}
              className={`UnlockBadges-item ${isMet ? 'UnlockBadges-item--met' : 'UnlockBadges-item--unmet'}`}
              title={`Lv. ${dep.requiredLevel} ${t('ui.unlocks')}: ${dep.jobName ? t(dep.jobName) + ' - ' : ''}${t(dep.name)}`}
              onClick={!isMet && onSetLevel ? () => onSetLevel(dep.requiredLevel) : undefined}
            >
              <div className="UnlockBadges-icon">
                <SkillSprite spriteX={dep.spriteX} spriteY={dep.spriteY} size={16} />
              </div>
              <span className="UnlockBadges-text">
                Lv.{dep.requiredLevel} → {t(dep.name)}
              </span>
              <div className="UnlockBadges-actions">
                {onHighlightSkill && (
                  <button
                    className="UnlockBadges-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHighlightSkill(dep.id);
                    }}
                    title={t('ui.locateSkill')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UnlockBadges;
