// Simple unique ID generator since uuid is not installed

export function createAnnotation(type, page, coords, style = {}, text = '') {
  let defaultCoords = { x: 0, y: 0, width: 0, height: 0 };
  
  if (['line', 'arrow'].includes(type)) {
    defaultCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };
  } else if (type === 'draw') {
    defaultCoords = { points: [] };
  } else if (['highlight', 'underline', 'strikethrough'].includes(type)) {
    defaultCoords = { rects: [] };
  }

  return {
    id: `ann_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    type,
    page,
    coords: { ...defaultCoords, ...coords },
    text,
    rotation: 0,
    style: {
      strokeColor: type === 'highlight' ? 'transparent' : '#7b4cf6',
      fillColor: type === 'highlight' ? 'rgba(234, 179, 8, 0.4)' : 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      fontFamily: 'Inter',
      fontSize: 12,
      bold: false,
      italic: false,
      underline: false,
      align: 'left',
      lineHeight: 1.5,
      ...style
    }
  };
}
