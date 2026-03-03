import './PrereqIcons.css';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import SkillSprite from '../skillsprite/SkillSprite';

function PrereqIcons({ prereqs, onHighlightSkill, onQuickAddPrereq }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(null);

  if (!prereqs || prereqs.length === 0) return null;

  const handleIconClick = (prereq) => {
    const isMet = prereq.currentLevel >= prereq.requiredLevel;
    
    if (isMet) {
      // Met prereqs go straight to find
      onHighlightSkill && onHighlightSkill(prereq.id);
    } else {
      // Unmet prereqs toggle the popup
      setActiveId(activeId === prereq.id ? null : prereq.id);
    }
  };

  return (
    <div className={`PrereqIcons ${activeId ? 'PrereqIcons--active' : ''}`}>
      {prereqs.slice(0, 4).map((prereq) => {
        const isMet = prereq.currentLevel >= prereq.requiredLevel;
        const isActive = activeId === prereq.id;
        return (
          <div
            key={prereq.id}
            className={`PrereqIcons-icon ${!isMet ? 'PrereqIcons-icon--unmet' : ''} ${isActive ? 'PrereqIcons-icon--active' : ''}`}
            title={`${t('ui.requires')}: ${prereq.jobName ? t(prereq.jobName) + ' - ' : ''}${t(prereq.name)} Lv.${prereq.requiredLevel}${isMet ? '' : ' - click for options'}`}
            onClick={() => handleIconClick(prereq)}
          >
            <SkillSprite spriteX={prereq.spriteX} spriteY={prereq.spriteY} size={28} />
            <div className="PrereqIcons-level">{prereq.requiredLevel}</div>
            {isActive && !isMet && (
              <div className="PrereqIcons-popup">
                <button
                  className="PrereqIcons-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHighlightSkill && onHighlightSkill(prereq.id);
                    setActiveId(null);
                  }}
                  title={t('ui.locateSkill')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>
                <button
                  className="PrereqIcons-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAddPrereq && onQuickAddPrereq(prereq.id, prereq.requiredLevel);
                    setActiveId(null);
                  }}
                  title={t('ui.quickAdd')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
      {prereqs.length > 4 && (
        <div className="PrereqIcons-more" title={`+${prereqs.length - 4} more prerequisites`}>
          +{prereqs.length - 4}
        </div>
      )}
    </div>
  );
}

export default PrereqIcons;
