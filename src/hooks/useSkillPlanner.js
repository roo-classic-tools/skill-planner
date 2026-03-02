import { useReducer, useMemo, useEffect } from 'react';
import jobData from '../resources/jobs.json';
import skillData from '../resources/skills.json';

const STORAGE_KEY = 'skillPlanner_autosave';

// ============================================================================
// STATE STRUCTURE
// ============================================================================
const initialState = {
  jobId: 1,              // Current base job being viewed
  advancedJobId: null,   // Advanced (tier 2) job if selected
  skillLevels: {}        // { skillId: level }
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================
const loadInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const jobExists = jobData.jobs.find(j => j.id === parsed.jobId);
      if (jobExists) {
        return {
          ...initialState,
          jobId: parsed.jobId,
          advancedJobId: parsed.advancedJobId || null,
          skillLevels: parsed.skillLevels || {}
        };
      }
    }
  } catch (error) {
    console.error('Failed to load autosave:', error);
  }
  return initialState;
};

const saveToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      jobId: state.jobId,
      advancedJobId: state.advancedJobId,
      skillLevels: state.skillLevels
    }));
  } catch (error) {
    console.error('Failed to autosave:', error);
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear autosave:', error);
  }
};

// ============================================================================
// ACTIONS
// ============================================================================
const actionTypes = {
  SET_JOB: 'SET_JOB',
  SET_ADVANCED_JOB: 'SET_ADVANCED_JOB',
  SET_SKILL_LEVEL: 'SET_SKILL_LEVEL',
  RESET_SKILLS: 'RESET_SKILLS',
  RESET_JOB_SKILLS: 'RESET_JOB_SKILLS',
  LOAD_BUILD: 'LOAD_BUILD'
};

// ============================================================================
// REDUCER
// ============================================================================
function skillPlannerReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_JOB:
      return {
        ...state,
        jobId: action.payload.jobId,
        advancedJobId: null,
        skillLevels: action.payload.preserveSkills ? state.skillLevels : {}
      };
    
    case actionTypes.SET_ADVANCED_JOB:
      return {
        ...state,
        advancedJobId: action.payload
      };
    
    case actionTypes.SET_SKILL_LEVEL: {
      const { skillId, level, max } = action.payload;
      
      // Remove skill if level is 0 or below
      if (level <= 0) {
        const { [skillId]: _, ...rest } = state.skillLevels;
        return { ...state, skillLevels: rest };
      }
      
      // Clamp level between 0 and max
      const clampedLevel = Math.max(0, Math.min(max, level));
      
      return {
        ...state,
        skillLevels: {
          ...state.skillLevels,
          [skillId]: clampedLevel
        }
      };
    }
    
    case actionTypes.RESET_SKILLS:
      return {
        ...state,
        skillLevels: {}
      };
    
    case actionTypes.RESET_JOB_SKILLS: {
      const jobId = action.payload;
      
      // Remove all skills for this job
      const newSkillLevels = {};
      Object.entries(state.skillLevels).forEach(([skillId, level]) => {
        const skill = skillData.find(s => s.id === parseInt(skillId));
        if (skill && skill.jobId !== jobId) {
          newSkillLevels[skillId] = level;
        }
      });
      
      return {
        ...state,
        skillLevels: newSkillLevels
      };
    }
    
    case actionTypes.LOAD_BUILD:
      return {
        ...state,
        jobId: action.payload.jobId,
        advancedJobId: action.payload.advancedJobId || null,
        skillLevels: action.payload.skillLevels
      };
    
    default:
      return state;
  }
}

// ============================================================================
// HOOK
// ============================================================================
export function useSkillPlanner() {
  const [state, dispatch] = useReducer(skillPlannerReducer, null, loadInitialState);

  // Auto-save to localStorage
  useEffect(() => {
    saveToStorage(state);
  }, [state.jobId, state.advancedJobId, state.skillLevels]);

  // ============================================================================
  // COMPUTED VALUES - Jobs
  // ============================================================================
  const currentJob = useMemo(() => {
    return jobData.jobs.find(job => job.id === state.jobId);
  }, [state.jobId]);

  const advancedJob = useMemo(() => {
    if (!state.advancedJobId) return null;
    return jobData.jobs.find(job => job.id === state.advancedJobId);
  }, [state.advancedJobId]);

  const baseJob = useMemo(() => {
    if (!currentJob || !currentJob.baseJobId) return null;
    return jobData.jobs.find(job => job.id === currentJob.baseJobId);
  }, [currentJob]);

  // Job chain: all jobs to display (base → current OR current → advanced)
  const jobChain = useMemo(() => {
    const chain = [];
    
    if (baseJob) {
      // Viewing tier 2 directly
      chain.push(baseJob, currentJob);
    } else if (advancedJob) {
      // Viewing tier 1 with advancement
      chain.push(currentJob, advancedJob);
    } else if (currentJob) {
      // Just current job
      chain.push(currentJob);
    }
    
    return chain;
  }, [baseJob, currentJob, advancedJob]);

  const advancementOptions = useMemo(() => {
    if (!currentJob || currentJob.tier !== 1) return [];
    return jobData.jobs.filter(job => job.baseJobId === currentJob.id);
  }, [currentJob]);

  // ============================================================================
  // COMPUTED VALUES - Skills
  // ============================================================================
  const currentSkills = useMemo(() => {
    const skills = {};
    
    jobChain.forEach(job => {
      if (!job?.skillTree) return;
      
      skillData.forEach((skill) => {
        if (skill.jobId === job.id) {
          const { id, ...skillRest } = skill;
          skills[id] = skillRest;
        }
      });
    });
    
    return skills;
  }, [jobChain]);

  const skillPointsByJob = useMemo(() => {
    const pointsByJob = {};
    
    Object.entries(state.skillLevels).forEach(([skillId, level]) => {
      const skill = skillData.find(s => s.id === parseInt(skillId));
      if (skill) {
        pointsByJob[skill.jobId] = (pointsByJob[skill.jobId] || 0) + level;
      }
    });
    
    return pointsByJob;
  }, [state.skillLevels]);

  const totalSkillPoints = useMemo(() => {
    return Object.values(state.skillLevels).reduce((sum, level) => sum + level, 0);
  }, [state.skillLevels]);

  // Combined job data with skills
  const jobWithSkills = useMemo(() => {
    return {
      ...currentJob,
      baseJob,
      jobChain,
      skills: currentSkills
    };
  }, [currentJob, baseJob, jobChain, currentSkills]);

  // ============================================================================
  // ACTIONS
  // ============================================================================
  const actions = {
    setJob: (jobId, preserveSkills = false) => {
      dispatch({ type: actionTypes.SET_JOB, payload: { jobId, preserveSkills } });
    },

    setAdvancedJob: (jobId) => {
      dispatch({ type: actionTypes.SET_ADVANCED_JOB, payload: jobId });
    },

    setSkillLevel: (skillId, level, max) => {
      dispatch({ 
        type: actionTypes.SET_SKILL_LEVEL, 
        payload: { skillId, level, max } 
      });
    },

    resetSkills: () => {
      dispatch({ type: actionTypes.RESET_SKILLS });
      clearStorage();
    },

    resetJobSkills: (jobId) => {
      dispatch({ type: actionTypes.RESET_JOB_SKILLS, payload: jobId });
    },

    loadBuild: (jobId, skillLevels, advancedJobId = null) => {
      dispatch({ 
        type: actionTypes.LOAD_BUILD, 
        payload: { jobId, skillLevels, advancedJobId } 
      });
    }
  };

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Raw state
    jobId: state.jobId,
    advancedJobId: state.advancedJobId,
    skillLevels: state.skillLevels,
    
    // Computed - Jobs
    currentJob,
    baseJob,
    advancedJob,
    jobChain,
    advancementOptions,
    jobList: jobData.jobs,
    
    // Computed - Skills
    currentSkills,
    skillPointsByJob,
    totalSkillPoints,
    
    // Combined
    jobWithSkills,
    
    // Actions
    ...actions
  };
}
