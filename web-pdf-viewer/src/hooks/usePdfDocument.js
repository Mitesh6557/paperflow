import { useState } from 'react';
import { loadPdfFromFile } from '../utils/pdfLoader';
import { useViewerStore } from '../store/viewerStore';
import { useAnnotationStore } from '../store/annotationStore';
import { useHistoryStore } from '../store/historyStore';
export function usePdfDocument() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const setPdfDocument = useViewerStore(state => state.setPdfDocument);

  const openPdf = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const { pdfDocument, fileName, fileHash } = await loadPdfFromFile(file);
      useAnnotationStore.getState().clearAll();
      useHistoryStore.getState().clearHistory();
      setPdfDocument(pdfDocument, fileName, fileHash);
    } catch (err) {
      setError(err.message || 'Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return { openPdf, isLoading, error };
}
