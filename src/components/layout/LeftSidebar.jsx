import React, { useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { FileText, ListTree, FolderOpen, History, Cloud } from 'lucide-react';

export const LeftSidebar = () => {
  const pdfDocument = useViewerStore(state => state.pdfDocument);
  const recentDocuments = useViewerStore(state => state.recentDocuments);
  const [activeTab, setActiveTab] = useState('pages');

  return (
    <div className="glass-panel" style={{ 
      width: '280px', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      position: 'relative',
      margin: '0 0 16px 16px'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', padding: '16px', gap: '8px' }}>
        <button 
          onClick={() => setActiveTab('pages')}
          style={{ 
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: activeTab === 'pages' ? 'var(--color-bg-panel)' : 'transparent',
            color: activeTab === 'pages' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'pages' ? 'var(--shadow-sm)' : 'none',
            border: 'none', padding: '8px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          <FileText size={16} /> Pages
        </button>
        <button 
          onClick={() => alert("Document Outline is not available in this demo.")}
          style={{ 
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: activeTab === 'outline' ? 'var(--color-bg-panel)' : 'transparent',
            color: activeTab === 'outline' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            boxShadow: activeTab === 'outline' ? 'var(--shadow-sm)' : 'none',
            border: 'none', padding: '8px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          <ListTree size={16} /> Outline
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {!pdfDocument && activeTab === 'pages' && (
          <div style={{ 
            background: 'var(--color-bg-panel)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '24px 16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '24px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '16px', width: '32px', height: '40px', background: 'var(--color-primary)', borderRadius: '4px', opacity: 0.8, transform: 'rotate(-10deg)' }} />
              <div style={{ position: 'absolute', top: '16px', left: '20px', width: '32px', height: '40px', background: 'var(--color-primary-hover)', borderRadius: '4px' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-primary)' }}>No document opened</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Open a PDF to view pages</p>
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const { loadPdfFromFile } = await import('../../utils/pdfLoader');
                    const { useAnnotationStore } = await import('../../store/annotationStore');
                    const { useHistoryStore } = await import('../../store/historyStore');
                    try {
                      const { pdfDocument, fileName, fileHash } = await loadPdfFromFile(e.target.files[0]);
                      useAnnotationStore.getState().clearAll();
                      useHistoryStore.getState().clearHistory();
                      useViewerStore.getState().setPdfDocument(pdfDocument, fileName, fileHash);
                    } catch (error) {
                      alert("Error loading PDF.");
                    }
                  }
                };
                input.click();
              }}
              style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--color-primary), #d946ef)',
              color: 'white', border: 'none', padding: '10px', borderRadius: 'var(--radius-md)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <FolderOpen size={16} /> Open PDF
            </button>
          </div>
        )}

        {/* Recent Documents */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Documents</h4>
            <span 
              style={{ fontSize: '11px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => useViewerStore.setState({ recentDocuments: [] })}
            >Clear all</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentDocuments.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '16px' }}>
                No recent documents this session.
              </div>
            ) : recentDocuments.map(doc => (
              <div 
                key={doc.hash} 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'not-allowed', opacity: 0.7, transition: 'background var(--transition-fast)' }} 
                title="Files cannot be reopened from here in this demo since there is no backend storage"
                className="recent-doc"
              >
                <FileText size={16} color="var(--color-danger)" />
                <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>{doc.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .recent-doc:hover {
          background: var(--color-bg-panel-hover);
        }
      `}</style>
    </div>
  );
};
