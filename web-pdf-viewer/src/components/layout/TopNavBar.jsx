import React, { useState, useEffect } from 'react';
import { Home, FileText, Wrench, LayoutTemplate, Search, Crown, Sun, Moon } from 'lucide-react';

export const TopNavBar = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const tabs = [
    { name: 'Home', icon: <Home size={16} /> },
    { name: 'Documents', icon: <FileText size={16} /> },
    { name: 'Tools', icon: <Wrench size={16} /> },
    { name: 'Templates', icon: <LayoutTemplate size={16} /> }
  ];

  return (
    <div className="glass-panel" style={{ 
      height: '64px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 24px', 
      margin: '16px 16px 8px 16px',
      zIndex: 10 
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>PaperFlow</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)', marginLeft: '4px' }}>PDF Editor</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <button 
              key={tab.name} 
              className="nav-tab" 
              onClick={() => {
                if (tab.name !== 'Home') {
                  alert(`${tab.name} section is not available in this demo.`);
                } else {
                  setActiveTab(tab.name);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}>
              {tab.icon}
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div className="search-bar" style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'var(--color-bg-panel)', 
          padding: '8px 12px', 
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          width: '240px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
          transition: 'var(--transition-fast)'
        }}>
          <Search size={16} color="var(--color-text-secondary)" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                alert("Search functionality is not available in this local demo.");
                e.target.value = '';
              }
            }}
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '13px', color: 'var(--color-text-primary)' }}
          />
          <div style={{ display: 'flex', gap: '2px', color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ background: 'var(--color-bg-panel-hover)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>⌘</span>
            <span style={{ background: 'var(--color-bg-panel-hover)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>K</span>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--color-bg-panel)',
            border: '1px solid var(--color-border)',
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-text-secondary)',
            transition: 'var(--transition-fast)'
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Upgrade Button */}
        <button 
          onClick={() => alert("Pro upgrade isn't available in this demo")}
          style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'linear-gradient(135deg, var(--color-primary), #d946ef)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
          transition: 'transform var(--transition-fast)'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <Crown size={16} />
          Upgrade Pro
        </button>

        {/* Avatar */}
        <div 
          onClick={() => alert("Profile settings are not available in this local demo.")}
          style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          P
        </div>
      </div>
    </div>
  );
};
