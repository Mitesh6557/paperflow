import { createAnnotation } from '../models/Annotation';
import { addAnnotationCommand } from '../models/Command';
import { useAnnotationStore } from '../store/annotationStore';

export const arrowTool = {
  onPointerDown: (pt, ctx) => {
    ctx.setIsDrawing(true);
    ctx.setStartPoint(pt);
    ctx.setCurrentCoords({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
  },
  
  onPointerMove: (pt, ctx) => {
    if (!ctx.isDrawing || !ctx.startPoint) return;
    ctx.setCurrentCoords({
      x1: ctx.startPoint.x,
      y1: ctx.startPoint.y,
      x2: pt.x,
      y2: pt.y
    });
  },
  
  onPointerUp: (pt, ctx) => {
    if (!ctx.isDrawing || !ctx.currentCoords) return;
    ctx.setIsDrawing(false);
    
    const dx = ctx.currentCoords.x2 - ctx.currentCoords.x1;
    const dy = ctx.currentCoords.y2 - ctx.currentCoords.y1;
    
    if (Math.sqrt(dx*dx + dy*dy) > 5) {
      const newAnn = createAnnotation('arrow', ctx.pageNumber, ctx.currentCoords, ctx.currentStyle);
      const cmd = addAnnotationCommand(useAnnotationStore, newAnn);
      ctx.executeCommand(cmd);
    }
    ctx.setCurrentCoords(null);
    ctx.setStartPoint(null);
  }
};
