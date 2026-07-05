import { useEffect, useRef } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { useAnnotationStore } from '../store/annotationStore';

export const useTouchGestures = (containerRef) => {
  const setZoomLevel = useViewerStore(state => state.setZoomLevel);
  const activeTool = useAnnotationStore(state => state.activeTool);
  
  // State for gesture tracking
  const stateRef = useRef({
    initialPinchDistance: null,
    initialZoom: null,
    initialPinchCenter: null,
    isPanning: false,
    lastPanPoint: null
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = (touches) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Start pinch-to-zoom or two-finger pan
        // It's safe to preventDefault for 2-finger touches to block native scroll/zoom
        if (e.cancelable) e.preventDefault(); 
        stateRef.current.initialPinchDistance = getDistance(e.touches);
        stateRef.current.initialZoom = useViewerStore.getState().zoomLevel;
        stateRef.current.initialPinchCenter = getCenter(e.touches);
        stateRef.current.lastPanPoint = getCenter(e.touches);
        stateRef.current.isPanning = true;
      } else if (e.touches.length === 1) {
        // Single finger pan if hand tool is active
        if (useAnnotationStore.getState().activeTool === 'hand') {
          stateRef.current.isPanning = true;
          stateRef.current.lastPanPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        
        // Handle Zoom
        if (stateRef.current.initialPinchDistance) {
          const currentDistance = getDistance(e.touches);
          const scale = currentDistance / stateRef.current.initialPinchDistance;
          const newZoom = Math.min(Math.max(stateRef.current.initialZoom * scale, 25), 400);
          
          setZoomLevel(newZoom);
        }

        // Handle Pan
        if (stateRef.current.isPanning && stateRef.current.lastPanPoint) {
          const center = getCenter(e.touches);
          const dx = center.x - stateRef.current.lastPanPoint.x;
          const dy = center.y - stateRef.current.lastPanPoint.y;
          
          container.scrollBy(-dx, -dy);
          stateRef.current.lastPanPoint = center;
        }
      } else if (e.touches.length === 1) {
        if (useAnnotationStore.getState().activeTool === 'hand' && stateRef.current.isPanning && stateRef.current.lastPanPoint) {
          if (e.cancelable) e.preventDefault();
          const x = e.touches[0].clientX;
          const y = e.touches[0].clientY;
          const dx = x - stateRef.current.lastPanPoint.x;
          const dy = y - stateRef.current.lastPanPoint.y;
          
          container.scrollBy(-dx, -dy);
          stateRef.current.lastPanPoint = { x, y };
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        stateRef.current.initialPinchDistance = null;
        stateRef.current.initialZoom = null;
        stateRef.current.initialPinchCenter = null;
        
        if (e.touches.length === 0) {
          stateRef.current.isPanning = false;
          stateRef.current.lastPanPoint = null;
        } else if (e.touches.length === 1 && useAnnotationStore.getState().activeTool === 'hand') {
          // Re-init single finger pan
          stateRef.current.lastPanPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }
    };

    // Handle mouse drag for hand tool panning
    const handleMouseDown = (e) => {
      if (useAnnotationStore.getState().activeTool === 'hand') {
        stateRef.current.isPanning = true;
        stateRef.current.lastPanPoint = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e) => {
      if (stateRef.current.isPanning && stateRef.current.lastPanPoint && useAnnotationStore.getState().activeTool === 'hand') {
        const dx = e.clientX - stateRef.current.lastPanPoint.x;
        const dy = e.clientY - stateRef.current.lastPanPoint.y;
        container.scrollBy(-dx, -dy);
        stateRef.current.lastPanPoint = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      if (stateRef.current.isPanning) {
        stateRef.current.isPanning = false;
        stateRef.current.lastPanPoint = null;
      }
    };

    // { passive: false } allows preventDefault() on touch events to block browser zoom/scroll
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, setZoomLevel, activeTool]);
};
