import { forwardRef } from 'react';
import Skill from '../skill/Skill.js';
import { useTranslation } from '../../hooks/useTranslation';
import { useSkillTreeActions, buildDependentSkills, buildHiddenPrereqs } from '../../hooks/useSkillTreeActions';

const COLUMNS_COUNT = 5;

const JobSection = forwardRef(({ job, jobs, skills, skillLevels, handleSkillUpdate, onResetJob, onHighlightSkill }, ref) => {
  const { t } = useTranslation();

  const {
    totalPoints,
    isAtCap,
    isOverCap,
    SKILL_POINT_CAP,
    updateWithCascade,
    quickAddPrereq
  } = useSkillTreeActions(skills, skillLevels, job.skillTree, handleSkillUpdate);

  const renderJobSkills = () => {
    if (!job || !job.skillTree) return null;

    return job.skillTree.map((skillId, index) => {
      if (skillId <= 0) return <div key={`empty-${index}`} className="Job-empty" />;

      const skillObject = skills[skillId];
      if (!skillObject) return <div key={`empty-${index}`} className="Job-empty" />;

      const currentLevel = skillLevels[skillId] || 0;
      const prevIds = skillObject.prevIds || [];
      const prevLevels = skillObject.prevLevels || [];
      const prevLevelsCurrent = prevIds.map(id => skillLevels[id] || 0);
      const dependentSkills = buildDependentSkills(skills, skillLevels, skillId, jobs);
      const hiddenPrereqs = buildHiddenPrereqs(skills, skillLevels, job.skillTree, skillId, index, COLUMNS_COUNT, jobs);

      return (
        <Skill
          key={skillId}
          skillId={skillId}
          name={skillObject.name}
          max={skillObject.max}
          currentLevel={currentLevel}
          prevIds={prevIds}
          prevLevels={prevLevels}
          prevLevelsCurrent={prevLevelsCurrent}
          hiddenPrereqs={hiddenPrereqs}
          dependentSkills={dependentSkills}
          spriteX={skillObject.spriteX}
          spriteY={skillObject.spriteY}
          updateSkill={updateWithCascade(skillId, skillObject.max)}
          onHighlightSkill={onHighlightSkill}
          onQuickAddPrereq={quickAddPrereq}
          isJobAtCap={isAtCap}
        />
      );
    });
  };

  const hasSkills = job.skillTree.some(id => id > 0 && (skillLevels[id] || 0) > 0);

  const handleReset = () => {
    if (window.confirm(t('ui.confirmResetJobSkills', { jobName: t(job.name) }))) {
      onResetJob(job.id);
    }
  };

  return (
    <div ref={ref} className="Job-section">
      <div className="Job-sectionHeader">
        <span className="Job-sectionTitle">{t(job.name)}</span>
        <span className={`Job-sectionPoints ${isOverCap ? 'Job-sectionPoints--over' : isAtCap ? 'Job-sectionPoints--cap' : ''}`}>
          {totalPoints}/{SKILL_POINT_CAP}
        </span>
        {hasSkills && (
          <button 
            onClick={handleReset}
            className="Job-sectionButton"
            title={t('ui.resetJobSkillsTitle', { jobName: t(job.name) })}
          >
            {t('ui.reset')}
          </button>
        )}
      </div>
      <div className="Job-container">
        <div className="Job-skillGrid">
          {renderJobSkills()}
        </div>
      </div>
    </div>
  );
});

export default JobSection;
