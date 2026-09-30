import { useEffect, useState } from 'react';
import { DemoPanel, Gallery, GroupSimulator, Intro } from './demo/Demo';
import { unlockAudio } from './lib/audio';
import { useMediaQuery } from './lib/useMediaQuery';
import { Phone } from './phone/Phone';
import { ClockProvider } from './state/clock';
import { Engine } from './state/engine';
import { StoreProvider } from './state/store';

export function App() {
  return (
    <StoreProvider>
      <ClockProvider>
        <Engine />
        <Stage />
      </ClockProvider>
    </StoreProvider>
  );
}

function Stage() {
  const compact = useMediaQuery('(max-width: 760px)');
  const [gallery, setGallery] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // Browsers only allow sound after the first tap or click.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  if (compact) {
    return (
      <div className="stage compact">
        <Phone compact />
        <button type="button" className="demo-fab" onClick={() => setDemoOpen(true)} aria-haspopup="dialog">
          Demo
        </button>
        {demoOpen && (
          <div className="demo-sheet-backdrop" onClick={() => setDemoOpen(false)}>
            <div className="demo-sheet" role="dialog" aria-modal="true" aria-label="Prototype controls" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="demo-btn close" onClick={() => setDemoOpen(false)}>
                Back to the app
              </button>
              <DemoPanel
                onOpenGallery={() => {
                  setDemoOpen(false);
                  setGallery(true);
                }}
              />
              <GroupSimulator />
              <Intro />
            </div>
          </div>
        )}
        {gallery && <Gallery onClose={() => setGallery(false)} />}
      </div>
    );
  }

  return (
    <div className="stage">
      <aside className="side left">
        <Intro />
        <DemoPanel onOpenGallery={() => setGallery(true)} />
      </aside>
      <div className="device">
        <Phone compact={false} />
      </div>
      <aside className="side right">
        <GroupSimulator />
      </aside>
      {gallery && <Gallery onClose={() => setGallery(false)} />}
    </div>
  );
}
