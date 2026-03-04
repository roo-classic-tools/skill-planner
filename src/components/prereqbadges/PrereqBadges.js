import './PrereqBadges.css';
import { useTranslation } from '../../hooks/useTranslation';
import SkillSprite from '../skillsprite/SkillSprite';

function PrereqBadges({ prereqs, onHighlightSkill, onQuickAddPrereq }) {
  const { t } = useTranslation();

  if (!prereqs || prereqs.length === 0) return null;

  return (
    <div className="PrereqBadges">
      <div className="PrereqBadges-heading">{t('ui.requires')}</div>
      <div className="PrereqBadges-list">
        {prereqs.map((prereq) => {
          const isMet = prereq.currentLevel >= prereq.requiredLevel;
          return (
            <div
              key={prereq.id}
              className={`PrereqBadges-item ${isMet ? 'PrereqBadges-item--met' : 'PrereqBadges-item--unmet'}`}
              title={`${prereq.jobName ? t(prereq.jobName) + ' - ' : ''}${t(prereq.name)} Lv.${prereq.requiredLevel}`}
            >
              <div className="PrereqBadges-icon">
                <SkillSprite spriteX={prereq.spriteX} spriteY={prereq.spriteY} size={16} />
              </div>
              <span className="PrereqBadges-text">
                {t(prereq.name)} {prereq.currentLevel}/{prereq.requiredLevel}
              </span>
              <div className="PrereqBadges-actions">
                {onHighlightSkill && (
                  <button
                    className="PrereqBadges-action"
                    onClick={() => onHighlightSkill(prereq.id)}
                    title={t('ui.locateSkill')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </button>
                )}
                {!isMet && onQuickAddPrereq && (
                  <button
                    className="PrereqBadges-action"
                    onClick={() => onQuickAddPrereq(prereq.id, prereq.requiredLevel)}
                    title={t('ui.quickAdd')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
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

export default PrereqBadges;
