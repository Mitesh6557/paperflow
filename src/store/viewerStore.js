import { create } from 'zustand';

export const useViewerStore = create((set, get) => ({
  pdfDocument: null,
  pageCount: 0,
  currentPage: 1,
  zoomLevel: 100, // percentage
  rotation: 0,
  fileName: '',
  fileHash: '',
  recentDocuments: [],

  setPdfDocument: (pdfDocument, fileName, fileHash) => {
    set((state) => {
      const newRecent = { name: fileName, hash: fileHash, timestamp: Date.now() };
      const filtered = state.recentDocuments.filter(d => d.hash !== fileHash);
      return {
        pdfDocument,
        pageCount: pdfDocument.numPages,
        currentPage: 1,
        fileName,
        fileHash,
        recentDocuments: [newRecent, ...filtered].slice(0, 10)
      };
    });
  },
  
  setCurrentPage: (page) => {
    const { pageCount } = get();
    if (page >= 1 && page <= pageCount) {
      set({ currentPage: page });
    }
  },
  
  setZoomLevel: (zoomLevel) => {
    // clamp between 10% and 500%
    const clamped = Math.max(10, Math.min(zoomLevel, 500));
    set({ zoomLevel: clamped });
  },
  
  setRotation: (rotation) => set({ rotation }),
  
  closeDocument: () => {
    const { pdfDocument } = get();
    if (pdfDocument) {
      pdfDocument.destroy();
    }
    set({
      pdfDocument: null,
      pageCount: 0,
      currentPage: 1,
      fileName: '',
      fileHash: ''
    });
  }
}));
