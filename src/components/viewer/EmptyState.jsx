import React, { useRef, useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { File, Plus, FileText, CheckCircle2, ChevronDown, FolderOpen } from 'lucide-react';
import { loadPdfFromFile } from '../../utils/pdfLoader';

export const EmptyState = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please drop a valid PDF file.");
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      }
    }
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        className="glass-panel"
        style={{
          width: '500px',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-primary-light)'}`,
          backgroundColor: isDragging ? 'var(--color-bg-panel)' : 'var(--surface-glass)',
          boxShadow: isDragging ? '0 0 20px rgba(124, 58, 237, 0.2)' : 'var(--shadow-sm)',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        {/* PDF Icon with Badge */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={{ 
            width: '80px', height: '100px', 
            background: 'linear-gradient(135deg, var(--color-bg-panel), var(--color-bg-panel-hover))', 
            borderRadius: '8px 24px 8px 8px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
              PDF
            </div>
          </div>
          <div style={{ 
            position: 'absolute', bottom: '-8px', right: '-8px',
            background: 'var(--color-primary)', color: 'white',
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(124, 58, 237, 0.3)'
          }}>
            <Plus size={16} strokeWidth={3} />
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Drop your PDF here
        </h2>
        
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
          or <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => fileInputRef.current?.click()}>click to browse files</span>
        </p>

        <input 
          type="file" 
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div style={{ display: 'flex', marginBottom: '24px' }}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), #d946ef)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px 0 0 8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <FolderOpen size={18} />
            Open PDF File
          </button>
          <button style={{
             background: 'linear-gradient(135deg, var(--color-primary-hover), #b23cc4)',
             color: 'white',
             border: 'none',
             borderLeft: '1px solid rgba(255,255,255,0.2)',
             padding: '0 12px',
             borderRadius: '0 8px 8px 0',
             cursor: 'pointer',
             display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ChevronDown size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 500 }}>
          <CheckCircle2 size={14} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Supports: PDF files up to 200MB</span>
        </div>
      </div>
    </div>
  );
};
