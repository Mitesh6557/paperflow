import { createAnnotation } from '../models/Annotation';
import { addAnnotationCommand } from '../models/Command';
import { useAnnotationStore } from '../store/annotationStore';

export const rectangleTool = {
  onPointerDown: (pt, ctx) => {
    ctx.setIsDrawing(true);
    ctx.setStartPoint(pt);
    ctx.setCurrentCoords({ x: pt.x, y: pt.y, width: 0, height: 0 });
  },
  
  onPointerMove: (pt, ctx) => {
    if (!ctx.isDrawing || !ctx.startPoint) return;
    ctx.setCurrentCoords({
      x: Math.min(ctx.startPoint.x, pt.x),
      y: Math.min(ctx.startPoint.y, pt.y),
      width: Math.abs(pt.x - ctx.startPoint.x),
      height: Math.abs(pt.y - ctx.startPoint.y)
    });
  },
  
  onPointerUp: (pt, ctx) => {
    if (!ctx.isDrawing || !ctx.currentCoords) return;
    ctx.setIsDrawing(false);
    
    if (ctx.currentCoords.width > 5 && ctx.currentCoords.height > 5) {
      const newAnn = createAnnotation('rect', ctx.pageNumber, ctx.currentCoords, ctx.currentStyle);
      const cmd = addAnnotationCommand(useAnnotationStore, newAnn);
      ctx.executeCommand(cmd);
    }
    ctx.setCurrentCoords(null);
    ctx.setStartPoint(null);
  }
};
