import { updateAnnotationCommand } from '../models/Command';
import { useAnnotationStore } from '../store/annotationStore';
import { getHitAnnotation, getHitHandle } from '../utils/hitTest';

export const selectTool = {
  onPointerDown: (pt, ctx) => {
    const selectedAnn = ctx.annotations.find(a => a.id === ctx.selectedAnnotationId);
    
    // Check handles first if something is selected
    if (selectedAnn) {
      const handle = getHitHandle(pt, selectedAnn);
      if (handle) {
        ctx.setIsResizing(true);
        ctx.setResizeHandle(handle);
        ctx.setStartPoint(pt);
        ctx.setCurrentCoords(JSON.parse(JSON.stringify(selectedAnn.coords)));
        ctx.setOriginalCoords(JSON.parse(JSON.stringify(selectedAnn.coords)));
        return;
      }
    }
    
    // Check body
    const hitId = getHitAnnotation(pt, ctx.annotations);
    if (hitId) {
      ctx.setSelectedAnnotationId(hitId);
      const hitAnn = ctx.annotations.find(a => a.id === hitId);
      
      // Text markups cannot be moved
      if (!['highlight', 'underline', 'strikethrough'].includes(hitAnn.type)) {
        ctx.setIsMoving(true);
        ctx.setStartPoint(pt);
        ctx.setCurrentCoords(JSON.parse(JSON.stringify(hitAnn.coords)));
        ctx.setOriginalCoords(JSON.parse(JSON.stringify(hitAnn.coords)));
      }
    } else {
      ctx.setSelectedAnnotationId(null);
    }
  },
  
  onPointerMove: (pt, ctx) => {
    if (ctx.isResizing && ctx.selectedAnnotationId && ctx.originalCoords) {
      const selectedAnn = ctx.annotations.find(a => a.id === ctx.selectedAnnotationId);
      const dx = pt.x - ctx.startPoint.x;
      const dy = pt.y - ctx.startPoint.y;
      
      let newCoords = JSON.parse(JSON.stringify(ctx.originalCoords));
      
      if (['rect', 'circle', 'text'].includes(selectedAnn.type)) {
        if (ctx.resizeHandle === 'tl') {
          newCoords.x += dx; newCoords.y += dy;
          newCoords.width -= dx; newCoords.height -= dy;
        } else if (ctx.resizeHandle === 'tr') {
          newCoords.y += dy;
          newCoords.width += dx; newCoords.height -= dy;
        } else if (ctx.resizeHandle === 'bl') {
          newCoords.x += dx;
          newCoords.width -= dx; newCoords.height += dy;
        } else if (ctx.resizeHandle === 'br') {
          newCoords.width += dx; newCoords.height += dy;
        } else if (ctx.resizeHandle === 'tc') {
          newCoords.y += dy; newCoords.height -= dy;
        } else if (ctx.resizeHandle === 'bc') {
          newCoords.height += dy;
        } else if (ctx.resizeHandle === 'ml') {
          newCoords.x += dx; newCoords.width -= dx;
        } else if (ctx.resizeHandle === 'mr') {
          newCoords.width += dx;
        }
      } else if (['line', 'arrow'].includes(selectedAnn.type)) {
        if (ctx.resizeHandle === 'p1') { newCoords.x1 += dx; newCoords.y1 += dy; }
        if (ctx.resizeHandle === 'p2') { newCoords.x2 += dx; newCoords.y2 += dy; }
      } else if (selectedAnn.type === 'draw') {
        // Find bounding box to scale points correctly
        let minX = ctx.originalCoords.points[0].x, maxX = minX;
        let minY = ctx.originalCoords.points[0].y, maxY = minY;
        for (const p of ctx.originalCoords.points) {
          if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
        }
        const ow = maxX - minX;
        const oh = maxY - minY;
        
        let nw = ow, nh = oh, nx = minX, ny = minY;
        
        if (ctx.resizeHandle === 'tl') { nx += dx; ny += dy; nw -= dx; nh -= dy; }
        else if (ctx.resizeHandle === 'tr') { ny += dy; nw += dx; nh -= dy; }
        else if (ctx.resizeHandle === 'bl') { nx += dx; nw -= dx; nh += dy; }
        else if (ctx.resizeHandle === 'br') { nw += dx; nh += dy; }
        
        if (nw !== 0 && nh !== 0 && ow !== 0 && oh !== 0) {
          const sx = nw / ow;
          const sy = nh / oh;
          newCoords.points = ctx.originalCoords.points.map(p => ({
            x: nx + (p.x - minX) * sx,
            y: ny + (p.y - minY) * sy
          }));
        }
      }
      
      ctx.setCurrentCoords(newCoords);
      return;
    }
    
    if (ctx.isMoving && ctx.selectedAnnotationId && ctx.originalCoords) {
      const selectedAnn = ctx.annotations.find(a => a.id === ctx.selectedAnnotationId);
      const dx = pt.x - ctx.startPoint.x;
      const dy = pt.y - ctx.startPoint.y;
      
      let newCoords = JSON.parse(JSON.stringify(ctx.originalCoords));
      
      if (['rect', 'circle', 'text'].includes(selectedAnn.type)) {
        newCoords.x += dx;
        newCoords.y += dy;
      } else if (['line', 'arrow'].includes(selectedAnn.type)) {
        newCoords.x1 += dx; newCoords.y1 += dy;
        newCoords.x2 += dx; newCoords.y2 += dy;
      } else if (selectedAnn.type === 'draw') {
        newCoords.points = newCoords.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      
      ctx.setCurrentCoords(newCoords);
    }
  },
  
  onPointerUp: (pt, ctx) => {
    if (ctx.isMoving && ctx.selectedAnnotationId && ctx.currentCoords && ctx.originalCoords) {
      ctx.setIsMoving(false);
      const id = ctx.selectedAnnotationId;
      const finalCoords = { ...ctx.currentCoords };
      const origCoords = { ...ctx.originalCoords };
      
      const cmd = updateAnnotationCommand(useAnnotationStore, id, { coords: origCoords }, { coords: finalCoords });
      ctx.executeCommand(cmd);
    }
    
    if (ctx.isResizing && ctx.selectedAnnotationId && ctx.currentCoords && ctx.originalCoords) {
      ctx.setIsResizing(false);
      const id = ctx.selectedAnnotationId;
      const finalCoords = { ...ctx.currentCoords };
      const origCoords = { ...ctx.originalCoords };
      
      const cmd = updateAnnotationCommand(useAnnotationStore, id, { coords: origCoords }, { coords: finalCoords });
      ctx.executeCommand(cmd);
      ctx.setResizeHandle(null);
    }
    
    ctx.setCurrentCoords(null);
    ctx.setStartPoint(null);
    ctx.setOriginalCoords(null);
  }
};
