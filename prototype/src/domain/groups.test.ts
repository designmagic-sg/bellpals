import { describe, expect, it } from 'vitest';
import {
  acceptInvite,
  canAcceptInvite,
  canCreateGroup,
  canDelete,
  canInvite,
  canLeave,
  seatsLeft,
  type Group,
} from './groups';

const crew: Group = { id: 'g1', name: 'Morning Crew', ownerId: 'aisha', memberIds: ['aisha', 'jon', 'mei'], invitedIds: [] };

describe('inviting', () => {
  it('only allows inviting friends', () => {
    expect(canInvite(crew, 'aisha', 'priya', ['priya'])).toEqual({ ok: true });
    expect(canInvite(crew, 'aisha', 'stranger', ['priya'])).toEqual({ ok: false, reason: 'Add them as a friend first.' });
  });

  it('only lets members invite', () => {
    expect(canInvite(crew, 'priya', 'sam', ['sam']).ok).toBe(false);
  });

  it('caps a group at 5 people, counting pending invites', () => {
    const four = { ...crew, memberIds: [...crew.memberIds, 'me'] };
    expect(seatsLeft(four)).toBe(1);
    const full = { ...four, invitedIds: ['priya'] };
    expect(seatsLeft(full)).toBe(0);
    expect(canInvite(full, 'aisha', 'sam', ['sam'])).toEqual({ ok: false, reason: 'Groups are limited to 5 people.' });
  });

  it('rejects duplicate invites', () => {
    const invited = { ...crew, invitedIds: ['priya'] };
    expect(canInvite(invited, 'aisha', 'priya', ['priya']).ok).toBe(false);
    expect(canInvite(crew, 'aisha', 'jon', ['jon']).ok).toBe(false);
  });
});

describe('joining and leaving', () => {
  it('joins after accepting an invitation', () => {
    const invited = { ...crew, invitedIds: ['me'] };
    expect(canAcceptInvite(invited, 'me', null)).toEqual({ ok: true });
    expect(acceptInvite(invited, 'me')).toMatchObject({ memberIds: ['aisha', 'jon', 'mei', 'me'], invitedIds: [] });
  });

  it('requires leaving your current group first', () => {
    const invited = { ...crew, invitedIds: ['me'] };
    expect(canAcceptInvite(invited, 'me', 'other').ok).toBe(false);
    expect(canCreateGroup('other').ok).toBe(false);
    expect(canCreateGroup(null).ok).toBe(true);
  });

  it('lets members leave but not the owner', () => {
    expect(canLeave(crew, 'jon')).toEqual({ ok: true });
    expect(canLeave(crew, 'aisha').ok).toBe(false);
  });

  it('only lets the owner delete the group', () => {
    expect(canDelete(crew, 'aisha')).toEqual({ ok: true });
    expect(canDelete(crew, 'jon')).toEqual({ ok: false, reason: 'Only the owner can delete this group.' });
  });
});
