import { useState } from 'react';
import './App.css';
import Job from './components/job/Job.js';
import SkillSummary from './components/skillsummary/SkillSummary.js';
import Settings from './components/settings/Settings.js';
import { useNavigate } from 'react-router-dom';
import { useSkillPlanner } from './hooks/useSkillPlanner';
import { useUrlSync } from './hooks/useUrlSync';
import { useTranslation } from './hooks/useTranslation';

function App() {
  const navigate = useNavigate();
  const skillPlanner = useSkillPlanner();
  const { saveBuild } = useUrlSync(skillPlanner);
  const { t } = useTranslation();
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
    
    // Helper to check if two jobs are in the same progression chain
    const isInSameChain = (job1, job2) => {
      if (!job1 || !job2) return false;
      if (job1.id === job2.id) return true;
      
      // Build chain for job1
      const chain1 = [job1.id];
      let current = job1;
      while (current.baseJobId) {
        chain1.push(current.baseJobId);
        current = skillPlanner.jobList.find(j => j.id === current.baseJobId);
        if (!current) break;
      }
      
      // Build chain for job2
      const chain2 = [job2.id];
      current = job2;
      while (current.baseJobId) {
        chain2.push(current.baseJobId);
        current = skillPlanner.jobList.find(j => j.id === current.baseJobId);
        if (!current) break;
      }
      
      // Check if any job appears in both chains
      return chain1.some(id => chain2.includes(id));
    };
    
    if (isInSameChain(currentJob, newJob)) {
      // Same family - preserve skills and switch
      skillPlanner.setJob(newJobId, true);
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
  
  const handleAdvance = (newJobId) => {
    // Advancement is always within the same job family, so preserve skills
    skillPlanner.setJob(newJobId, true);
    navigate('/', { replace: true });
    window.scrollTo({ top: 0, left: 0 });
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
            value={skillPlanner.jobId} 
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
          <Settings />
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
          onAdvance={handleAdvance}
          onResetJobSkills={skillPlanner.resetJobSkills}
        />
      </div>
    </div>
  );
}

export default App;
