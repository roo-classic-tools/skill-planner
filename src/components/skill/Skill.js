import './Skill.css';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettings } from '../../hooks/useSettings';
import SkillSprite from '../skillsprite/SkillSprite';
import PrereqIcons from '../prereqicons/PrereqIcons';
import UnlockIcons from '../unlockicons/UnlockIcons';
import PrereqBadges from '../prereqbadges/PrereqBadges';
import UnlockBadges from '../unlockbadges/UnlockBadges';

function Skill({ 
  skillId,
  name: skillName, 
  max, 
  currentLevel = 0,
  prevIds = [],
  prevLevels = [],
  prevLevelsCurrent = [],
  hiddenPrereqs = [],
  dependentSkills = [],
  spriteX,
  spriteY,
  updateSkill,
  onHighlightSkill,
  onQuickAddPrereq,
  isJobAtCap = false
}) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const handleIncrement = (increment) => () => {
    updateSkill((currentLevel || 0) + increment);
  };

  const canIncrease = () => {
    if (!prevIds || prevIds.length === 0) return true;
    for (let i = 0; i < prevIds.length; i++) {
      if ((prevLevelsCurrent[i] || 0) < prevLevels[i]) return false;
    }
    return true;
  };

  const canIncreaseSkill = canIncrease();
  const isLocked = !canIncreaseSkill && currentLevel === 0;

  const showPrereqIcons = (settings.prereqDisplay === 'icons' || settings.prereqDisplay === 'both') && hiddenPrereqs.length > 0;
  const showPrereqBadges = (settings.prereqDisplay === 'badges' || settings.prereqDisplay === 'both') && hiddenPrereqs.length > 0;
  const showUnlockIcons = (settings.unlockDisplay === 'icons' || settings.unlockDisplay === 'both') && dependentSkills.length > 0;
  const showUnlockBadges = (settings.unlockDisplay === 'badges' || settings.unlockDisplay === 'both') && dependentSkills.length > 0;

  return (
    <div className={`Skill ${isLocked ? 'Skill--locked' : ''}`}>
      <div className="Skill-iconContainer">
        <div className="Skill-iconPlaceholder">
          <SkillSprite spriteX={spriteX} spriteY={spriteY} isDisabled={isLocked} />
        </div>
        {showPrereqIcons && (
          <PrereqIcons
            prereqs={hiddenPrereqs}
            onHighlightSkill={onHighlightSkill}
            onQuickAddPrereq={onQuickAddPrereq}
          />
        )}
        {showUnlockIcons && (
          <UnlockIcons 
            dependents={dependentSkills} 
            onSetLevel={(level) => updateSkill(level)} 
            onHighlightSkill={onHighlightSkill}
          />
        )}
      </div>
      <div className="Skill-details">
        <div className="Skill-name">{t(skillName)}</div>
        {showPrereqBadges && (
          <PrereqBadges
            prereqs={hiddenPrereqs}
            onHighlightSkill={onHighlightSkill}
            onQuickAddPrereq={onQuickAddPrereq}
          />
        )}
        {showUnlockBadges && (
          <UnlockBadges
            dependents={dependentSkills}
            onSetLevel={(level) => updateSkill(level)}
            onHighlightSkill={onHighlightSkill}
          />
        )}
        <div className="Skill-modifiers">
          <button 
            className={`Skill-button ${currentLevel <= 0 ? 'Skill-buttonDisabled' : ''}`}
            onClick={handleIncrement(-1)}
            disabled={currentLevel <= 0}
            aria-label={`Decrease ${skillName}`}
          >
            -
          </button>
          <div className="Skill-value">{currentLevel}/{max}</div>
          <button 
            className={`Skill-button ${currentLevel >= max || !canIncreaseSkill || isJobAtCap ? 'Skill-buttonDisabled' : ''}`}
            onClick={handleIncrement(1)}
            disabled={currentLevel >= max || !canIncreaseSkill || isJobAtCap}
            aria-label={`Increase ${skillName}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default Skill;
