import { useRef } from 'react';
import Skill from '../skill/Skill.js';
import SkillConnections from '../connections/SkillConnections.js';

const COLUMNS_COUNT = 5;

function JobSection({ job, skills, skillLevels, handleSkillUpdate, onResetJob }) {
  const gridRef = useRef(null);

  const renderJobSkills = () => {
    if (!job || !job.skillTree) return null;

    return job.skillTree.map((skillId, index) => {
      if (skillId > 0) {
        const currentLevel = skillLevels[skillId] || 0;
        const skillObject = skills[skillId];
        
        if (!skillObject) return <div key={`empty-${index}`} className="Job-empty" />;
        
        const prevIds = skillObject.prevIds || [];
        const prevLevels = skillObject.prevLevels || [];
        const prevLevelsCurrent = prevIds.map(id => skillLevels[id] || 0);
        
        return (
          <Skill
            key={skillId}
            name={skillObject.name}
            max={skillObject.max}
            currentLevel={currentLevel}
            prevIds={prevIds}
            prevLevels={prevLevels}
            prevLevelsCurrent={prevLevelsCurrent}
            updateSkill={handleSkillUpdate(skillId, skillObject.max)}
          />
        );
      }
      
      return <div key={`empty-${index}`} className="Job-empty" />;
    });
  };

  const hasSkills = job.skillTree.some(skillId => {
    if (skillId <= 0) return false;
    return (skillLevels[skillId] || 0) > 0;
  });

  const handleReset = () => {
    if (window.confirm(`Reset all ${job.name} skills?`)) {
      onResetJob(job.id);
    }
  };

  return (
    <div className="Job-section">
      <div className="Job-sectionHeader">
        {job.name}
        {hasSkills && (
          <button 
            onClick={handleReset}
            className="Job-sectionButton"
            title={`Reset ${job.name} skills`}
          >
            reset
          </button>
        )}
      </div>
      <div className="Job-container">
        <div ref={gridRef} className="Job-skillGrid">
          {renderJobSkills()}
        </div>
        <SkillConnections 
          gridRef={gridRef}
          skills={skills}
          skillTree={job.skillTree}
          skillLevels={skillLevels}
          columnsCount={COLUMNS_COUNT}
        />
      </div>
    </div>
  );
}

export default JobSection;
