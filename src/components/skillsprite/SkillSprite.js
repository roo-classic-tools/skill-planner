import spriteSheetImage from '../../icons/sprite_sheet.png';
import './SkillSprite.css';

const ICON_SIZE = 100;
const DISPLAY_SIZE = 60; // Default size to display in the UI

function SkillSprite({ spriteX, spriteY, isDisabled = false, size = DISPLAY_SIZE }) {
  if (spriteX === undefined || spriteY === undefined) {
    // No sprite data - show placeholder
    return <div className="SkillSprite SkillSprite--placeholder" />;
  }

  const scale = size / ICON_SIZE;

  const style = {
    backgroundImage: `url(${spriteSheetImage})`,
    backgroundPosition: `-${spriteX}px -${spriteY}px`,
    width: `${ICON_SIZE}px`,
    height: `${ICON_SIZE}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    filter: isDisabled ? 'grayscale(100%) brightness(0.5)' : 'none'
  };

  return <div className="SkillSprite" style={style} />;
}

export default SkillSprite;
