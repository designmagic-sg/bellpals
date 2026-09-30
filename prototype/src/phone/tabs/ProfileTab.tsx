import { AppleGlyph, GoogleGlyph, Icon } from '../../components/Icons';
import { Button, Chip, PalAvatar } from '../../components/ui';
import { formName } from '../../data/bellpals';
import { stageForLevel, treatsForLevel } from '../../domain/rules';
import { initials, plural } from '../../lib/format';
import { useStore } from '../../state/store';
import { usePhoneUI } from '../PhoneUI';

export function ProfileTab() {
  const { state, dispatch } = useStore();
  const ui = usePhoneUI();
  const { profile, bellpal } = state;

  return (
    <div className="screen profile">
      <header className="profile-head">
        <span className="avatar-initials" aria-hidden="true">
          {initials(profile.fullName)}
        </span>
        <h1>{profile.fullName}</h1>
        <p className="muted">@{profile.username}</p>
        <Button variant="secondary" small block={false} onClick={() => ui.openSheet({ kind: 'editProfile' })}>
          Edit profile
        </Button>
      </header>

      {bellpal && (
        <section className="card">
          <span className="label">Your BellPal</span>
          <div className="linked-row">
            <PalAvatar species={bellpal.species} level={bellpal.level} size={48} />
            <div>
              <strong>{formName(bellpal.species, stageForLevel(bellpal.level))}</strong>
              <small>
                Lv {bellpal.level} · {plural(treatsForLevel(bellpal.level), 'treat')} per alarm
              </small>
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <span className="label">Linked accounts</span>
        <div className="linked-row">
          <GoogleGlyph />
          <div>
            <strong>Gmail</strong>
            <small>{profile.googleEmail ?? 'Not linked'}</small>
          </div>
          {profile.googleEmail ? (
            <Chip tone="ok">Linked</Chip>
          ) : (
            <Button small block={false} variant="secondary" onClick={() => dispatch({ type: 'link', provider: 'google' })}>
              Link
            </Button>
          )}
        </div>
        <div className="linked-row">
          <AppleGlyph />
          <div>
            <strong>Apple ID</strong>
            <small>{profile.appleEmail ? 'Hide My Email' : 'Not linked'}</small>
          </div>
          {profile.appleEmail ? (
            <Chip tone="ok">Linked</Chip>
          ) : (
            <Button small block={false} variant="secondary" onClick={() => dispatch({ type: 'link', provider: 'apple' })}>
              Link
            </Button>
          )}
        </div>
      </section>

      <section className="card">
        <span className="label">Notifications</span>
        <p className="small">You get a heads-up 5 minutes and 1 minute before every alarm in your group, including your own.</p>
      </section>

      <div className="stack">
        <Button variant="secondary" onClick={() => dispatch({ type: 'signOut' })}>
          <Icon name="logout" />
          Sign out
        </Button>
        <Button variant="danger-ghost" onClick={() => ui.openSheet({ kind: 'deleteAccount' })}>
          <Icon name="trash" />
          Delete account
        </Button>
      </div>
      <p className="small muted center">BellPals prototype · v0.1</p>
    </div>
  );
}
