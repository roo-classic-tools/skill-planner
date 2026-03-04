import { useState, useRef, useEffect } from 'react';
import './JobSelect.css';

function JobSelect({ jobs, value, onChange, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Build tree structure
  const buildTree = () => {
    const tier1Jobs = jobs.filter(j => j.tier === 1);
    const result = [];
    
    const addJobWithChildren = (job, depth) => {
      result.push({ job, depth });
      const children = jobs
        .filter(j => j.baseJobId === job.id)
        .sort((a, b) => a.id - b.id);
      children.forEach(child => addJobWithChildren(child, depth + 1));
    };
    
    tier1Jobs.sort((a, b) => a.id - b.id).forEach(job => addJobWithChildren(job, 0));
    return result;
  };

  const treeItems = buildTree();
  const selectedJob = jobs.find(j => j.id === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (jobId) => {
    onChange({ target: { value: jobId } });
    setIsOpen(false);
  };

  return (
    <div className="JobSelect" ref={containerRef}>
      <button 
        className="JobSelect-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selectedJob ? t(selectedJob.name) : ''}</span>
        <span className="JobSelect-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="JobSelect-dropdown">
          {treeItems.map(({ job, depth }) => (
            <button
              key={job.id}
              className={`JobSelect-option ${job.id === value ? 'JobSelect-option--selected' : ''}`}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
              onClick={() => handleSelect(job.id)}
              type="button"
            >
              {t(job.name)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobSelect;
