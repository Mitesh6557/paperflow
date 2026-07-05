export const getBoundingBox = (annotation) => {
  const { type, coords } = annotation;

  if (['rect', 'circle', 'text'].includes(type)) {
    // Handle negative widths/heights by normalizing x,y
    const x = coords.width < 0 ? coords.x + coords.width : coords.x;
    const y = coords.height < 0 ? coords.y + coords.height : coords.y;
    return {
      x,
      y,
      w: Math.abs(coords.width || 0),
      h: Math.abs(coords.height || 0)
    };
  }
  
  if (['line', 'arrow'].includes(type)) {
    const minX = Math.min(coords.x1, coords.x2);
    const minY = Math.min(coords.y1, coords.y2);
    return {
      x: minX,
      y: minY,
      w: Math.abs(coords.x2 - coords.x1),
      h: Math.abs(coords.y2 - coords.y1)
    };
  }
  
  if (type === 'draw') {
    if (!coords.points || coords.points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
    let minX = coords.points[0].x, maxX = coords.points[0].x;
    let minY = coords.points[0].y, maxY = coords.points[0].y;
    
    for (const p of coords.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    
    return {
      x: minX, y: minY, w: maxX - minX, h: maxY - minY
    };
  }

  if (['highlight', 'underline', 'strikethrough'].includes(type)) {
    if (!coords.rects || coords.rects.length === 0) return { x:0, y:0, w:0, h:0 };
    let minX = coords.rects[0].x, maxX = minX + coords.rects[0].width;
    let minY = coords.rects[0].y, maxY = minY + coords.rects[0].height;
    
    for (const r of coords.rects) {
      if (r.x < minX) minX = r.x;
      if (r.x + r.width > maxX) maxX = r.x + r.width;
      if (r.y < minY) minY = r.y;
      if (r.y + r.height > maxY) maxY = r.y + r.height;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  return { x: 0, y: 0, w: 0, h: 0 };
};

export const getHandles = (annotation, bbox) => {
  const { type, coords } = annotation;
  
  if (['highlight', 'underline', 'strikethrough'].includes(type)) {
    return []; // No handles for text markups
  }

  if (['line', 'arrow'].includes(type)) {
    return [
      { id: 'p1', x: coords.x1, y: coords.y1 },
      { id: 'p2', x: coords.x2, y: coords.y2 }
    ];
  }

  // Box handles for rect, circle, draw, text
  const { x, y, w, h } = bbox;
  return [
    { id: 'tl', x, y },
    { id: 'tc', x: x + w / 2, y },
    { id: 'tr', x: x + w, y },
    { id: 'ml', x, y: y + h / 2 },
    { id: 'mr', x: x + w, y: y + h / 2 },
    { id: 'bl', x, y: y + h },
    { id: 'bc', x: x + w / 2, y: y + h },
    { id: 'br', x: x + w, y: y + h }
  ];
};

export const drawAnnotation = (ctx, annotation, options = {}) => {
  const { zoom = 1, selected = false, currentRect = null } = options;
  const { type, style } = annotation;
  
  // If we are currently modifying this annotation (moving/resizing/drawing), use currentRect, else use coords
  const coords = currentRect || annotation.coords;

  ctx.save();
  ctx.globalAlpha = style.opacity || 1;
  ctx.lineWidth = (style.strokeWidth || 2) * zoom;
  ctx.strokeStyle = style.strokeColor || '#000000';
  ctx.fillStyle = style.fillColor || 'transparent';

  if (style.strokeStyle === 'dashed') ctx.setLineDash([5 * zoom, 5 * zoom]);
  else if (style.strokeStyle === 'dotted') ctx.setLineDash([2 * zoom, 4 * zoom]);
  else ctx.setLineDash([]);

  ctx.beginPath();

  if (type === 'rect') {
    ctx.rect(coords.x * zoom, coords.y * zoom, coords.width * zoom, coords.height * zoom);
    if (style.fillColor && style.fillColor !== 'transparent') ctx.fill();
    if (style.strokeColor && style.strokeColor !== 'transparent') ctx.stroke();
  } 
  else if (type === 'circle') {
    const rx = (coords.width / 2) * zoom;
    const ry = (coords.height / 2) * zoom;
    const cx = (coords.x * zoom) + rx;
    const cy = (coords.y * zoom) + ry;
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
    if (style.fillColor && style.fillColor !== 'transparent') ctx.fill();
    if (style.strokeColor && style.strokeColor !== 'transparent') ctx.stroke();
  }
  else if (type === 'line' || type === 'arrow') {
    ctx.moveTo(coords.x1 * zoom, coords.y1 * zoom);
    ctx.lineTo(coords.x2 * zoom, coords.y2 * zoom);
    if (style.strokeColor && style.strokeColor !== 'transparent') ctx.stroke();

    if (type === 'arrow' && style.strokeColor && style.strokeColor !== 'transparent') {
      const headlen = 15 * zoom;
      const angle = Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1);
      ctx.beginPath();
      ctx.moveTo(coords.x2 * zoom, coords.y2 * zoom);
      ctx.lineTo((coords.x2 * zoom) - headlen * Math.cos(angle - Math.PI / 6), (coords.y2 * zoom) - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(coords.x2 * zoom, coords.y2 * zoom);
      ctx.lineTo((coords.x2 * zoom) - headlen * Math.cos(angle + Math.PI / 6), (coords.y2 * zoom) - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  }
  else if (type === 'draw') {
    if (coords.points && coords.points.length > 0) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(coords.points[0].x * zoom, coords.points[0].y * zoom);
      for (let i = 1; i < coords.points.length; i++) {
        ctx.lineTo(coords.points[i].x * zoom, coords.points[i].y * zoom);
      }
      if (style.strokeColor && style.strokeColor !== 'transparent') ctx.stroke();
    }
  }
  else if (['highlight', 'underline', 'strikethrough'].includes(type)) {
    if (coords.rects && coords.rects.length > 0) {
      if (type === 'highlight') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = style.fillColor === 'transparent' ? '#ffff00' : style.fillColor; // default yellow
        coords.rects.forEach(r => {
          ctx.fillRect(r.x * zoom, r.y * zoom, r.width * zoom, r.height * zoom);
        });
        ctx.globalCompositeOperation = 'source-over';
      } else if (type === 'underline') {
        ctx.strokeStyle = style.strokeColor;
        ctx.beginPath();
        coords.rects.forEach(r => {
          ctx.moveTo(r.x * zoom, (r.y + r.height) * zoom);
          ctx.lineTo((r.x + r.width) * zoom, (r.y + r.height) * zoom);
        });
        ctx.stroke();
      } else if (type === 'strikethrough') {
        ctx.strokeStyle = style.strokeColor;
        ctx.beginPath();
        coords.rects.forEach(r => {
          ctx.moveTo(r.x * zoom, (r.y + r.height / 2) * zoom);
          ctx.lineTo((r.x + r.width) * zoom, (r.y + r.height / 2) * zoom);
        });
        ctx.stroke();
      }
    }
  }
  else if (type === 'text') {
    // Only draw the text if it's NOT currently being edited by the inline editor
    if (!options.isEditingText) {
      ctx.font = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${style.fontSize * zoom}px ${style.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.textAlign = style.align || 'left';
      ctx.fillStyle = style.strokeColor; // Use strokeColor as text color
      
      const lines = (annotation.text || '').split('\n');
      let y = coords.y * zoom;
      let x = coords.x * zoom;
      
      if (ctx.textAlign === 'center') x += (coords.width * zoom) / 2;
      if (ctx.textAlign === 'right') x += coords.width * zoom;
      
      lines.forEach(line => {
        ctx.fillText(line, x, y);
        y += (style.fontSize * (style.lineHeight || 1.5)) * zoom;
      });
    }
  }

  // Draw selection outline and handles if selected
  if (selected) {
    const bbox = getBoundingBox({ ...annotation, coords });
    
    // Don't draw bounding box for text markups
    if (!['highlight', 'underline', 'strikethrough'].includes(type)) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      if (['line', 'arrow'].includes(type)) {
        // Line selection box (optional, but standard usually draws bounds)
        const pad = 4;
        ctx.rect((bbox.x * zoom) - pad, (bbox.y * zoom) - pad, (bbox.w * zoom) + (pad * 2), (bbox.h * zoom) + (pad * 2));
      } else {
        const pad = 4;
        ctx.rect((bbox.x * zoom) - pad, (bbox.y * zoom) - pad, (bbox.w * zoom) + (pad * 2), (bbox.h * zoom) + (pad * 2));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#3b82f6';
    
    // We pass `annotation` with the updated `coords` so handles are generated correctly based on type
    const handles = getHandles({ ...annotation, coords }, bbox);
    handles.forEach(h => {
      ctx.beginPath();
      // Draw circles for handles
      ctx.arc(h.x * zoom, h.y * zoom, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.restore();
};
