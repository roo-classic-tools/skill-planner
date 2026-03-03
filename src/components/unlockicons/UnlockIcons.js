import './UnlockIcons.css';
import { useTranslation } from '../../hooks/useTranslation';
import SkillSprite from '../skillsprite/SkillSprite';

function UnlockIcons({ dependents, onSetLevel, onHighlightSkill }) {
  const { t } = useTranslation();

  if (!dependents || dependents.length === 0) return null;

  const handleIconClick = (dep) => {
    const isMet = dep.currentLevel >= dep.requiredLevel;
    
    if (isMet) {
      // Met unlocks go find the unlocked skill
      onHighlightSkill && onHighlightSkill(dep.id);
    } else {
      // Unmet unlocks set the level to unlock
      onSetLevel && onSetLevel(dep.requiredLevel);
    }
  };

  return (
    <div className="UnlockIcons">
      {dependents.slice(0, 4).map((dep) => {
        const isMet = dep.currentLevel >= dep.requiredLevel;
        return (
          <div
            key={dep.id}
            className={`UnlockIcons-icon ${!isMet ? 'UnlockIcons-icon--unmet' : ''}`}
            title={`Lv.${dep.requiredLevel} ${t('ui.unlocks')}: ${dep.jobName ? t(dep.jobName) + ' - ' : ''}${t(dep.name)}${isMet ? ' - click to locate' : ' - click to set level'}`}
            onClick={() => handleIconClick(dep)}
            style={{ cursor: 'pointer' }}
          >
            <SkillSprite spriteX={dep.spriteX} spriteY={dep.spriteY} size={28} />
            <div className="UnlockIcons-level">{dep.requiredLevel}</div>
          </div>
        );
      })}
      {dependents.length > 4 && (
        <div className="UnlockIcons-more" title={`+${dependents.length - 4} more unlocks`}>
          +{dependents.length - 4}
        </div>
      )}
    </div>
  );
}

export default UnlockIcons;
