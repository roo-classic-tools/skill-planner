import { useCallback, useMemo } from 'react';

const SKILL_POINT_CAP = 40;

/**
 * Find all skills that list `skillId` as a prerequisite.
 */
function findDependentSkills(skills, skillId) {
  const dependents = [];
  Object.entries(skills).forEach(([id, skill]) => {
    if (skill.prevIds && skill.prevIds.includes(skillId)) {
      dependents.push(parseInt(id));
    }
  });
  return dependents;
}

/**
 * Build the dependent skills display data for a given skill.
 */
export function buildDependentSkills(skills, skillLevels, skillId, jobs = {}) {
  const depIds = findDependentSkills(skills, skillId);
  const currentLevel = skillLevels[skillId] || 0;
  return depIds
    .map(depId => {
      const dep = skills[depId];
      if (!dep) return null;
      const prereqIndex = dep.prevIds.indexOf(skillId);
      const requiredLevel = prereqIndex !== -1 ? dep.prevLevels[prereqIndex] : 1;
      const job = jobs[dep.jobId];
      return {
        id: depId,
        name: dep.name,
        jobName: job ? job.name : null,
        spriteX: dep.spriteX,
        spriteY: dep.spriteY,
        requiredLevel,
        currentLevel
      };
    })
    .filter(Boolean);
}

/**
 * Build prerequisite display data for a skill.
 * Returns ALL prerequisites with their current/required levels.
 */
export function buildHiddenPrereqs(skills, skillLevels, skillTree, skillId, index, columnsCount, jobs = {}) {
  const skill = skills[skillId];
  if (!skill) return [];

  const prevIds = skill.prevIds || [];
  const prevLevels = skill.prevLevels || [];
  const prevLevelsCurrent = prevIds.map(id => skillLevels[id] || 0);

  return prevIds
    .map((prereqId, idx) => {
      const prereqSkill = skills[prereqId];
      if (!prereqSkill) return null;

      const job = jobs[prereqSkill.jobId];
      return {
        id: prereqId,
        name: prereqSkill.name,
        jobName: job ? job.name : null,
        requiredLevel: prevLevels[idx],
        currentLevel: prevLevelsCurrent[idx],
        spriteX: prereqSkill.spriteX,
        spriteY: prereqSkill.spriteY
      };
    })
    .filter(Boolean);
}

/**
 * Hook that provides skill tree manipulation actions for a job section.
 */
export function useSkillTreeActions(skills, skillLevels, skillTree, handleSkillUpdate) {
  const totalPoints = useMemo(() => {
    return skillTree.reduce((sum, id) => {
      if (id <= 0) return sum;
      return sum + (skillLevels[id] || 0);
    }, 0);
  }, [skillTree, skillLevels]);

  const isAtCap = totalPoints >= SKILL_POINT_CAP;
  const isOverCap = totalPoints > SKILL_POINT_CAP;

  const resetSkillTree = useCallback((skillId) => {
    const toReset = [skillId];
    const visited = new Set();
    while (toReset.length > 0) {
      const currentId = toReset.pop();
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      const skill = skills[currentId];
      if (skill) {
        handleSkillUpdate(currentId, skill.max)(0);
        findDependentSkills(skills, currentId).forEach(depId => {
          if (!visited.has(depId)) toReset.push(depId);
        });
      }
    }
  }, [skills, handleSkillUpdate]);

  const updateWithCascade = useCallback((skillId, max) => (newLevel) => {
    const oldLevel = skillLevels[skillId] || 0;
    if (newLevel > oldLevel && isAtCap) return;
    handleSkillUpdate(skillId, max)(newLevel);
    if (newLevel < oldLevel) {
      findDependentSkills(skills, skillId).forEach(depId => {
        const dep = skills[depId];
        const depLevel = skillLevels[depId] || 0;
        if (dep && depLevel > 0) {
          const prereqIndex = dep.prevIds.indexOf(skillId);
          if (prereqIndex !== -1 && newLevel < dep.prevLevels[prereqIndex]) {
            resetSkillTree(depId);
          }
        }
      });
    }
  }, [skills, skillLevels, isAtCap, handleSkillUpdate, resetSkillTree]);

  const quickAddPrereq = useCallback((skillId, requiredLevel) => {
    const skill = skills[skillId];
    if (!skill) return;
    const currentLevel = skillLevels[skillId] || 0;
    if (currentLevel >= requiredLevel) return;
    const pointsNeeded = requiredLevel - currentLevel;
    const pointsRemaining = SKILL_POINT_CAP - totalPoints;
    const targetLevel = currentLevel + Math.min(pointsNeeded, pointsRemaining);
    if (targetLevel <= currentLevel) return;
    handleSkillUpdate(skillId, skill.max)(targetLevel);
  }, [skills, skillLevels, totalPoints, handleSkillUpdate]);

  return {
    totalPoints,
    isAtCap,
    isOverCap,
    SKILL_POINT_CAP,
    updateWithCascade,
    quickAddPrereq
  };
}

