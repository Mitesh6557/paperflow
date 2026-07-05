import React, { useState } from 'react';
import { Settings, ChevronUp, ChevronDown, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Info, Plus } from 'lucide-react';
import { useAnnotationStore } from '../../store/annotationStore';
import { useHistoryStore } from '../../store/historyStore';
import { updateAnnotationCommand } from '../../models/Command';

export const RightSidebar = () => {
  const selectedId = useAnnotationStore(state => state.selectedAnnotationId);
  const annotations = useAnnotationStore(state => state.annotations);
  const currentStyle = useAnnotationStore(state => state.currentStyle);
  const setCurrentStyle = useAnnotationStore(state => state.setCurrentStyle);
  const updateAnnotation = useAnnotationStore(state => state.updateAnnotation);
  const executeCommand = useHistoryStore(state => state.executeCommand);
  
  const [sliderStartStyle, setSliderStartStyle] = useState(null);
  const [sectionsExpanded, setSectionsExpanded] = useState({ appearance: true, text: true });

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedAnn = annotations.find(a => a.id === selectedId);
  const style = selectedAnn ? selectedAnn.style : currentStyle;
  
  const handleStyleChange = (updates) => {
    setCurrentStyle(updates);
    
    if (selectedId && selectedAnn) {
      const origStyle = { ...selectedAnn.style };
      const newStyle = { ...origStyle, ...updates };
      const cmd = updateAnnotationCommand(useAnnotationStore, selectedId, { style: origStyle }, { style: newStyle });
      executeCommand(cmd);
    }
  };

  const handleStyleLive = (updates) => {
    setCurrentStyle(updates);
    if (selectedId) updateAnnotation(selectedId, { style: updates });
  };

  const handleStyleCommit = (updates) => {
    if (selectedId && selectedAnn && sliderStartStyle) {
      const newStyle = { ...sliderStartStyle, ...updates };
      const cmd = updateAnnotationCommand(useAnnotationStore, selectedId, { style: sliderStartStyle }, { style: newStyle });
      executeCommand(cmd);
    }
    setSliderStartStyle(null);
  };

  const colors = ['transparent', '#ffffff', '#0f172a', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  const strokeWidths = [1, 2, 4, 8];

  const renderColorOptions = (prop) => (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', background: 'var(--color-bg-panel)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
      {colors.map(color => (
        <button 
          key={color}
          onClick={() => handleStyleChange({ [prop]: color })}
          aria-label={`Select color ${color}`}
          title={`Color ${color}`}
          style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '4px', 
            background: color === 'transparent' ? 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==)' : color,
            border: `1px solid ${style[prop] === color ? 'var(--color-primary)' : 'var(--color-border)'}`,
            cursor: 'pointer',
            padding: 0
          }} 
        />
      ))}
      <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '4px', border: '1px solid var(--color-border)', overflow: 'hidden', cursor: 'pointer' }} title="Custom Color">
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-panel)', pointerEvents: 'none' }}>
           <Plus size={12} color="var(--color-text-secondary)" />
        </div>
        <input 
          type="color" 
          value={style[prop] === 'transparent' ? '#000000' : style[prop] || '#000000'}
          onChange={(e) => handleStyleChange({ [prop]: e.target.value })}
          style={{ position: 'absolute', inset: -8, width: '36px', height: '36px', opacity: 0, cursor: 'pointer' }}
          aria-label="Custom Color Picker"
        />
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ 
      width: '280px', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      position: 'relative',
      zIndex: 10,
      margin: '0 16px 16px 0'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          <Settings size={16} color="var(--color-text-secondary)" />
          Properties
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        
        {!selectedId ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-secondary)' }}>
             <Info size={32} style={{ marginBottom: '16px', color: 'var(--color-border)' }} />
             <p style={{ fontSize: '13px' }}>Select an annotation to edit its properties</p>
          </div>
        ) : (
          <>
            {/* Appearance Section */}
            <div style={{ marginBottom: '24px' }}>
              <div 
                onClick={() => toggleSection('appearance')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
                aria-label="Toggle Appearance section"
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Appearance</span>
                {sectionsExpanded.appearance ? <ChevronUp size={16} color="var(--color-text-secondary)" /> : <ChevronDown size={16} color="var(--color-text-secondary)" />}
              </div>

              {sectionsExpanded.appearance && (
                <div style={{ animation: 'fadeIn var(--transition-fast)' }}>
                  {/* Opacity */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                      <span>Opacity</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{Math.round((style.opacity || 1) * 100)}%</span>
                    </div>
                    <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="range" 
                        min="0.1" max="1" step="0.1"
                        value={style.opacity || 1}
                        onPointerDown={() => { if (selectedAnn) setSliderStartStyle({ ...selectedAnn.style }); }}
                        onChange={(e) => handleStyleLive({ opacity: parseFloat(e.target.value) })}
                        onPointerUp={(e) => handleStyleCommit({ opacity: parseFloat(e.target.value) })}
                        className="custom-slider"
                        aria-label="Opacity Slider"
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Fill</span>
                    {renderColorOptions('fillColor')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Stroke</span>
                    {renderColorOptions('strokeColor')}
                  </div>

                  {/* Stroke Width */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                      <span>Stroke Width</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{style.strokeWidth || 2} pt</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {strokeWidths.map(w => (
                        <button 
                          key={w}
                          onClick={() => handleStyleChange({ strokeWidth: w })}
                          style={{ 
                            flex: 1, 
                            padding: '4px', 
                            background: style.strokeWidth === w ? 'var(--color-primary-light)' : 'var(--color-bg-panel)', 
                            border: `1px solid ${style.strokeWidth === w ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: style.strokeWidth === w ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            transition: 'var(--transition-fast)'
                          }}
                          aria-label={`Stroke width ${w}pt`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stroke Style */}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>Stroke Style</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => handleStyleChange({ strokeStyle: 'solid' })}
                        aria-label="Solid stroke"
                        style={{ flex: 1, padding: '8px', background: style.strokeStyle === 'solid' ? 'var(--color-primary-light)' : 'var(--color-bg-panel)', border: `1px solid ${style.strokeStyle === 'solid' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                        <div style={{ width: '100%', height: '2px', background: style.strokeStyle === 'solid' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                      </button>
                      <button 
                        onClick={() => handleStyleChange({ strokeStyle: 'dashed' })}
                        aria-label="Dashed stroke"
                        style={{ flex: 1, padding: '8px', background: style.strokeStyle === 'dashed' ? 'var(--color-primary-light)' : 'var(--color-bg-panel)', border: `1px solid ${style.strokeStyle === 'dashed' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                        <div style={{ width: '100%', borderBottom: `2px dashed ${style.strokeStyle === 'dashed' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}` }} />
                      </button>
                      <button 
                        onClick={() => handleStyleChange({ strokeStyle: 'dotted' })}
                        aria-label="Dotted stroke"
                        style={{ flex: 1, padding: '8px', background: style.strokeStyle === 'dotted' ? 'var(--color-primary-light)' : 'var(--color-bg-panel)', border: `1px solid ${style.strokeStyle === 'dotted' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                        <div style={{ width: '100%', borderBottom: `2px dotted ${style.strokeStyle === 'dotted' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}` }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 -16px 24px -16px' }} />

            {/* Text Section */}
            <div style={{ marginBottom: '24px' }}>
              <div 
                onClick={() => toggleSection('text')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
                aria-label="Toggle Text section"
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Text</span>
                {sectionsExpanded.text ? <ChevronUp size={16} color="var(--color-text-secondary)" /> : <ChevronDown size={16} color="var(--color-text-secondary)" />}
              </div>

              {sectionsExpanded.text && (
                <div style={{ animation: 'fadeIn var(--transition-fast)' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <select 
                      style={{ flex: 2, background: 'var(--color-bg-panel)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', appearance: 'none' }}
                      value="Arial"
                      readOnly
                      aria-label="Font Family"
                    >
                      <option value="Arial">Arial</option>
                      {/* Can add more fonts here later */}
                    </select>
                    
                    <input 
                      type="number" 
                      value={style.fontSize || 16}
                      onFocus={() => { if (selectedAnn) setSliderStartStyle({ ...selectedAnn.style }); }}
                      onChange={(e) => handleStyleLive({ fontSize: parseInt(e.target.value) || 16 })}
                      onBlur={(e) => handleStyleCommit({ fontSize: parseInt(e.target.value) || 16 })}
                      style={{ flex: 1, background: 'var(--color-bg-panel)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '6px', fontSize: '12px', width: '60px' }}
                      aria-label="Font Size"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 3, display: 'flex', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <button 
                        onClick={() => handleStyleChange({ bold: !style.bold })}
                        aria-label="Toggle Bold"
                        style={{ flex: 1, padding: '6px', background: style.bold ? 'var(--color-primary-light)' : 'transparent', border: 'none', borderRight: '1px solid var(--color-border)', cursor: 'pointer', color: style.bold ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'var(--transition-fast)' }}><Bold size={14} /></button>
                      <button 
                        onClick={() => handleStyleChange({ italic: !style.italic })}
                        aria-label="Toggle Italic"
                        style={{ flex: 1, padding: '6px', background: style.italic ? 'var(--color-primary-light)' : 'transparent', border: 'none', cursor: 'pointer', color: style.italic ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'var(--transition-fast)' }}><Italic size={14} /></button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '16px' }}>
                    <button onClick={() => handleStyleChange({ align: 'left' })} aria-label="Align Left" style={{ flex: 1, padding: '8px', background: style.align === 'left' || !style.align ? 'var(--color-primary-light)' : 'transparent', border: 'none', borderRight: '1px solid var(--color-border)', cursor: 'pointer', color: style.align === 'left' || !style.align ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'var(--transition-fast)' }}><AlignLeft size={16} /></button>
                    <button onClick={() => handleStyleChange({ align: 'center' })} aria-label="Align Center" style={{ flex: 1, padding: '8px', background: style.align === 'center' ? 'var(--color-primary-light)' : 'transparent', border: 'none', borderRight: '1px solid var(--color-border)', cursor: 'pointer', color: style.align === 'center' ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'var(--transition-fast)' }}><AlignCenter size={16} /></button>
                    <button onClick={() => handleStyleChange({ align: 'right' })} aria-label="Align Right" style={{ flex: 1, padding: '8px', background: style.align === 'right' ? 'var(--color-primary-light)' : 'transparent', border: 'none', cursor: 'pointer', color: style.align === 'right' ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'var(--transition-fast)' }}><AlignRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ height: '1px', background: 'var(--color-border)', margin: '0 -16px 24px -16px' }} />

        {/* More Options Section (Always Visible) */}
        <div>
          <div 
            onClick={() => toggleSection('moreOptions')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
            aria-label="Toggle More Options section"
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>More Options</span>
            {sectionsExpanded.moreOptions ? <ChevronUp size={16} color="var(--color-text-secondary)" /> : <ChevronDown size={16} color="var(--color-text-secondary)" />}
          </div>

          {sectionsExpanded.moreOptions !== false && (
            <div style={{ animation: 'fadeIn var(--transition-fast)' }}>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all annotations? This cannot be undone.")) {
                    useAnnotationStore.getState().clearAll();
                    useHistoryStore.getState().clearHistory();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--color-bg-panel)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--color-danger)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-panel)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
              >
                Clear All Annotations
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .custom-slider {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
          cursor: pointer;
        }
        
        .custom-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          background: var(--color-border);
          border-radius: var(--radius-full);
          border: none;
        }
        
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          margin-top: -5px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          border: 2px solid white;
      `}</style>
    </div>
  );
};
