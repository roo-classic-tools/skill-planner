import { useState } from 'react';
import './App.css';
import Job from './components/job/Job.js';
import SkillSummary from './components/skillsummary/SkillSummary.js';
import { useNavigate } from 'react-router-dom';
import { useSkillPlanner } from './hooks/useSkillPlanner';
import { useUrlSync } from './hooks/useUrlSync';
import { useTheme } from './hooks/useTheme';
import { useTranslation } from './hooks/useTranslation';

function App() {
  const navigate = useNavigate();
  const skillPlanner = useSkillPlanner();
  const { saveBuild } = useUrlSync(skillPlanner);
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale, availableLocales } = useTranslation();
  const [copySuccess, setCopySuccess] = useState('');

  const handleSaveBuild = () => {
    saveBuild();
    setCopySuccess(t('ui.buildUrlCopied'));
    setTimeout(() => setCopySuccess(''), 3000);
  };

  const handleJobChange = (event) => {
    const newJobId = parseInt(event.target.value);
    const newJob = skillPlanner.jobList.find(j => j.id === newJobId);
    const currentJob = skillPlanner.currentJob;
    
    // Check if we have any skills allocated
    const hasSkills = Object.keys(skillPlanner.skillLevels).length > 0;
    
    if (!hasSkills) {
      // No skills, just switch
      skillPlanner.setJob(newJobId);
      navigate('/', { replace: true });
      window.scrollTo({ top: 0, left: 0 });
      return;
    }
    
    // Check if jobs are in the same family
    const isSameFamily = 
      // Same job
      newJobId === skillPlanner.jobId ||
      // New job is advancement of current job
      (newJob.baseJobId === skillPlanner.jobId) ||
      // Current job is advancement of new job
      (currentJob.baseJobId === newJobId) ||
      // Both are advancements of the same base job
      (newJob.baseJobId && currentJob.baseJobId && newJob.baseJobId === currentJob.baseJobId);
    
    if (isSameFamily) {
      // Same family - preserve skills and switch
      if (newJob.tier === 2 && newJob.baseJobId) {
        // Switching to tier 2 - set as base job with advanced job
        skillPlanner.setJob(newJob.baseJobId, true);
        skillPlanner.setAdvancedJob(newJobId);
      } else {
        // Switching to tier 1 - just set the job
        skillPlanner.setJob(newJobId, true);
      }
      navigate('/', { replace: true });
      window.scrollTo({ top: 0, left: 0 });
    } else {
      // Different family - warn and reset
      if (window.confirm(t('ui.confirmJobFamilyChange'))) {
        skillPlanner.setJob(newJobId);
        navigate('/', { replace: true });
        window.scrollTo({ top: 0, left: 0 });
      }
    }
  };
  
  const handleResetSkills = () => {
    if (window.confirm(t('ui.confirmResetAllSkills'))) {
      skillPlanner.resetSkills();
      navigate('/', { replace: true });
    }
  };

  // Calculate if over limit for any job
  const getJobPointStatus = () => {
    const statuses = [];
    
    skillPlanner.jobChain.forEach(job => {
      const points = skillPlanner.skillPointsByJob[job.id] || 0;
      const isOver = points > job.maxPoints;
      statuses.push({
        job,
        points,
        isOver
      });
    });
    
    return statuses;
  };

  const jobPointStatuses = getJobPointStatus();

  return (
    <div className="App">
      <div className="App-header">
        <div className="App-jobName">
          <select 
            name="job" 
            value={skillPlanner.advancedJobId || skillPlanner.jobId} 
            onChange={handleJobChange}
          >
            {skillPlanner.jobList.map((job) => (
              <option key={job.id} value={job.id}>{t(job.name)}</option>
            ))}
          </select>
        </div>
        
        <div className="App-totalJobPoints">
          {jobPointStatuses.map((status, index) => (
            <div key={status.job.id} className={status.isOver ? 'App-jobWarning' : ''}>
              {t(status.job.name)}: {status.points}/{status.job.maxPoints}
            </div>
          ))}
        </div>
        
        <div className="App-jobButtons">
          <button onClick={handleSaveBuild}>{t('ui.save')}</button>
          <button onClick={handleResetSkills}>{t('ui.reset')}</button>
          <SkillSummary
            skillLevels={skillPlanner.skillLevels}
            skills={skillPlanner.currentSkills}
            onSaveBuild={handleSaveBuild}
            skillPointsByJob={skillPlanner.skillPointsByJob}
            jobChain={skillPlanner.jobChain}
          />
          <select 
            value={locale} 
            onChange={(e) => setLocale(e.target.value)}
            title={t('ui.language')}
          >
            {availableLocales.map(loc => (
              <option key={loc.code} value={loc.code}>{loc.name}</option>
            ))}
          </select>
          <button onClick={toggleTheme} title={t('ui.toggleTheme')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        
        {copySuccess && (
          <div className="App-copiedUrl">
            {copySuccess}
          </div>
        )}
      </div>

      <div className="App-jobContent">
        <Job 
          data={skillPlanner.jobWithSkills}
          skillLevels={skillPlanner.skillLevels}
          setSkillLevel={skillPlanner.setSkillLevel}
          advancementOptions={skillPlanner.advancementOptions}
          advancedJobId={skillPlanner.advancedJobId}
          onAdvance={skillPlanner.setAdvancedJob}
          onResetJobSkills={skillPlanner.resetJobSkills}
        />
      </div>
    </div>
  );
}

export default App;
