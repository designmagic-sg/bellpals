import { MAX_GROUP_MEMBERS } from './rules';

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  /** People invited who haven't answered yet. Invites hold a seat. */
  invitedIds: string[];
}

export type Check = { ok: true } | { ok: false; reason: string };

const ok: Check = { ok: true };
const no = (reason: string): Check => ({ ok: false, reason });

export function seatsLeft(group: Group): number {
  return MAX_GROUP_MEMBERS - group.memberIds.length - group.invitedIds.length;
}

/** Assumption: a person belongs to at most one pal group at a time. */
export function canCreateGroup(currentGroupId: string | null): Check {
  return currentGroupId ? no('Leave your current group first.') : ok;
}

/** Only friends can be invited, and only while the group has a free seat. */
export function canInvite(group: Group, inviterId: string, inviteeId: string, inviterFriends: readonly string[]): Check {
  if (!group.memberIds.includes(inviterId)) return no('Only group members can invite.');
  if (group.memberIds.includes(inviteeId)) return no('Already in this group.');
  if (group.invitedIds.includes(inviteeId)) return no('Already invited.');
  if (!inviterFriends.includes(inviteeId)) return no('Add them as a friend first.');
  if (seatsLeft(group) <= 0) return no(`Groups are limited to ${MAX_GROUP_MEMBERS} people.`);
  return ok;
}

export function canAcceptInvite(group: Group, userId: string, currentGroupId: string | null): Check {
  if (currentGroupId) return no('Leave your current group first.');
  if (!group.invitedIds.includes(userId)) return no('This invitation is no longer valid.');
  if (group.memberIds.length >= MAX_GROUP_MEMBERS) return no('This group is full.');
  return ok;
}

export function canLeave(group: Group, userId: string): Check {
  if (!group.memberIds.includes(userId)) return no('You are not in this group.');
  if (group.ownerId === userId) return no('Owners delete the group instead of leaving it.');
  return ok;
}

export function canDelete(group: Group, userId: string): Check {
  return group.ownerId === userId ? ok : no('Only the owner can delete this group.');
}

export function acceptInvite(group: Group, userId: string): Group {
  return {
    ...group,
    memberIds: [...group.memberIds, userId],
    invitedIds: group.invitedIds.filter((id) => id !== userId),
  };
}

export function declineInvite(group: Group, userId: string): Group {
  return { ...group, invitedIds: group.invitedIds.filter((id) => id !== userId) };
}

export function removeMember(group: Group, userId: string): Group {
  return { ...group, memberIds: group.memberIds.filter((id) => id !== userId) };
}
