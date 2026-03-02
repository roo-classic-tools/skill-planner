import JobSection from './JobSection.js';
import { useTranslation } from '../../hooks/useTranslation';
import './job.css';

function Job({ data: jobData, skillLevels, setSkillLevel, advancementOptions, onAdvance, advancedJobId, onResetJobSkills }) {
  const { name, jobChain, skills } = jobData;
  const { t } = useTranslation();

  const handleSkillUpdate = (skillId, max) => (newValue) => {
    setSkillLevel(skillId, newValue, max);
  };

  const renderSkillsInTree = () => {
    if (!skills || !jobChain || jobChain.length === 0) {
      return <div>{t('ui.noSkillsLoaded')}</div>;
    }

    return (
      <>
        {jobChain.map((job) => (
          <JobSection
            key={job.id}
            job={job}
            skills={skills}
            skillLevels={skillLevels}
            handleSkillUpdate={handleSkillUpdate}
            onResetJob={onResetJobSkills}
          />
        ))}
        
        {/* Show advancement options if tier 1 job and no advanced job selected */}
        {jobChain.length === 1 && jobChain[0].tier === 1 && advancementOptions && advancementOptions.length > 0 && !advancedJobId && (
          <div className="Job-advancement">
            <div className="Job-advancementTitle">{t('ui.advanceTo')}</div>
            <div className="Job-advancementButtons">
              {advancementOptions.map(advJob => (
                <button 
                  key={advJob.id}
                  onClick={() => onAdvance(advJob.id)}
                  className="Job-advancementButton"
                >
                  {t(advJob.name)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Show remove advancement button if advanced job is selected */}
        {advancedJobId && (
          <div className="Job-advancement">
            <button 
              onClick={() => onAdvance(null)}
              className="Job-advancementButton Job-advancementButton--remove"
            >
              {t('ui.removeAdvancedJob')}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="Job">
      <div className="Job-header">
        <div className="Job-title">
          {jobChain.length > 1 
            ? jobChain.map(j => t(j.name)).join(' → ')
            : t(name)
          }
        </div>
      </div>
      {renderSkillsInTree()}
    </div>
  );
}

export default Job;
