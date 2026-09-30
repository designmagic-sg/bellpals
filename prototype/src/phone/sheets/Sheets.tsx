import { useState } from 'react';
import { Icon } from '../../components/Icons';
import { TimeWheel } from '../../components/TimeWheel';
import { Button, Chip, DayPicker, PalAvatar, Segmented, Sheet } from '../../components/ui';
import { formName } from '../../data/bellpals';
import { canInvite, seatsLeft } from '../../domain/groups';
import {
  MAX_GROUP_MEMBERS,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
  daysReplaced,
  formatClockTime,
  stageForLevel,
  toClockTime,
  type Weekday,
} from '../../domain/rules';
import { describeDays, plural } from '../../lib/format';
import { checkUsername } from '../../lib/username';
import { groupOf, memberView } from '../../state/selectors';
import { CONTACTS, ME, firstName, myGroupOf, useStore } from '../../state/store';
import { usePhoneUI, type SheetState } from '../PhoneUI';

export function SheetHost({ sheet }: { sheet: SheetState }) {
  const ui = usePhoneUI();
  const close = ui.closeSheet;
  switch (sheet.kind) {
    case 'alarm':
      return <AlarmEditorSheet day={sheet.day} onClose={close} />;
    case 'createGroup':
      return <CreateGroupSheet onClose={close} />;
    case 'invite':
      return <InviteSheet onClose={close} />;
    case 'addFriends':
      return <AddFriendsSheet onClose={close} />;
    case 'editProfile':
      return <EditProfileSheet onClose={close} />;
    case 'deleteAccount':
      return <DeleteAccountSheet onClose={close} />;
    case 'leaveGroup':
      return <LeaveGroupSheet onClose={close} />;
    case 'deleteGroup':
      return <DeleteGroupSheet onClose={close} />;
  }
}

function AlarmEditorSheet({ day, onClose }: { day?: Weekday; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const existing = day !== undefined ? state.alarms[day] : undefined;
  const [time, setTime] = useState(existing?.time ?? toClockTime(7, 0, 'AM'));
  const [days, setDays] = useState<Weekday[]>(day !== undefined ? [day] : [1, 2, 3, 4, 5]);
  const replaced = daysReplaced(state.alarms, days, time).filter((d) => d !== day);

  const save = () => {
    dispatch({ type: 'setAlarm', days, time });
    onClose();
  };

  return (
    <Sheet
      title={existing && day !== undefined ? `${WEEKDAY_NAMES[day]} alarm` : 'Set alarm'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={save} disabled={days.length === 0}>
            Save
          </Button>
          {existing && day !== undefined && (
            <Button
              variant="danger-ghost"
              onClick={() => {
                dispatch({ type: 'removeAlarm', day });
                onClose();
              }}
            >
              Delete {WEEKDAY_NAMES[day]} alarm
            </Button>
          )}
        </>
      }
    >
      <TimeWheel value={time} onChange={setTime} />
      <span className="label">Days</span>
      <DayPicker value={days} onChange={setDays} />
      <p className="summary">{days.length ? `${describeDays(days)} at ${formatClockTime(time)}` : 'Pick at least one day.'}</p>
      {replaced.length > 0 && (
        <p className="notice">
          <Icon name="info" />
          <span>
            One alarm per day, so this replaces {replaced.map((d) => `${WEEKDAY_SHORT[d]} ${formatClockTime(state.alarms[d]!.time)}`).join(', ')}.
          </span>
        </p>
      )}
    </Sheet>
  );
}

function CreateGroupSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const ui = usePhoneUI();
  const [name, setName] = useState(`${state.profile.fullName.split(' ')[0]}'s Pals`);
  const valid = name.trim().length >= 2 && name.trim().length <= 30;

  return (
    <Sheet
      title="Create a pal group"
      onClose={onClose}
      footer={
        <Button
          disabled={!valid}
          onClick={() => {
            dispatch({ type: 'createGroup', name: name.trim(), now: Date.now() });
            ui.setPalsView('group');
            ui.setTab('pals');
            ui.openSheet({ kind: 'invite' });
          }}
        >
          Create group
        </Button>
      }
    >
      <label className="field">
        <span>Group name</span>
        <input className="input" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
      </label>
      <p className="small muted">You'll be the owner. Up to {MAX_GROUP_MEMBERS} people, including you. Only the owner can delete the group.</p>
    </Sheet>
  );
}

function InviteSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const ui = usePhoneUI();
  const group = myGroupOf(state);
  if (!group) return null;
  const seats = seatsLeft(group);

  return (
    <Sheet title={`Invite to ${group.name}`} onClose={onClose}>
      <p className="small muted">
        {plural(seats, 'seat')} left of {MAX_GROUP_MEMBERS}. You can invite friends only.
      </p>
      <ul className="person-list">
        {state.friends.map((id) => {
          const m = memberView(state, id);
          if (!m) return null;
          const inGroup = group.memberIds.includes(id);
          const invited = group.invitedIds.includes(id);
          const elsewhere = !inGroup && groupOf(state, id);
          const check = canInvite(group, ME, id, state.friends);
          return (
            <li key={id} className="person-row">
              <PalAvatar species={m.species} level={m.level} size={40} />
              <div className="person-text">
                <strong>{m.fullName}</strong>
                <small>{elsewhere ? `Already in ${elsewhere.name}` : !check.ok && !inGroup && !invited ? check.reason : `@${m.username}`}</small>
              </div>
              {inGroup ? (
                <Chip tone="ok">In group</Chip>
              ) : invited ? (
                <Chip tone="warn">Invited</Chip>
              ) : (
                <Button small block={false} disabled={!check.ok || Boolean(elsewhere)} onClick={() => dispatch({ type: 'invite', userId: id, now: Date.now() })}>
                  Invite
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <button type="button" className="link-btn" onClick={() => ui.openSheet({ kind: 'addFriends' })}>
        Not here? Add them as a friend first.
      </button>
    </Sheet>
  );
}

function AddFriendsSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [view, setView] = useState<'contacts' | 'username'>('contacts');
  const [query, setQuery] = useState('');

  const action = (userId: string) => {
    if (state.friends.includes(userId)) return <Chip tone="ok">Friends</Chip>;
    if (state.outgoing.includes(userId)) return <Chip tone="warn">Requested</Chip>;
    if (state.incoming.includes(userId))
      return (
        <Button small block={false} onClick={() => dispatch({ type: 'answerFriendRequest', userId, accept: true, now: Date.now() })}>
          Accept
        </Button>
      );
    return (
      <Button small block={false} onClick={() => dispatch({ type: 'sendFriendRequest', userId, now: Date.now() })}>
        Add
      </Button>
    );
  };

  const onBellPals = CONTACTS.filter((c) => c.userId);
  const notYet = CONTACTS.filter((c) => !c.userId);
  const q = query.trim().toLowerCase().replace(/^@/, '');
  const results = q
    ? Object.values(state.people).filter((p) => p.username.includes(q) || p.fullName.toLowerCase().includes(q))
    : [];

  return (
    <Sheet title="Add friends" onClose={onClose}>
      <Segmented
        label="Add friends by"
        value={view}
        onChange={setView}
        options={[
          { value: 'contacts', label: 'Contacts' },
          { value: 'username', label: 'Username' },
        ]}
      />
      {view === 'contacts' ? (
        !state.contactsAllowed ? (
          <div className="primer">
            <span className="primer-icon">
              <Icon name="book" />
            </span>
            <h3>Find friends in your contacts</h3>
            <p className="small muted">BellPals checks which of your contacts already use the app. Your contacts aren't uploaded or stored.</p>
            <Button onClick={() => dispatch({ type: 'allowContacts' })}>Allow access to contacts</Button>
            <p className="small muted">Prototype: this uses sample contacts.</p>
          </div>
        ) : (
          <>
            <span className="label">On BellPals</span>
            <ul className="person-list">
              {onBellPals.map((c) => {
                const m = memberView(state, c.userId!);
                return m ? (
                  <li key={c.id} className="person-row">
                    <PalAvatar species={m.species} level={m.level} size={40} />
                    <div className="person-text">
                      <strong>{c.name}</strong>
                      <small>@{m.username}</small>
                    </div>
                    {action(m.id)}
                  </li>
                ) : null;
              })}
            </ul>
            <span className="label">Invite to BellPals</span>
            <ul className="person-list">
              {notYet.map((c) => (
                <li key={c.id} className="person-row">
                  <span className="pending-avatar" aria-hidden="true">
                    {c.name[0]}
                  </span>
                  <div className="person-text">
                    <strong>{c.name}</strong>
                    <small>Not on BellPals yet</small>
                  </div>
                  <Button small block={false} variant="secondary" onClick={() => dispatch({ type: 'toast', text: `Invite link ready to send to ${c.name} (simulated)`, now: Date.now() })}>
                    <Icon name="share" />
                    Invite
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )
      ) : (
        <>
          <label className="field">
            <span>Search by username or name</span>
            <span className="input-prefix">
              <Icon name="search" />
              <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="@username" autoCapitalize="none" spellCheck={false} />
            </span>
          </label>
          {q && results.length === 0 && <p className="small muted">No one found for “{query}”.</p>}
          <ul className="person-list">
            {results.map((p) => (
              <li key={p.id} className="person-row">
                <PalAvatar species={p.species} level={p.level} size={40} />
                <div className="person-text">
                  <strong>{p.fullName}</strong>
                  <small>@{p.username}</small>
                </div>
                {action(p.id)}
              </li>
            ))}
          </ul>
          {!q && <p className="small muted">Try “dan” or “farah”.</p>}
        </>
      )}
    </Sheet>
  );
}

function EditProfileSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [fullName, setFullName] = useState(state.profile.fullName);
  const [username, setUsername] = useState(state.profile.username);
  const check = username === state.profile.username ? { ok: true, message: 'Your current username.' } : checkUsername(username, state.people);
  const valid = fullName.trim().length >= 2 && check.ok;

  return (
    <Sheet
      title="Edit profile"
      onClose={onClose}
      footer={
        <Button
          disabled={!valid}
          onClick={() => {
            dispatch({ type: 'updateProfile', fullName: fullName.trim(), username });
            onClose();
          }}
        >
          Save
        </Button>
      }
    >
      <label className="field">
        <span>Full name</span>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Username</span>
        <span className="input-prefix">
          <span aria-hidden="true">@</span>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} autoCapitalize="none" spellCheck={false} />
        </span>
        <small className={check.ok ? 'field-ok' : 'field-err'}>{check.message}</small>
      </label>
    </Sheet>
  );
}

function DeleteAccountSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState('');
  const group = myGroupOf(state);
  const owner = group?.ownerId === ME;
  const bp = state.bellpal;

  if (step === 1) {
    return (
      <Sheet
        title="Delete your account?"
        onClose={onClose}
        footer={
          <>
            <Button variant="danger" onClick={() => setStep(2)}>
              Continue
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Keep my account
            </Button>
          </>
        }
      >
        <p>This can't be undone. You'll lose:</p>
        <ul className="loss-list">
          {bp && <li>{formName(bp.species, stageForLevel(bp.level))} and all its progress (Lv {bp.level})</li>}
          <li>Your alarms</li>
          <li>{plural(state.friends.length, 'friend')}</li>
          {group && <li>{owner ? `${group.name}: it will be deleted for all ${group.memberIds.length} members` : `Your place in ${group.name}`}</li>}
          <li>Your Gmail and Apple ID links</li>
        </ul>
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Confirm deletion"
      onClose={onClose}
      footer={
        <Button variant="danger" disabled={typed !== 'DELETE'} onClick={() => dispatch({ type: 'deleteAccount', now: Date.now() })}>
          Delete my account
        </Button>
      }
    >
      <label className="field">
        <span>
          Type <strong>DELETE</strong> to confirm
        </span>
        <input className="input delete-input" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="DELETE" />
      </label>
    </Sheet>
  );
}

function LeaveGroupSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const group = myGroupOf(state);
  if (!group) return null;
  return (
    <Sheet
      title={`Leave ${group.name}?`}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="danger"
            onClick={() => {
              dispatch({ type: 'leaveGroup', now: Date.now() });
              onClose();
            }}
          >
            Leave group
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Stay
          </Button>
        </>
      }
    >
      <p>Your phone stops ringing for their alarms, and theirs stop ringing for yours. {firstName(state, group.ownerId)} can invite you again later.</p>
    </Sheet>
  );
}

function DeleteGroupSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const group = myGroupOf(state);
  if (!group) return null;
  return (
    <Sheet
      title={`Delete ${group.name}?`}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="danger"
            onClick={() => {
              dispatch({ type: 'deleteGroup', now: Date.now() });
              onClose();
            }}
          >
            Delete group
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <p>This removes the group for all {plural(group.memberIds.length, 'member')}. Only you, the owner, can do this.</p>
    </Sheet>
  );
}
