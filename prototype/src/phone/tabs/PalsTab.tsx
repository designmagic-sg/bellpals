import { Icon } from '../../components/Icons';
import { Button, Chip, PalAvatar, Segmented } from '../../components/ui';
import { canInvite, seatsLeft, type Group } from '../../domain/groups';
import { MAX_GROUP_MEMBERS } from '../../domain/rules';
import { nextAlarmLabel, plural } from '../../lib/format';
import { useNow } from '../../state/clock';
import { groupOf, invitationsForMe, memberView } from '../../state/selectors';
import { ME, firstName, myGroupOf, useStore } from '../../state/store';
import { usePhoneUI } from '../PhoneUI';

export function PalsTab() {
  const { state } = useStore();
  const ui = usePhoneUI();
  const invites = invitationsForMe(state).length;

  return (
    <div className="screen pals">
      <header className="screen-head">
        <h1>Pals</h1>
      </header>
      <Segmented
        label="Pals"
        value={ui.palsView}
        onChange={ui.setPalsView}
        options={[
          { value: 'group', label: 'My group', badge: invites },
          { value: 'friends', label: 'Friends', badge: state.incoming.length },
        ]}
      />
      {ui.palsView === 'group' ? <GroupPanel /> : <FriendsPanel />}
    </div>
  );
}

function GroupPanel() {
  const { state } = useStore();
  const now = useNow();
  const ui = usePhoneUI();
  const group = myGroupOf(state);

  if (!group) return <NoGroup />;

  const isOwner = group.ownerId === ME;
  const seats = seatsLeft(group);
  return (
    <div className="stack">
      <section className="card group-card">
        <div className="group-title">
          <h2>{group.name}</h2>
          <Chip>
            {group.memberIds.length} of {MAX_GROUP_MEMBERS}
          </Chip>
        </div>
        <ul className="member-list">
          {group.memberIds.map((id) => {
            const m = memberView(state, id);
            if (!m) return null;
            return (
              <li key={id} className="member-row">
                <PalAvatar species={m.species} level={m.level} />
                <div className="member-text">
                  <strong>
                    {m.isMe ? `${m.fullName} (you)` : m.fullName}
                    {group.ownerId === id && (
                      <span className="owner-badge" title="Group owner">
                        <Icon name="crown" /> Owner
                      </span>
                    )}
                  </strong>
                  <small>Next alarm: {nextAlarmLabel(m.alarms, now)}</small>
                </div>
              </li>
            );
          })}
          {group.invitedIds.map((id) => (
            <li key={id} className="member-row pending">
              <span className="pending-avatar" aria-hidden="true">
                ?
              </span>
              <div className="member-text">
                <strong>{state.people[id]?.fullName ?? 'Invited friend'}</strong>
                <small>Invitation sent</small>
              </div>
              <Chip tone="warn">Pending</Chip>
            </li>
          ))}
        </ul>
        {seats > 0 ? (
          <Button variant="secondary" onClick={() => ui.openSheet({ kind: 'invite' })}>
            <Icon name="plus" />
            Invite friends ({plural(seats, 'seat')} left)
          </Button>
        ) : (
          <p className="small muted center">This group is full.</p>
        )}
      </section>

      <HowItWorks />

      {isOwner ? (
        <Button variant="danger-ghost" onClick={() => ui.openSheet({ kind: 'deleteGroup' })}>
          <Icon name="trash" />
          Delete group
        </Button>
      ) : (
        <Button variant="danger-ghost" onClick={() => ui.openSheet({ kind: 'leaveGroup' })}>
          <Icon name="logout" />
          Leave group
        </Button>
      )}
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="card how">
      <span className="label">How your group works</span>
      <ol className="how-list">
        <li>When anyone's alarm rings, everyone else's phone rings 24 s later.</li>
        <li>It keeps ringing for everyone until that person turns it off by feeding their BellPal.</li>
        <li>They can snooze once. The second ring starts on every phone at the same time.</li>
        <li>Everyone gets a heads-up 5 minutes and 1 minute before each alarm.</li>
      </ol>
    </section>
  );
}

function NoGroup() {
  const { state } = useStore();
  const ui = usePhoneUI();
  const invites = invitationsForMe(state);
  return (
    <div className="stack">
      {invites.map((g) => (
        <InviteCard key={g.id} group={g} />
      ))}
      <section className="card empty-group">
        <h2>Start a pal group</h2>
        <p className="small muted">Up to {MAX_GROUP_MEMBERS} friends. When anyone sleeps through their alarm, the whole group hears about it.</p>
        <Button onClick={() => ui.openSheet({ kind: 'createGroup' })}>Create a group</Button>
      </section>
      <HowItWorks />
    </div>
  );
}

function InviteCard({ group }: { group: Group }) {
  const { state, dispatch } = useStore();
  const now = useNow();
  const owner = memberView(state, group.ownerId);
  return (
    <section className="card invite-card">
      <div className="invite-head">
        {owner && <PalAvatar species={owner.species} level={owner.level} size={52} />}
        <div>
          <small className="muted">{firstName(state, group.ownerId)} invited you to join</small>
          <h2>{group.name}</h2>
        </div>
      </div>
      <ul className="invite-members">
        {group.memberIds.map((id) => {
          const m = memberView(state, id);
          return m ? (
            <li key={id}>
              <PalAvatar species={m.species} level={m.level} size={30} />
              <span>{m.firstName}</span>
              <span className="muted">{nextAlarmLabel(m.alarms, now)}</span>
            </li>
          ) : null;
        })}
      </ul>
      <p className="small muted">Your phone will ring when any of them sleeps through an alarm, and theirs will ring for yours.</p>
      <div className="btn-row">
        <Button variant="secondary" onClick={() => dispatch({ type: 'answerInvitation', groupId: group.id, accept: false, now: Date.now() })}>
          Decline
        </Button>
        <Button onClick={() => dispatch({ type: 'answerInvitation', groupId: group.id, accept: true, now: Date.now() })}>Join group</Button>
      </div>
    </section>
  );
}

function FriendsPanel() {
  const { state, dispatch } = useStore();
  const ui = usePhoneUI();
  const group = myGroupOf(state);

  return (
    <div className="stack">
      <Button onClick={() => ui.openSheet({ kind: 'addFriends' })}>
        <Icon name="book" />
        Add friends from contacts
      </Button>

      {state.incoming.length > 0 && (
        <section>
          <span className="label">Friend requests</span>
          <ul className="person-list">
            {state.incoming.map((id) => {
              const m = memberView(state, id);
              return m ? (
                <li key={id} className="person-row">
                  <PalAvatar species={m.species} level={m.level} size={40} />
                  <div className="person-text">
                    <strong>{m.fullName}</strong>
                    <small>@{m.username}</small>
                  </div>
                  <div className="row-actions">
                    <Button small block={false} variant="secondary" onClick={() => dispatch({ type: 'answerFriendRequest', userId: id, accept: false, now: Date.now() })}>
                      Decline
                    </Button>
                    <Button small block={false} onClick={() => dispatch({ type: 'answerFriendRequest', userId: id, accept: true, now: Date.now() })}>
                      Accept
                    </Button>
                  </div>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      {state.outgoing.length > 0 && (
        <section>
          <span className="label">Requests sent</span>
          <ul className="person-list">
            {state.outgoing.map((id) => (
              <li key={id} className="person-row">
                <span className="pending-avatar" aria-hidden="true">
                  ?
                </span>
                <div className="person-text">
                  <strong>{state.people[id]?.fullName}</strong>
                  <small>Waiting for them to accept</small>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <span className="label">Friends · {state.friends.length}</span>
        <ul className="person-list">
          {state.friends.map((id) => {
            const m = memberView(state, id);
            if (!m) return null;
            let status;
            if (group?.memberIds.includes(id)) status = <Chip tone="ok">In your group</Chip>;
            else if (group?.invitedIds.includes(id)) status = <Chip tone="warn">Invited</Chip>;
            else if (group && canInvite(group, ME, id, state.friends).ok && !groupOf(state, id))
              status = (
                <Button small block={false} variant="secondary" onClick={() => dispatch({ type: 'invite', userId: id, now: Date.now() })}>
                  Invite
                </Button>
              );
            else if (groupOf(state, id)) status = <Chip tone="muted">In a group</Chip>;
            return (
              <li key={id} className="person-row">
                <PalAvatar species={m.species} level={m.level} size={40} />
                <div className="person-text">
                  <strong>{m.fullName}</strong>
                  <small>@{m.username}</small>
                </div>
                {status}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
