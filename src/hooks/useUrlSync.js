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
        
        // Load the build with the specified job
        skillPlanner.loadBuild(jobId, skillLevelsObj);
      } catch (error) {
        console.error('Failed to load build from URL:', error);
      }
    }
  }, [location.search]);

  const saveBuild = () => {
    const { jobId, skillLevels } = skillPlanner;
    
    const skillArray = Object.entries(skillLevels).flat().map(Number);
    const buildString = [jobId, ...skillArray].join(',');
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
