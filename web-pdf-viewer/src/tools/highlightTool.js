import { createAnnotation } from '../models/Annotation';
import { addAnnotationCommand } from '../models/Command';
import { useAnnotationStore } from '../store/annotationStore';

export const highlightTool = {
  // Highlight relies on native browser text selection, so canvas pointer events are disabled.
  // Instead, it listens to global or container-level mouseup.
  onMouseUp: (e, ctx) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const clientRects = range.getClientRects();
    
    if (clientRects.length === 0) return;

    // Convert DOM client rects into PDF-space rects
    // ctx.getCanvasCoords(pt) converts clientX/Y to PDF space
    const pdfRects = [];
    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects[i];
      const pt1 = ctx.getCanvasCoords({ clientX: rect.left, clientY: rect.top });
      const pt2 = ctx.getCanvasCoords({ clientX: rect.right, clientY: rect.bottom });
      
      pdfRects.push({
        x: pt1.x,
        y: pt1.y,
        width: pt2.x - pt1.x,
        height: pt2.y - pt1.y
      });
    }

    if (pdfRects.length > 0) {
      // The annotation will store its specific type, defaulting to highlight if called generically
      const newAnn = createAnnotation(ctx.activeTool, ctx.pageNumber, { rects: pdfRects }, ctx.currentStyle);
      const cmd = addAnnotationCommand(useAnnotationStore, newAnn);
      ctx.executeCommand(cmd);
    }
    
    // Clear selection so the user can draw a new one cleanly
    selection.removeAllRanges();
  }
};
