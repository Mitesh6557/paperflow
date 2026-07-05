import { createAnnotation } from '../models/Annotation';
// No command import needed since it bypasses history directly until blur

export const textTool = {
  onPointerDown: (pt, ctx) => {
    // Text doesn't drag to create. On click, it immediately spawns an empty annotation in edit mode.
    // Default size is 150x50
    const newAnn = createAnnotation('text', ctx.pageNumber, { x: pt.x, y: pt.y, width: 150, height: 50 }, ctx.currentStyle, '');
    
    // We add it directly to state, without an undo command yet because if they abort it should be deleted.
    // Actually, we'll let the blur handler in AnnotationLayer manage the command history.
    ctx.addAnn(newAnn);
    ctx.setSelectedAnnotationId(newAnn.id);
    ctx.setEditingTextId(newAnn.id); // Triggers inline editor
  },
  
  onPointerMove: (pt, ctx) => {},
  onPointerUp: (pt, ctx) => {}
};
