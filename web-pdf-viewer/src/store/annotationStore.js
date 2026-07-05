import { create } from 'zustand';

export const useAnnotationStore = create((set, get) => ({
  annotations: [],
  selectedAnnotationId: null,
  activeTool: 'select', // 'select', 'hand', 'rect', 'circle', 'line', 'arrow', 'draw', 'text'
  
  // Current style settings for new annotations
  currentStyle: {
    strokeColor: '#8b5cf6',
    fillColor: 'transparent',
    strokeWidth: 2,
    strokeStyle: 'solid',
    opacity: 1,
  },

  setAnnotations: (annotations) => set({ annotations }),
  
  _addInternal: (annotation) => set((state) => ({
    annotations: [...state.annotations, annotation]
  })),
  
  _patchInternal: (id, updates) => set((state) => ({
    annotations: state.annotations.map(ann => 
      ann.id === id ? { ...ann, ...updates, style: { ...ann.style, ...(updates.style || {}) } } : ann
    )
  })),
  
  _removeInternal: (id) => set((state) => ({
    annotations: state.annotations.filter(ann => ann.id !== id),
    selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId
  })),
  
  // Keep these for backward compatibility if missed somewhere, but they should be wrapped in commands
  addAnnotation: (annotation) => get()._addInternal(annotation),
  updateAnnotation: (id, updates) => get()._patchInternal(id, updates),
  deleteAnnotation: (id) => get()._removeInternal(id),
  
  clearAll: () => set({ annotations: [], selectedAnnotationId: null }),
  
  setSelectedAnnotationId: (id) => set({ selectedAnnotationId: id }),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setCurrentStyle: (styleUpdates) => set((state) => ({
    currentStyle: { ...state.currentStyle, ...styleUpdates }
  }))
}));
