import { useMemo, useState } from 'react';
import { Icon, type IconName } from '../components/Icons';
import { clockParts } from '../lib/format';
import { useNow } from '../state/clock';
import { invitationsForMe } from '../state/selectors';
import { useStore } from '../state/store';
import { LogoMark } from './Logo';
import { Onboarding } from './onboarding/Onboarding';
import { Welcome } from './onboarding/Welcome';
import { PhoneUIContext, type PalsView, type PhoneUI, type SheetState, type Tab } from './PhoneUI';
import { RingLayer } from './ringing/RingLayer';
import { SheetHost } from './sheets/Sheets';
import { AlarmsTab } from './tabs/AlarmsTab';
import { HomeTab } from './tabs/HomeTab';
import { PalsTab } from './tabs/PalsTab';
import { ProfileTab } from './tabs/ProfileTab';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'alarms', label: 'Alarms', icon: 'alarm' },
  { id: 'pals', label: 'Pals', icon: 'pals' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

export function Phone({ compact }: { compact: boolean }) {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [palsView, setPalsView] = useState<PalsView>('group');
  const [sheet, setSheet] = useState<SheetState | null>(null);

  const ui: PhoneUI = useMemo(
    () => ({ tab, setTab, palsView, setPalsView, openSheet: setSheet, closeSheet: () => setSheet(null) }),
    [tab, palsView],
  );

  const ready = state.signedIn && state.step === 'done' && state.bellpal !== null;
  const badges: Partial<Record<Tab, number>> = { pals: invitationsForMe(state).length + state.incoming.length };

  return (
    <PhoneUIContext.Provider value={ui}>
      <div className={`phone${compact ? ' is-compact' : ''}`}>
        <div className="app">
          {!compact && <StatusBar />}
          <main className="app-main" key={ready ? tab : state.signedIn ? state.step : 'welcome'}>
            {!state.signedIn ? <Welcome /> : !ready ? <Onboarding /> : <TabContent tab={tab} />}
          </main>
          {ready && (
            <nav className="tabbar" aria-label="Main">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={t.id === tab ? 'on' : ''}
                  aria-current={t.id === tab ? 'page' : undefined}
                  onClick={() => {
                    setTab(t.id);
                    setSheet(null);
                  }}
                >
                  <Icon name={t.icon} />
                  {t.label}
                  {badges[t.id] ? <span className="badge">{badges[t.id]}</span> : null}
                </button>
              ))}
            </nav>
          )}
          {ready && sheet && <SheetHost sheet={sheet} />}
          {ready && <RingLayer />}
          <Banners />
          <Toasts />
        </div>
      </div>
    </PhoneUIContext.Provider>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'home':
      return <HomeTab />;
    case 'alarms':
      return <AlarmsTab />;
    case 'pals':
      return <PalsTab />;
    case 'profile':
      return <ProfileTab />;
  }
}

function StatusBar() {
  const now = useNow();
  const { hm } = clockParts(now);
  return (
    <div className="status-bar" aria-hidden="true">
      <span>{hm}</span>
      <span className="status-icons">
        <i />
        <i />
        <i />
        <b />
      </span>
    </div>
  );
}

function Banners() {
  const { state, dispatch } = useStore();
  if (state.banners.length === 0) return null;
  return (
    <div className="banners" aria-live="polite">
      {state.banners.map((b) => (
        <button key={b.id} type="button" className="banner" onClick={() => dispatch({ type: 'dismissBanner', id: b.id })}>
          <LogoMark className="banner-icon" />
          <span className="banner-text">
            <span className="banner-app">
              BellPals <span>now</span>
            </span>
            <strong>{b.title}</strong>
            <span>{b.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function Toasts() {
  const { state } = useStore();
  if (state.toasts.length === 0) return null;
  return (
    <div className="toasts" role="status">
      {state.toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.title}
        </div>
      ))}
    </div>
  );
}
