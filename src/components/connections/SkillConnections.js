import { useState, useEffect } from 'react';
import './SkillConnections.css';

function SkillConnections({ gridRef, skills, skillTree, skillLevels, columnsCount }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!gridRef || !gridRef.current || !skills || !skillTree) return;

    const calculateConnections = () => {
      const newConnections = [];
      const gridElement = gridRef.current;
      if (!gridElement) return;
      
      const gridRect = gridElement.getBoundingClientRect();
      const children = Array.from(gridElement.children);

      skillTree.forEach((skillId, index) => {
        if (skillId <= 0) return;

        const skill = skills[skillId];
        if (!skill || !skill.prevIds || skill.prevIds.length === 0) return;

        const targetElement = children[index];
        if (!targetElement) return;

        const targetRect = targetElement.getBoundingClientRect();
        const targetX = targetRect.left + targetRect.width / 2 - gridRect.left;
        const targetY = targetRect.top - gridRect.top;

        skill.prevIds.forEach((prevId, prereqIndex) => {
          // Only draw connections if the prerequisite is in the same skillTree
          const prevIndex = skillTree.indexOf(prevId);
          if (prevIndex === -1) return;

          const sourceElement = children[prevIndex];
          if (!sourceElement) return;

          const sourceRect = sourceElement.getBoundingClientRect();
          const sourceX = sourceRect.left + sourceRect.width / 2 - gridRect.left;
          const sourceY = sourceRect.bottom - gridRect.top;

          const requiredLevel = skill.prevLevels[prereqIndex];
          const currentLevel = skillLevels[prevId] || 0;
          const isMet = currentLevel >= requiredLevel;

          // Skip if source and target are in the same row (no vertical connection needed)
          const sourceRow = Math.floor(prevIndex / columnsCount);
          const targetRow = Math.floor(index / columnsCount);
          if (sourceRow === targetRow) return;

          newConnections.push({
            id: `${prevId}-${skillId}-${prereqIndex}`,
            sourceX,
            sourceY,
            targetX,
            targetY,
            isMet,
            requiredLevel
          });
        });
      });

      setConnections(newConnections);
    };

    calculateConnections();

    if (!gridRef || !gridRef.current) return;

    const resizeObserver = new ResizeObserver(calculateConnections);
    resizeObserver.observe(gridRef.current);

    window.addEventListener('resize', calculateConnections);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateConnections);
    };
  }, [gridRef, skills, skillTree, skillLevels, columnsCount]);

  if (!gridRef || !gridRef.current || connections.length === 0) return null;

  const gridRect = gridRef.current.getBoundingClientRect();

  return (
    <svg 
      className="SkillConnections"
      style={{
        width: gridRect.width,
        height: gridRect.height
      }}
    >
      {connections.map(conn => {
        const midY = (conn.sourceY + conn.targetY) / 2;
        const path = `M ${conn.sourceX} ${conn.sourceY} 
                      L ${conn.sourceX} ${midY} 
                      L ${conn.targetX} ${midY} 
                      L ${conn.targetX} ${conn.targetY}`;

        return (
          <g key={conn.id}>
            <path
              d={path}
              className={`SkillConnections-line ${conn.isMet ? 'is-met' : ''}`}
              fill="none"
              strokeWidth="2"
            />
            <text
              x={(conn.sourceX + conn.targetX) / 2}
              y={midY - 5}
              className="SkillConnections-label"
              textAnchor="middle"
            >
              Lv.{conn.requiredLevel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default SkillConnections;
