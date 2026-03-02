import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useUrlSync(skillPlanner) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const buildParam = params.get('build');
    
    if (buildParam) {
      try {
        const decoded = atob(buildParam);
        const [jobId, ...skillLevels] = decoded.split(',').map(Number);
        
        const skillLevelsObj = {};
        for (let i = 0; i < skillLevels.length; i += 2) {
          if (skillLevels[i] && skillLevels[i + 1]) {
            skillLevelsObj[skillLevels[i]] = skillLevels[i + 1];
          }
        }
        
        // Check if the loaded job is tier 2
        const loadedJob = skillPlanner.jobList.find(j => j.id === jobId);
        
        if (loadedJob && loadedJob.tier === 2 && loadedJob.baseJobId) {
          // Load as base job with advanced job
          skillPlanner.loadBuild(loadedJob.baseJobId, skillLevelsObj, jobId);
        } else {
          // Load normally
          skillPlanner.loadBuild(jobId, skillLevelsObj);
        }
      } catch (error) {
        console.error('Failed to load build from URL:', error);
      }
    }
  }, [location.search]);

  const saveBuild = () => {
    const { jobId, advancedJobId, skillLevels } = skillPlanner;
    
    // If we have an advanced job, save as the advanced job (tier 2)
    // This makes the URL consistent whether you advance or select directly
    const saveJobId = advancedJobId || jobId;
    
    const skillArray = Object.entries(skillLevels).flat().map(Number);
    const buildString = [saveJobId, ...skillArray].join(',');
    const encoded = btoa(buildString);
    
    const url = `${window.location.origin}${window.location.pathname}?build=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      skillPlanner.setCopySuccess('Build URL copied to clipboard!');
      setTimeout(() => skillPlanner.setCopySuccess(''), 3000);
    }).catch(() => {
      skillPlanner.setCopySuccess('Failed to copy URL');
      setTimeout(() => skillPlanner.setCopySuccess(''), 3000);
    });
  };

  return { saveBuild };
}
