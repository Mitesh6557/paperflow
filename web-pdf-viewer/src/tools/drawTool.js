import { createAnnotation } from '../models/Annotation';
import { addAnnotationCommand } from '../models/Command';
import { useAnnotationStore } from '../store/annotationStore';

export const drawTool = {
  onPointerDown: (pt, ctx) => {
    ctx.setIsDrawing(true);
    ctx.setStartPoint(pt);
    ctx.setCurrentCoords({ points: [{ x: pt.x, y: pt.y }] });
  },
  
  onPointerMove: (pt, ctx) => {
    if (!ctx.isDrawing || !ctx.currentCoords) return;
    
    // Throttle: only add point if > 2px away from the last point
    const lastPt = ctx.currentCoords.points[ctx.currentCoords.points.length - 1];
    const dx = pt.x - lastPt.x;
    const dy = pt.y - lastPt.y;
    
    if (Math.sqrt(dx*dx + dy*dy) > 2) {
      ctx.setCurrentCoords(prev => ({
        points: [...prev.points, { x: pt.x, y: pt.y }]
      }));
    }
  },
  
  onPointerUp: (pt, ctx) => {
    if (!ctx.isDrawing || !ctx.currentCoords) return;
    ctx.setIsDrawing(false);
    
    if (ctx.currentCoords.points.length > 2) {
      const newAnn = createAnnotation('draw', ctx.pageNumber, ctx.currentCoords, ctx.currentStyle);
      const cmd = addAnnotationCommand(useAnnotationStore, newAnn);
      ctx.executeCommand(cmd);
    }
    ctx.setCurrentCoords(null);
    ctx.setStartPoint(null);
  }
};
