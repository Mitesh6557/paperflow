import { getBoundingBox } from './canvasRenderer';

// Tolerance in pixels for hit testing (especially useful for lines/strokes)
const HIT_TOLERANCE = 8;
const HANDLE_SIZE = 12; // A bit larger for touch/mouse ease
const HANDLE_HALF = HANDLE_SIZE / 2;

export function hitTestPointInRect(pt, rect, tolerance = 0) {
  // rect expects {x, y, w, h}
  return (
    pt.x >= rect.x - tolerance &&
    pt.x <= rect.x + rect.w + tolerance &&
    pt.y >= rect.y - tolerance &&
    pt.y <= rect.y + rect.h + tolerance
  );
}

function hitTestLineSegment(pt, x1, y1, x2, y2, tolerance) {
  const A = pt.x - x1;
  const B = pt.y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) {
    xx = x1; yy = y1;
  } else if (param > 1) {
    xx = x2; yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = pt.x - xx;
  const dy = pt.y - yy;
  return Math.sqrt(dx * dx + dy * dy) <= tolerance;
}

export const getHitAnnotation = (pt, annotations) => {
  // Check from top to bottom (last drawn first)
  for (let i = annotations.length - 1; i >= 0; i--) {
    const ann = annotations[i];
    const { type, coords } = ann;
    
    if (['rect', 'text'].includes(type)) {
      const bbox = getBoundingBox(ann);
      if (hitTestPointInRect(pt, bbox, HIT_TOLERANCE)) return ann.id;
    } 
    else if (type === 'circle') {
      const bbox = getBoundingBox(ann);
      const cx = bbox.x + bbox.w / 2;
      const cy = bbox.y + bbox.h / 2;
      const rx = bbox.w / 2;
      const ry = bbox.h / 2;
      
      if (rx > 0 && ry > 0) {
        const val = Math.pow((pt.x - cx) / rx, 2) + Math.pow((pt.y - cy) / ry, 2);
        
        // If it's filled, clicking inside selects it. If transparent, only rim selects it.
        const isFilled = ann.style?.fillColor && ann.style.fillColor !== 'transparent';
        const rimTolerance = HIT_TOLERANCE / Math.min(rx, ry); // Scale tolerance by radius
        
        if (isFilled) {
          if (val <= 1 + rimTolerance) return ann.id;
        } else {
          if (val >= 1 - rimTolerance && val <= 1 + rimTolerance) return ann.id;
        }
      }
    }
    else if (['line', 'arrow'].includes(type)) {
      if (hitTestLineSegment(pt, coords.x1, coords.y1, coords.x2, coords.y2, HIT_TOLERANCE)) {
        return ann.id;
      }
    }
    else if (type === 'draw') {
      if (coords.points && coords.points.length > 0) {
        if (coords.points.length === 1) {
          const p = coords.points[0];
          const dx = pt.x - p.x;
          const dy = pt.y - p.y;
          if (Math.sqrt(dx*dx + dy*dy) <= HIT_TOLERANCE) return ann.id;
        } else {
          for (let j = 0; j < coords.points.length - 1; j++) {
            const p1 = coords.points[j];
            const p2 = coords.points[j+1];
            if (hitTestLineSegment(pt, p1.x, p1.y, p2.x, p2.y, HIT_TOLERANCE)) {
              return ann.id;
            }
          }
        }
      }
    }
    else if (['highlight', 'underline', 'strikethrough'].includes(type)) {
      if (coords.rects) {
        for (const rect of coords.rects) {
          if (pt.x >= rect.x && pt.x <= rect.x + rect.width &&
              pt.y >= rect.y && pt.y <= rect.y + rect.height) {
            return ann.id;
          }
        }
      }
    }
  }
  return null;
};

export function getHitHandle(pt, ann) {
  if (!ann) return null;
  
  const { type, coords } = ann;
  
  // Text markups have no handles
  if (['highlight', 'underline', 'strikethrough'].includes(type)) {
    return null;
  }
  
  // Line and arrow have 2 handles (endpoints)
  if (['line', 'arrow'].includes(type)) {
    if (Math.abs(pt.x - coords.x1) <= HANDLE_HALF && Math.abs(pt.y - coords.y1) <= HANDLE_HALF) return 'p1';
    if (Math.abs(pt.x - coords.x2) <= HANDLE_HALF && Math.abs(pt.y - coords.y2) <= HANDLE_HALF) return 'p2';
    return null;
  }
  
  // Rect, circle, draw, text use 8 handles based on bounding box
  const bbox = getBoundingBox(ann);
  const { x, y, w, h } = bbox;
  
  const handles = [
    { id: 'tl', x, y },
    { id: 'tc', x: x + w / 2, y },
    { id: 'tr', x: x + w, y },
    { id: 'ml', x, y: y + h / 2 },
    { id: 'mr', x: x + w, y: y + h / 2 },
    { id: 'bl', x, y: y + h },
    { id: 'bc', x: x + w / 2, y: y + h },
    { id: 'br', x: x + w, y: y + h }
  ];
  
  for (const h of handles) {
    if (hitTestPointInRect(pt, { x: h.x - HANDLE_HALF, y: h.y - HANDLE_HALF, w: HANDLE_SIZE, h: HANDLE_SIZE })) {
      return h.id;
    }
  }
  
  return null;
}
