import { useState } from 'react';
import './SkillSummary.css';

function SkillSummary({ skillLevels, skills, onSaveBuild, skillPointsByJob, jobChain }) {
  const [showSummary, setShowSummary] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('copy build link');
    
  const onToggleSummary = () => {
    setShowSummary(!showSummary);
    if (showSummary) {
      setCopyButtonText('copy build link');
    }
  };

  const handleCopyLink = () => {
    onSaveBuild();
    setCopyButtonText('copied build link!');
    setTimeout(() => {
      setCopyButtonText('copy build link');
    }, 2000);
  };

  // Group skills by job
  const skillsByJob = {};
  Object.entries(skillLevels)
    .filter(([_, level]) => level > 0)
    .forEach(([skillId, level]) => {
      const skill = skills[skillId];
      if (!skill) return;

      const jobId = skill.jobId;
      if (!skillsByJob[jobId]) {
        skillsByJob[jobId] = [];
      }

      skillsByJob[jobId].push({
        skillId,
        name: skill.name,
        level,
        max: skill.max
      });
    });

  const hasSkills = Object.keys(skillsByJob).length > 0;

  if (!hasSkills) {
    return null;
  }

  const buttonText = showSummary ? 'hide summary' : 'show summary';

  return (
    <>
      <button className="SkillSummary-toggleButton" onClick={onToggleSummary}>
        {buttonText}
      </button>
      {showSummary && (
        <div className="SkillSummary-overlay" onClick={onToggleSummary}>
          <div className="SkillSummary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="SkillSummary-header">
              <h3>{jobChain.map(j => j.name).join(' → ')}</h3>
              <button className="SkillSummary-close" onClick={onToggleSummary}>×</button>
            </div>
            
            <div className="SkillSummary-list">
              {jobChain.map(job => {
                const jobSkills = skillsByJob[job.id];
                if (!jobSkills || jobSkills.length === 0) return null;

                const points = skillPointsByJob[job.id] || 0;

                return (
                  <div key={job.id} className="SkillSummary-jobSection">
                    <div className="SkillSummary-jobHeader">
                      <span className="SkillSummary-jobName">{job.name}</span>
                      <span className="SkillSummary-jobPoints">{points}/{job.maxPoints}</span>
                    </div>
                    {jobSkills.map(skill => (
                      <div key={skill.skillId} className="SkillSummary-itemLine">
                        <div className="SkillSummary-levelValue">
                          {skill.name}: {skill.level}/{skill.max}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            
            <div className="SkillSummary-footer">
              <button className="SkillSummary-copyButton" onClick={handleCopyLink}>
                {copyButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SkillSummary;
