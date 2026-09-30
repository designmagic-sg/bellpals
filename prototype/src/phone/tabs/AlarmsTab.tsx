import { Icon } from '../../components/Icons';
import { Button, Toggle } from '../../components/ui';
import { BELLPALS } from '../../data/bellpals';
import { WEEKDAYS, WEEKDAY_NAMES, WEEKDAY_SHORT, fromClockTime } from '../../domain/rules';
import { formatUntil, nextOccurrence } from '../../domain/schedule';
import { relativeDay } from '../../lib/format';
import { useNow } from '../../state/clock';
import { myGroupOf, useStore } from '../../state/store';
import { usePhoneUI } from '../PhoneUI';

export function AlarmsTab() {
  const { state, dispatch } = useStore();
  const now = useNow();
  const ui = usePhoneUI();
  const group = myGroupOf(state);
  const next = nextOccurrence(state.alarms, now);
  const today = new Date(now).getDay();
  const petName = state.bellpal ? BELLPALS[state.bellpal.species].name : 'your BellPal';

  return (
    <div className="screen alarms">
      <header className="screen-head">
        <h1>Alarms</h1>
        <p className="muted">One alarm per day, Sunday to Saturday.</p>
      </header>

      {next && (
        <div className="next-pill">
          <Icon name="alarm" />
          <span>
            Next: <strong>{relativeDay(next.at, now)}</strong> in {formatUntil(next.at - now)}
          </span>
        </div>
      )}

      <ul className="week-list">
        {WEEKDAYS.map((day) => {
          const alarm = state.alarms[day];
          const parts = alarm ? fromClockTime(alarm.time) : null;
          return (
            <li key={day} className={`week-row${alarm ? (alarm.on ? ' on' : ' off') : ' empty'}`}>
              <button
                type="button"
                className="week-main"
                onClick={() => ui.openSheet({ kind: 'alarm', day })}
                aria-label={`${WEEKDAY_NAMES[day]}: ${parts ? `${parts.hour12}:${String(parts.minute).padStart(2, '0')} ${parts.meridiem}` : 'no alarm'}. Edit.`}
              >
                <span className="week-day">
                  {WEEKDAY_SHORT[day]}
                  {day === today && <span className="today-dot">Today</span>}
                </span>
                {parts ? (
                  <span className="week-time">
                    {parts.hour12}:{String(parts.minute).padStart(2, '0')}
                    <small>{parts.meridiem}</small>
                  </span>
                ) : (
                  <span className="week-none">No alarm</span>
                )}
              </button>
              {alarm ? (
                <Toggle checked={alarm.on} onChange={() => dispatch({ type: 'toggleAlarm', day })} label={`${WEEKDAY_NAMES[day]} alarm`} />
              ) : (
                <button type="button" className="icon-btn add-day" onClick={() => ui.openSheet({ kind: 'alarm', day })} aria-label={`Add a ${WEEKDAY_NAMES[day]} alarm`}>
                  <Icon name="plus" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <Button onClick={() => ui.openSheet({ kind: 'alarm' })}>
        <Icon name="plus" />
        Set alarm for several days
      </Button>
      <p className="small muted center">
        {group
          ? `When your alarm rings, everyone in ${group.name} rings 24 s later, and keeps ringing until you feed ${petName}.`
          : `To turn an alarm off, you swipe and then feed ${petName}.`}
      </p>
    </div>
  );
}
