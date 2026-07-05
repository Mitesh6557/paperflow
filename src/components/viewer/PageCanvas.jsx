import React, { useEffect, useRef, useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import * as pdfjsLib from 'pdfjs-dist';

export const PageCanvas = ({ pageNumber, width, height, isVisible }) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pageProxy, setPageProxy] = useState(null);
  const pdfDocument = useViewerStore(state => state.pdfDocument);
  const zoomLevel = useViewerStore(state => state.zoomLevel);
  const rotation = useViewerStore(state => state.rotation);
  const [rendered, setRendered] = useState(false);

  // Fetch page proxy
  useEffect(() => {
    let isMounted = true;
    
    if (pdfDocument) {
      pdfDocument.getPage(pageNumber).then(page => {
        if (isMounted) {
          setPageProxy(page);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [pdfDocument, pageNumber]);

  // Render page when it becomes visible or when zoom/rotation changes
  useEffect(() => {
    if (!pageProxy || !canvasRef.current || !isVisible) return;

    const renderPage = async () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      
      const viewport = pageProxy.getViewport({ scale: zoomLevel / 100, rotation });
      
      const pixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = viewport.width * pixelRatio;
      canvas.height = viewport.height * pixelRatio;
      
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]
      };

      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const renderTask = pageProxy.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        setRendered(true);
        
        // Render Text Layer
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          const textContent = await pageProxy.getTextContent();
          
          if (pdfjsLib.renderTextLayer) {
            pdfjsLib.renderTextLayer({
              textContentSource: textContent,
              container: textLayerRef.current,
              viewport: viewport,
              textDivs: []
            });
          }
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      } finally {
        renderTaskRef.current = null;
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pageProxy, isVisible, zoomLevel, rotation, pageNumber]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'white', 
      boxShadow: 'var(--shadow-md)', 
      borderRadius: 'var(--radius-sm)', 
      overflow: 'hidden', 
      transition: 'box-shadow var(--transition-fast)' 
    }}>
      <canvas 
        ref={canvasRef}
        className="page-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      {/* Text layer for selection */}
      <div 
        ref={textLayerRef} 
        className="textLayer" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          opacity: 1, // Keep it visible for native selection, but pdf_viewer.css makes text transparent usually
          zIndex: 1
        }} 
      />
    </div>
  );
};
