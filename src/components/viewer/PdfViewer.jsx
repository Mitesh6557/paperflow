import React, { useCallback } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { VirtualizedPageList } from './VirtualizedPageList';
import { EmptyState } from './EmptyState';

export const PdfViewer = () => {
  const pdfDocument = useViewerStore(state => state.pdfDocument);
  const { openPdf, isLoading, error } = usePdfDocument();

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      openPdf(files[0]);
    } else {
      alert("Please drop a valid PDF file.");
    }
  }, [openPdf]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div 
      className="pdf-viewer-container"
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, color: 'white'
        }}>
          Loading PDF...
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {pdfDocument ? (
        <VirtualizedPageList />
      ) : (
        <EmptyState onFileSelect={(file) => openPdf(file)} />
      )}
    </div>
  );
};
