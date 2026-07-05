import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { PageCanvas } from './PageCanvas';

import { AnnotationLayer } from './AnnotationLayer';
import { useAnnotationStore } from '../../store/annotationStore';

// A single page container
const PageContainer = ({ pageNumber, defaultWidth, defaultHeight }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const zoomLevel = useViewerStore(state => state.zoomLevel);
  const rotation = useViewerStore(state => state.rotation);
  
  // Calculate size based on zoom and rotation
  const scale = zoomLevel / 100;
  const isLandscape = rotation % 180 !== 0;
  
  const width = isLandscape ? defaultHeight * scale : defaultWidth * scale;
  const height = isLandscape ? defaultWidth * scale : defaultHeight * scale;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Adding a margin to render slightly before coming into view
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '200px 0px', // Render 200px above and below viewport
        threshold: 0
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="page-container"
      data-page-number={pageNumber}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: '0 auto var(--space-6) auto',
        position: 'relative'
      }}
    >
      {isVisible ? (
        <>
          <PageCanvas pageNumber={pageNumber} isVisible={isVisible} />
          <AnnotationLayer pageNumber={pageNumber} width={width} height={height} />
        </>
      ) : (
        // Placeholder for off-screen pages
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'var(--color-bg-panel)', 
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          Loading page {pageNumber}...
        </div>
      )}
    </div>
  );
};

import { useTouchGestures } from '../../hooks/useTouchGestures';

export const VirtualizedPageList = () => {
  const pdfDocument = useViewerStore(state => state.pdfDocument);
  const pageCount = useViewerStore(state => state.pageCount);
  const setCurrentPage = useViewerStore(state => state.setCurrentPage);
  const activeTool = useAnnotationStore(state => state.activeTool);
  
  const [defaultPageSize, setDefaultPageSize] = useState({ width: 612, height: 792 }); // Standard Letter size
  const listRef = useRef(null);
  
  useTouchGestures(listRef);

  // Fetch page 1 to determine default page size
  useEffect(() => {
    if (pdfDocument && pageCount > 0) {
      pdfDocument.getPage(1).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        setDefaultPageSize({ width: viewport.width, height: viewport.height });
      });
    }
  }, [pdfDocument, pageCount]);

  // Determine current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;
      
      const container = listRef.current;
      const scrollCenter = container.scrollTop + container.clientHeight / 2;
      
      // Find which page container intersects with the center of the viewport
      const pageContainers = container.querySelectorAll('.page-container');
      
      for (const pageEl of pageContainers) {
        const top = pageEl.offsetTop;
        const bottom = top + pageEl.offsetHeight;
        
        if (scrollCenter >= top && scrollCenter <= bottom) {
          const pageNum = parseInt(pageEl.getAttribute('data-page-number'), 10);
          setCurrentPage(pageNum);
          break;
        }
      }
    };

    const container = listRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [setCurrentPage]);

  if (!pdfDocument) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div 
      ref={listRef}
      className="virtualized-page-list"
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'auto',
        padding: '20px',
        backgroundColor: 'var(--bg-color)', // Assuming a CSS variable will be set
        touchAction: activeTool === 'hand' ? 'none' : 'pan-x pan-y'
      }}
    >
      {pages.map(pageNum => (
        <PageContainer 
          key={pageNum} 
          pageNumber={pageNum} 
          defaultWidth={defaultPageSize.width}
          defaultHeight={defaultPageSize.height}
        />
      ))}
    </div>
  );
};
