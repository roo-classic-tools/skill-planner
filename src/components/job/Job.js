import { useRef } from 'react';
import JobSection from './JobSection.js';
import { useTranslation } from '../../hooks/useTranslation';
import './job.css';

function Job({ data: jobData, skillLevels, setSkillLevel, advancementOptions, onAdvance, onResetJobSkills }) {
  const { name, jobChain, skills } = jobData;
  const { t } = useTranslation();
  const jobSectionsRef = useRef({});

  // Create a lookup of jobs by ID for dependent skill tooltips
  const jobsById = jobChain.reduce((acc, job) => {
    acc[job.id] = job;
    return acc;
  }, {});

  const handleSkillUpdate = (skillId, max) => (newValue) => {
    setSkillLevel(skillId, newValue, max);
  };

  const handleHighlightSkill = (skillId) => {
    // Find which job tier contains this skill
    const jobWithSkill = jobChain.find(job => 
      job.skillTree && job.skillTree.includes(skillId)
    );
    
    if (!jobWithSkill) return;
    
    const sectionElement = jobSectionsRef.current[jobWithSkill.id];
    if (!sectionElement) return;
    
    // Find the skill index in the skillTree
    const skillIndex = jobWithSkill.skillTree.indexOf(skillId);
    if (skillIndex === -1) return;
    
    const gridElement = sectionElement.querySelector('.Job-skillGrid');
    if (!gridElement) return;
    
    const skillElement = gridElement.children[skillIndex];
    
    if (skillElement) {
      // Measure the actual header height dynamically
      const header = document.querySelector('.App-header');
      const headerHeight = header ? header.getBoundingClientRect().height : 80;
      
      const sectionRect = sectionElement.getBoundingClientRect();
      const targetY = window.scrollY + sectionRect.top - headerHeight - 16;
      
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      
      // Highlight the skill after scroll settles
      setTimeout(() => {
        skillElement.classList.add('Skill--highlighted');
        setTimeout(() => {
          skillElement.classList.remove('Skill--highlighted');
        }, 1000);
      }, 300);
    }
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
            ref={(el) => { jobSectionsRef.current[job.id] = el; }}
            job={job}
            jobs={jobsById}
            skills={skills}
            skillLevels={skillLevels}
            handleSkillUpdate={handleSkillUpdate}
            onResetJob={onResetJobSkills}
            onHighlightSkill={handleHighlightSkill}
          />
        ))}
        
        {/* Show advancement options if there are any */}
        {advancementOptions && advancementOptions.length > 0 && (
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
