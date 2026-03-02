import './Skill.css';

function Skill({ 
  name: skillName, 
  max, 
  currentLevel = 0,
  prevIds = [],
  prevLevels = [],
  prevLevelsCurrent = [],
  updateSkill
}) {

  const handleIncrement = (increment) => () => {
    updateSkill((currentLevel || 0) + increment);
  };

  const canIncrease = () => {
    // Check if ALL prerequisites are met
    if (!prevIds || prevIds.length === 0) return true;
    
    for (let i = 0; i < prevIds.length; i++) {
      const requiredLevel = prevLevels[i];
      const currentPrereqLevel = prevLevelsCurrent[i] || 0;
      if (currentPrereqLevel < requiredLevel) {
        return false;
      }
    }
    return true;
  };

  const canIncreaseSkill = canIncrease();

  const incrementButton = (
    <button 
      className={`Skill-button ${currentLevel >= max || !canIncreaseSkill ? 'Skill-buttonDisabled' : ''}`}
      onClick={handleIncrement(1)}
      disabled={currentLevel >= max || !canIncreaseSkill}
      aria-label={`Increase ${skillName}`}
    >
      +
    </button>
  );

  const decrementButton = (
    <button 
      className={`Skill-button ${currentLevel <= 0 ? 'Skill-buttonDisabled' : ''}`}
      onClick={handleIncrement(-1)}
      disabled={currentLevel <= 0}
      aria-label={`Decrease ${skillName}`}
    >
      -
    </button>
  );

  return (
    <div className="Skill">
      <div className="Skill-details">
        <div className="Skill-name">{skillName}</div>
        <div className="Skill-modifiers">
          {decrementButton}
          <div className="Skill-value">{currentLevel}/{max}</div>
          {incrementButton}
        </div>
      </div>
    </div>
  );
}

export default Skill;
