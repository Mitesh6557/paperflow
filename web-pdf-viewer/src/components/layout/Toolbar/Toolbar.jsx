import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../../../store/viewerStore';
import { useAnnotationStore } from '../../../store/annotationStore';
import { useHistoryStore } from '../../../store/historyStore';
import { 
  ZoomIn, ZoomOut, MousePointer2, Hand, Square, Undo2, Redo2,
  FolderOpen, Save, Download, Maximize2, File, RotateCw,
  Type, Highlighter, Circle, Minus, Plus, ArrowUpRight, PenTool, MoreHorizontal
} from 'lucide-react';

export const Toolbar = () => {
  const zoomLevel = useViewerStore(state => state.zoomLevel);
  const setZoomLevel = useViewerStore(state => state.setZoomLevel);
  
  const activeTool = useAnnotationStore(state => state.activeTool);
  const setActiveTool = useAnnotationStore(state => state.setActiveTool);
  
  const undo = useHistoryStore(state => state.undo);
  const redo = useHistoryStore(state => state.redo);
  const canUndo = useHistoryStore(state => state.canUndo());
  const canRedo = useHistoryStore(state => state.canRedo());

  const [zoomInput, setZoomInput] = useState(zoomLevel.toString());
  const [isEditingZoom, setIsEditingZoom] = useState(false);

  useEffect(() => {
    if (!isEditingZoom) {
      setZoomInput(Math.round(zoomLevel).toString());
    }
  }, [zoomLevel, isEditingZoom]);

  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 25));
  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 400));
  
  const handleZoomInputSubmit = (e) => {
    if (e.key === 'Enter') {
      const val = parseInt(zoomInput, 10);
      if (!isNaN(val)) {
        setZoomLevel(Math.min(Math.max(val, 25), 400));
      } else {
        setZoomInput(Math.round(zoomLevel).toString());
      }
      setIsEditingZoom(false);
      e.target.blur();
    } else if (e.key === 'Escape') {
      setZoomInput(Math.round(zoomLevel).toString());
      setIsEditingZoom(false);
      e.target.blur();
    }
  };
  
  const tools = [
    { id: 'select', icon: <MousePointer2 size={20} strokeWidth={1.5} />, label: 'Select', shortcut: 'V' },
    { id: 'hand', icon: <Hand size={20} strokeWidth={1.5} />, label: 'Hand', shortcut: 'H' },
    { id: 'text', icon: <Type size={20} strokeWidth={1.5} />, label: 'Text', shortcut: 'T' },
    { id: 'highlight', icon: <Highlighter size={20} strokeWidth={1.5} />, label: 'Highlight', shortcut: 'Not mapped yet' },
    { id: 'rect', icon: <Square size={20} strokeWidth={1.5} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: <Circle size={20} strokeWidth={1.5} />, label: 'Circle', shortcut: 'O' },
    { id: 'line', icon: <Minus size={20} strokeWidth={1.5} />, label: 'Line', shortcut: 'L' },
    { id: 'arrow', icon: <ArrowUpRight size={20} strokeWidth={1.5} />, label: 'Arrow', shortcut: 'A' },
    { id: 'draw', icon: <PenTool size={20} strokeWidth={1.5} />, label: 'Draw', shortcut: 'D' },
  ];

  const Divider = () => <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--color-border)', margin: '0 8px', flexShrink: 0 }} />;

  return (
    <div className="glass-panel" style={{ 
      height: '68px', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 24px',
      margin: '0 16px 16px 16px',
      zIndex: 9,
      gap: '8px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      flexShrink: 0
    }}>
      
      {/* File Actions */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          className="icon-button" 
          aria-label="Open Document" 
          title="Open Document"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/pdf';
            input.onchange = async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                const { loadPdfFromFile } = await import('../../../utils/pdfLoader');
                try {
                  const { pdfDocument, fileName, fileHash } = await loadPdfFromFile(e.target.files[0]);
                  useAnnotationStore.getState().clearAll();
                  useHistoryStore.getState().clearHistory();
                  useViewerStore.getState().setPdfDocument(pdfDocument, fileName, fileHash);
                } catch (error) {
                  alert("Error loading PDF.");
                }
              }
            };
            input.click();
          }}
        >
          <FolderOpen size={20} strokeWidth={1.5} color="#4f46e5" />
          <span>Open</span>
        </button>
        <button 
          className="icon-button" 
          aria-label="Save Document" 
          title="Save to browser"
          onClick={() => {
            const fileHash = useViewerStore.getState().fileHash;
            if (!fileHash) return;
            try {
              localStorage.setItem(`pdf-annotations:${fileHash}`, JSON.stringify(useAnnotationStore.getState().annotations));
              alert("Saved to browser successfully.");
            } catch (e) {
              alert("Failed to save to browser.");
            }
          }}
        >
          <Save size={20} strokeWidth={1.5} color="#059669" />
          <span>Save</span>
        </button>
        <button 
          className="icon-button" 
          aria-label="Export Document" 
          title="Export Annotated PDF"
          onClick={async (e) => {
            const btn = e.currentTarget;
            const originalText = btn.querySelector('span').innerText;
            btn.querySelector('span').innerText = 'Exporting...';
            btn.style.opacity = '0.7';
            try {
              const { exportAnnotatedPdf } = await import('../../../utils/exportAnnotatedPdf');
              await exportAnnotatedPdf();
            } catch (err) {
              console.error(err);
              alert("Failed to export PDF: " + err.message);
            } finally {
              btn.querySelector('span').innerText = originalText;
              btn.style.opacity = '1';
            }
          }}
        >
          <Download size={20} strokeWidth={1.5} color="#10b981" />
          <span>Export</span>
        </button>
      </div>

      <Divider />

      {/* Undo/Redo */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button className="icon-button" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
          <Undo2 size={20} strokeWidth={1.5} />
          <span>Undo</span>
        </button>
        <button className="icon-button" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={20} strokeWidth={1.5} />
          <span>Redo</span>
        </button>
      </div>

      <Divider />

      {/* Zoom */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-glass)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
        <button onClick={handleZoomOut} aria-label="Zoom Out" title="Zoom Out (-)" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          <Minus size={14} color="var(--color-text-primary)" />
        </button>
        
        <input 
          type="text" 
          value={zoomInput}
          onChange={(e) => setZoomInput(e.target.value)}
          onFocus={() => setIsEditingZoom(true)}
          onBlur={(e) => handleZoomInputSubmit({ ...e, key: 'Enter', target: e.target })}
          onKeyDown={handleZoomInputSubmit}
          aria-label="Zoom Percentage"
          title="Custom Zoom"
          style={{ 
            fontSize: '13px', fontWeight: 600, width: '48px', textAlign: 'center', 
            color: 'var(--color-text-primary)', background: 'transparent', border: 'none', outline: 'none'
          }}
        />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>%</span>
        
        <button onClick={handleZoomIn} aria-label="Zoom In" title="Zoom In (+)" style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          <Plus size={14} color="var(--color-text-primary)" />
        </button>
      </div>

      <Divider />

      {/* View Controls */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          className="icon-button" 
          aria-label="Fit Width" 
          title="Fit Width"
          disabled={!useViewerStore.getState().pdfDocument}
          onClick={() => setZoomLevel(150)}
        >
          <Maximize2 size={20} strokeWidth={1.5} />
          <span>Fit Width</span>
        </button>
        <button 
          className="icon-button" 
          aria-label="Fit Page" 
          title="Fit Page"
          disabled={!useViewerStore.getState().pdfDocument}
          onClick={() => setZoomLevel(75)}
        >
          <File size={20} strokeWidth={1.5} />
          <span>Fit Page</span>
        </button>
        <button 
          className="icon-button" 
          aria-label="Rotate" 
          title="Rotate"
          disabled={!useViewerStore.getState().pdfDocument}
          onClick={() => useViewerStore.getState().setRotation((useViewerStore.getState().rotation + 90) % 360)}
        >
          <RotateCw size={20} strokeWidth={1.5} />
          <span>Rotate</span>
        </button>
      </div>

      <Divider />

      {/* Tools */}
      <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
        {tools.map(tool => {
          const isActive = activeTool === tool.id;
          
          let iconColor = 'currentColor';
          if (tool.id === 'select' || tool.id === 'hand') iconColor = '#7c3aed';
          if (tool.id === 'highlight') iconColor = '#eab308';
          if (tool.id === 'rect') iconColor = '#a855f7';
          if (tool.id === 'circle') iconColor = '#ef4444';
          if (tool.id === 'line') iconColor = '#84cc16';
          if (tool.id === 'arrow') iconColor = '#3b82f6';
          if (tool.id === 'draw') iconColor = '#6366f1';
          
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`icon-button ${isActive ? 'active' : ''}`}
              aria-label={tool.label}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <div style={{ color: isActive ? 'var(--color-primary)' : iconColor }}>
                {tool.icon}
              </div>
              <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{tool.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
