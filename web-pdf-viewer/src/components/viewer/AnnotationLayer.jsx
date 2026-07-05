import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { useAnnotationStore } from '../../store/annotationStore';
import { useHistoryStore } from '../../store/historyStore';
import { addAnnotationCommand, deleteAnnotationCommand, updateAnnotationCommand } from '../../models/Command';
import { drawAnnotation } from '../../utils/canvasRenderer';
import { TOOLS } from '../../tools/toolRegistry';

export const AnnotationLayer = ({ pageNumber, width, height }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const zoomLevel = useViewerStore(state => state.zoomLevel);
  const rotation = useViewerStore(state => state.rotation);
  
  const allAnnotations = useAnnotationStore(state => state.annotations);
  const annotations = allAnnotations.filter(a => a.page === pageNumber);
  
  const activeTool = useAnnotationStore(state => state.activeTool);
  const currentStyle = useAnnotationStore(state => state.currentStyle);
  const selectedAnnotationId = useAnnotationStore(state => state.selectedAnnotationId);
  const setSelectedAnnotationId = useAnnotationStore(state => state.setSelectedAnnotationId);
  const addAnn = useAnnotationStore(state => state.addAnnotation);
  const updateAnn = useAnnotationStore(state => state.updateAnnotation);
  const deleteAnn = useAnnotationStore(state => state.deleteAnnotation);
  
  const executeCommand = useHistoryStore(state => state.executeCommand);

  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [originalCoords, setOriginalCoords] = useState(null);
  
  // Text Editing State
  const [editingTextId, setEditingTextId] = useState(null);
  const editingAnn = editingTextId ? annotations.find(a => a.id === editingTextId) : null;
  const [textEditValue, setTextEditValue] = useState('');

  // Handle Text Edit
  useEffect(() => {
    if (editingAnn) {
      setTextEditValue(editingAnn.text || '');
    }
  }, [editingAnn]);

  // Context passed to tools
  const ctx = useMemo(() => ({
    pageNumber,
    activeTool,
    currentStyle,
    annotations,
    selectedAnnotationId,
    setSelectedAnnotationId,
    addAnn,
    updateAnn,
    deleteAnn,
    executeCommand,
    isDrawing, setIsDrawing,
    isMoving, setIsMoving,
    isResizing, setIsResizing,
    resizeHandle, setResizeHandle,
    startPoint, setStartPoint,
    currentCoords, setCurrentCoords,
    originalCoords, setOriginalCoords,
    editingTextId, setEditingTextId,
    getCanvasCoords: (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoomLevel / 100;
      return {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      };
    }
  }), [
    pageNumber, activeTool, currentStyle, annotations, selectedAnnotationId,
    isDrawing, isMoving, isResizing, resizeHandle, startPoint, currentCoords, originalCoords, editingTextId, zoomLevel,
    setSelectedAnnotationId, addAnn, updateAnn, deleteAnn, executeCommand
  ]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pixelRatio = window.devicePixelRatio || 1;
    const context2d = canvas.getContext('2d');
    
    // Scale the context so drawing commands use CSS pixels
    context2d.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    
    context2d.clearRect(0, 0, width, height);
    
    const scale = zoomLevel / 100;
    
    annotations.forEach(ann => {
      const isSelected = ann.id === selectedAnnotationId;
      const isActivelyModifying = isSelected && (isMoving || isResizing) && currentCoords;
      const isEditingText = ann.id === editingTextId;
      
      drawAnnotation(context2d, ann, { 
        zoom: scale, 
        selected: isSelected,
        currentRect: isActivelyModifying ? currentCoords : null,
        isEditingText
      });
    });

    if (isDrawing && currentCoords && !['select', 'hand', 'text', 'highlight', 'underline', 'strikethrough'].includes(activeTool)) {
      // Create a temporary annotation to render the drawing preview
      const tempAnn = { type: activeTool, style: currentStyle, coords: currentCoords };
      drawAnnotation(context2d, tempAnn, { zoom: scale, selected: false });
    }
    
  }, [annotations, zoomLevel, rotation, isDrawing, isMoving, isResizing, currentCoords, activeTool, currentStyle, selectedAnnotationId, editingTextId]);

  const handlePointerDown = (e) => {
    if (editingTextId) return; // Ignore while editing
    if (activeTool === 'hand') return;
    
    const tool = TOOLS[activeTool];
    if (tool && tool.handler && tool.handler.onPointerDown) {
      tool.handler.onPointerDown(ctx.getCanvasCoords(e), ctx);
    }
  };

  const handlePointerMove = (e) => {
    if (editingTextId || activeTool === 'hand') return;
    const tool = TOOLS[activeTool];
    if (tool && tool.handler && tool.handler.onPointerMove) {
      tool.handler.onPointerMove(ctx.getCanvasCoords(e), ctx);
    }
  };

  const handlePointerUp = (e) => {
    if (editingTextId || activeTool === 'hand') return;
    const tool = TOOLS[activeTool];
    if (tool && tool.handler && tool.handler.onPointerUp) {
      tool.handler.onPointerUp(ctx.getCanvasCoords(e), ctx);
    }
  };

  // Double click for text editing
  const handleDoubleClick = (e) => {
    if (activeTool === 'select' && selectedAnnotationId) {
      const ann = annotations.find(a => a.id === selectedAnnotationId);
      if (ann && ann.type === 'text') {
        setEditingTextId(ann.id);
      }
    }
  };

  // Text blur handler
  const handleTextBlur = () => {
    if (!editingAnn) return;
    
    if (textEditValue.trim() === '') {
      // If empty, just silently remove it (if new) or use a delete command (if it was an existing one we just erased)
      if (editingAnn.text === '') {
        deleteAnn(editingAnn.id);
      } else {
        executeCommand(deleteAnnotationCommand(useAnnotationStore, editingAnn));
      }
    } else if (textEditValue !== editingAnn.text) {
      if (editingAnn.text === '') {
        // It's a brand new text annotation being committed for the first time
        // Remove the temporary one we injected bypass-style, and dispatch a real add command
        deleteAnn(editingAnn.id);
        const finalAnn = { ...editingAnn, text: textEditValue };
        executeCommand(addAnnotationCommand(useAnnotationStore, finalAnn));
      } else {
        // It's an update to an existing text annotation
        executeCommand(updateAnnotationCommand(useAnnotationStore, editingAnn.id, { text: editingAnn.text }, { text: textEditValue }));
      }
    }
    setEditingTextId(null);
  };

  // Keyboard shortcuts (Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't delete if we are actively editing text
      if (editingTextId) return;
      
      // Check if focus is on an input or textarea
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        const annToDelete = annotations.find(a => a.id === selectedAnnotationId);
        if (annToDelete) {
          executeCommand(deleteAnnotationCommand(useAnnotationStore, annToDelete));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, editingTextId, annotations, deleteAnn, addAnn, executeCommand, setSelectedAnnotationId]);

  // Highlight tools use mouseup globally (or on container)
  useEffect(() => {
    const handleMouseUp = (e) => {
      if (['highlight', 'underline', 'strikethrough'].includes(activeTool)) {
        const tool = TOOLS[activeTool];
        if (tool && tool.handler && tool.handler.onMouseUp) {
          tool.handler.onMouseUp(e, ctx);
        }
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [activeTool, ctx]);

  const pixelRatio = window.devicePixelRatio || 1;

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <canvas 
        ref={canvasRef}
        width={width * pixelRatio}
        height={height * pixelRatio}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          pointerEvents: ['hand', 'highlight', 'underline', 'strikethrough'].includes(activeTool) ? 'none' : 'auto',
          cursor: TOOLS[activeTool]?.cursor || 'default',
          zIndex: 2,
          touchAction: 'none'
        }}
      />
      
      {/* Inline Text Editor Overlay */}
      {editingAnn && (
        <textarea
          autoFocus
          value={textEditValue}
          onChange={(e) => setTextEditValue(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.currentTarget.blur();
            }
          }}
          style={{
            position: 'absolute',
            left: `${editingAnn.coords.x * (zoomLevel / 100)}px`,
            top: `${editingAnn.coords.y * (zoomLevel / 100)}px`,
            width: `${editingAnn.coords.width * (zoomLevel / 100)}px`,
            minHeight: `${editingAnn.coords.height * (zoomLevel / 100)}px`,
            fontFamily: editingAnn.style.fontFamily,
            fontSize: `${editingAnn.style.fontSize * (zoomLevel / 100)}px`,
            color: editingAnn.style.strokeColor,
            fontWeight: editingAnn.style.bold ? 'bold' : 'normal',
            fontStyle: editingAnn.style.italic ? 'italic' : 'normal',
            textAlign: editingAnn.style.align || 'left',
            lineHeight: editingAnn.style.lineHeight || 1.5,
            background: 'transparent',
            border: '1px dashed #3b82f6',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            padding: 0,
            margin: 0,
            zIndex: 3,
            pointerEvents: 'auto' // Important to capture clicks
          }}
        />
      )}
    </div>
  );
};
