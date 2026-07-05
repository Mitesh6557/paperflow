import React from 'react';
import { PdfViewer } from './components/viewer/PdfViewer';
import { useViewerStore } from './store/viewerStore';

import { TopNavBar } from './components/layout/TopNavBar';
import { Toolbar } from './components/layout/Toolbar/Toolbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { StatusBar } from './components/layout/StatusBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLocalStoragePersist } from './hooks/useLocalStoragePersist';

function App() {
  const pdfDocument = useViewerStore(state => state.pdfDocument);
  useKeyboardShortcuts();
  useLocalStoragePersist();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <TopNavBar />
      <Toolbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '0 16px', gap: '16px' }}>
        <LeftSidebar />

        {/* Main Viewer Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <PdfViewer />
        </div>

        <RightSidebar />
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
