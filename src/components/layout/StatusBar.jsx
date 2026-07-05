import React, { useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { Columns, Layout } from 'lucide-react';

export const StatusBar = () => {
  const pdfDocument = useViewerStore(state => state.pdfDocument);
  const pageCount = useViewerStore(state => state.pageCount);
  const currentPage = useViewerStore(state => state.currentPage);
  const setCurrentPage = useViewerStore(state => state.setCurrentPage);
  const zoomLevel = useViewerStore(state => state.zoomLevel);

  const [pageInput, setPageInput] = useState('');
  const [isEditingPage, setIsEditingPage] = useState(false);

  const handlePageSubmit = (e) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput, 10);
      if (!isNaN(val) && val >= 1 && val <= pageCount) {
        setCurrentPage(val);
      }
      setIsEditingPage(false);
      e.target.blur();
    } else if (e.key === 'Escape') {
      setIsEditingPage(false);
      e.target.blur();
    }
  };

  return (
    <div className="glass-panel" style={{ 
      height: '40px', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px', 
      margin: '0 16px 16px 16px',
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--color-text-secondary)',
      borderTop: '1px solid var(--color-border)',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0
    }}>
      {/* Left: Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pdfDocument ? 'var(--color-success)' : 'var(--color-text-secondary)' }} />
        {pdfDocument ? 'Ready' : 'No document'}
      </div>

      {/* Center/Right: Page & Zoom Controls */}
      {pdfDocument && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          
          {/* View Modes */}
          <div style={{ display: 'flex', gap: '8px' }}>
             <button aria-label="Continuous Scroll" title="Continuous Scroll" style={{ background: 'var(--color-bg-panel)', border: 'none', padding: '4px', borderRadius: '4px', display: 'flex', color: 'var(--color-primary)', cursor: 'pointer' }}>
               <Layout size={14} />
             </button>
             <button onClick={() => alert("Single page view is not available in this demo. Only continuous scroll is supported.")} aria-label="Single Page" title="Single Page" style={{ background: 'transparent', border: 'none', padding: '4px', borderRadius: '4px', display: 'flex', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
               <Columns size={14} />
             </button>
          </div>

          {/* Page Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Page</span>
            {isEditingPage ? (
              <input 
                type="text" 
                autoFocus
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => setIsEditingPage(false)}
                onKeyDown={handlePageSubmit}
                style={{ width: '32px', textAlign: 'center', fontSize: '12px', padding: '2px', border: '1px solid var(--color-primary)', borderRadius: '4px', outline: 'none' }}
              />
            ) : (
              <span 
                onClick={() => {
                  setPageInput(currentPage.toString());
                  setIsEditingPage(true);
                }}
                style={{ cursor: 'pointer', padding: '2px 6px', background: 'var(--color-bg-panel)', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                title="Jump to page"
              >
                {currentPage}
              </span>
            )}
            <span>of {pageCount}</span>
          </div>

          {/* Zoom % */}
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {Math.round(zoomLevel)}%
          </div>

        </div>
      )}
    </div>
  );
};
