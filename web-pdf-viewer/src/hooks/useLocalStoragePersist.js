import { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { useAnnotationStore } from '../store/annotationStore';

export const useLocalStoragePersist = () => {
  const fileHash = useViewerStore(state => state.fileHash);

  // Restore on load
  useEffect(() => {
    if (!fileHash) return;

    try {
      const savedAnnotations = localStorage.getItem(`pdf-annotations:${fileHash}`);
      if (savedAnnotations) {
        useAnnotationStore.getState().setAnnotations(JSON.parse(savedAnnotations));
      } else {
        useAnnotationStore.getState().setAnnotations([]);
      }

      const savedViewerState = localStorage.getItem(`pdf-viewer-state:${fileHash}`);
      if (savedViewerState) {
        const { zoomLevel, currentPage } = JSON.parse(savedViewerState);
        if (zoomLevel) useViewerStore.getState().setZoomLevel(zoomLevel);
        if (currentPage) useViewerStore.getState().setCurrentPage(currentPage);
      }
    } catch (e) {
      console.warn("Failed to load state from localStorage", e);
    }
  }, [fileHash]);

  // Persist annotations
  useEffect(() => {
    if (!fileHash) return;

    let timeoutId;
    const unsub = useAnnotationStore.subscribe((state, prevState) => {
      if (state.annotations === prevState?.annotations) return;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(`pdf-annotations:${fileHash}`, JSON.stringify(state.annotations));
        } catch (e) {
          console.warn("Failed to persist annotations to localStorage", e);
        }
      }, 500);
    });

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, [fileHash]);

  // Persist viewer state
  useEffect(() => {
    if (!fileHash) return;

    let timeoutId;
    const unsub = useViewerStore.subscribe((state, prevState) => {
      if (state.zoomLevel === prevState?.zoomLevel && state.currentPage === prevState?.currentPage) return;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const toSave = { zoomLevel: state.zoomLevel, currentPage: state.currentPage };
          localStorage.setItem(`pdf-viewer-state:${fileHash}`, JSON.stringify(toSave));
        } catch (e) {
          console.warn("Failed to persist viewer state to localStorage", e);
        }
      }, 500);
    });

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, [fileHash]);
};
