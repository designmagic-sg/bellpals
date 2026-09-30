import { createContext, useContext } from 'react';
import type { Weekday } from '../domain/rules';

export type Tab = 'home' | 'alarms' | 'pals' | 'profile';
export type PalsView = 'group' | 'friends';

export type SheetState =
  | { kind: 'alarm'; day?: Weekday }
  | { kind: 'createGroup' }
  | { kind: 'invite' }
  | { kind: 'addFriends' }
  | { kind: 'editProfile' }
  | { kind: 'deleteAccount' }
  | { kind: 'leaveGroup' }
  | { kind: 'deleteGroup' };

export interface PhoneUI {
  tab: Tab;
  setTab: (tab: Tab) => void;
  palsView: PalsView;
  setPalsView: (view: PalsView) => void;
  openSheet: (sheet: SheetState) => void;
  closeSheet: () => void;
}

export const PhoneUIContext = createContext<PhoneUI | null>(null);

export function usePhoneUI(): PhoneUI {
  const ui = useContext(PhoneUIContext);
  if (!ui) throw new Error('usePhoneUI must be used inside the phone');
  return ui;
}
