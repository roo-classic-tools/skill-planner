import { useRef, useEffect } from 'react';
import Skill from '../skill/Skill.js';
import SkillConnections from '../connections/SkillConnections.js';
import JobSection from './JobSection.js';
import './job.css';

const COLUMNS_COUNT = 5;

function Job({ data: jobData, skillLevels, setSkillLevel, advancementOptions, onAdvance, advancedJobId, onResetJobSkills }) {
  const { name, baseJob, jobChain, skills } = jobData;

  const handleSkillUpdate = (skillId, max) => (newValue) => {
    setSkillLevel(skillId, newValue, max);
  };

  const renderSkillsInTree = () => {
    if (!skills || !jobChain || jobChain.length === 0) {
      return <div>No skills loaded</div>;
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
            <div className="Job-advancementTitle">Advance to:</div>
            <div className="Job-advancementButtons">
              {advancementOptions.map(advJob => (
                <button 
                  key={advJob.id}
                  onClick={() => onAdvance(advJob.id)}
                  className="Job-advancementButton"
                >
                  {advJob.name}
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
              Remove Advanced Job
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
            ? jobChain.map(j => j.name).join(' → ')
            : name
          }
        </div>
      </div>
      {renderSkillsInTree()}
    </div>
  );
}

export default Job;
