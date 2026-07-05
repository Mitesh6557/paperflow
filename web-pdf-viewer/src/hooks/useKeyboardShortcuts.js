import { useEffect } from 'react';
import { useHistoryStore } from '../store/historyStore';
import { useAnnotationStore } from '../store/annotationStore';
import { useViewerStore } from '../store/viewerStore';
import { deleteAnnotationCommand } from '../models/Command';
import { SHORTCUTS } from '../utils/shortcutMap';

export const useKeyboardShortcuts = () => {
  const undo = useHistoryStore(state => state.undo);
  const redo = useHistoryStore(state => state.redo);
  const executeCommand = useHistoryStore(state => state.executeCommand);
  
  const setActiveTool = useAnnotationStore(state => state.setActiveTool);
  const selectedAnnotationId = useAnnotationStore(state => state.selectedAnnotationId);
  const setSelectedAnnotationId = useAnnotationStore(state => state.setSelectedAnnotationId);
  const annotations = useAnnotationStore(state => state.annotations);
  
  const zoomLevel = useViewerStore(state => state.zoomLevel);
  const setZoomLevel = useViewerStore(state => state.setZoomLevel);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Determine if a modifier key is pressed (metaKey on Mac, ctrlKey on Win/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      
      // Build the combo string
      let combo = '';
      if (mod) combo += 'mod+';
      if (e.shiftKey) combo += 'shift+';
      combo += e.key.toLowerCase();

      // Look up action
      const action = SHORTCUTS[combo] || SHORTCUTS[e.key.toLowerCase()];

      // Don't fire shortcuts if user is typing in an input
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
      if (isInput) {
        if (action !== 'deselect-or-exit-edit') {
          return;
        }
      }

      if (!action) return;

      // Execute action
      switch (action) {
        case 'undo':
          e.preventDefault();
          undo();
          break;
        case 'redo':
          e.preventDefault();
          redo();
          break;
        case 'delete-selected':
          if (selectedAnnotationId && !isInput) {
            e.preventDefault();
            const annToDelete = annotations.find(a => a.id === selectedAnnotationId);
            if (annToDelete) {
              const cmd = deleteAnnotationCommand(useAnnotationStore, annToDelete);
              executeCommand(cmd);
            }
          }
          break;
        case 'zoom-in':
          e.preventDefault();
          setZoomLevel(Math.min(zoomLevel + 10, 400));
          break;
        case 'zoom-out':
          e.preventDefault();
          setZoomLevel(Math.max(zoomLevel - 10, 25));
          break;
        case 'deselect-or-exit-edit':
          if (editingTextId) {
            // Trigger blur to commit (AnnotationLayer handles the blur naturally, but we can force it)
            if (document.activeElement && document.activeElement.blur) {
              document.activeElement.blur();
            }
          }
          setSelectedAnnotationId(null);
          break;
        default:
          if (action.startsWith('tool:')) {
            const toolId = action.split(':')[1];
            setActiveTool(toolId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, redo, setActiveTool, selectedAnnotationId, executeCommand, 
    annotations, zoomLevel, setZoomLevel, setSelectedAnnotationId
  ]);
};
