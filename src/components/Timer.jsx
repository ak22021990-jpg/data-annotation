import { useTimer } from '../hooks/useTimer.js';

/**
 * Timer — flagmail1-style inline clock display.
 *
 * @param {Object} props - { durationSeconds, onExpire }
 */
export default function Timer({ durationSeconds, onExpire }) {
  const { timeRemaining } = useTimer(durationSeconds, onExpire);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isRed = timeRemaining <= 15;
  const isAmber = timeRemaining <= 30 && !isRed;

  const phaseColor = isRed ? '#FF3B30' : isAmber ? '#FF9500' : '#34C759';

  return (
    <span
      id="timer-countdown"
      aria-live="polite"
      aria-label={`${minutes} minutes ${seconds} seconds remaining`}
      className={isRed ? 'anim-timerPulse' : ''}
      style={{
        minWidth: 62,
        textAlign: 'right',
        fontSize: 22,
        lineHeight: 1,
        fontWeight: 700,
        color: phaseColor,
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        transition: 'color 0.3s ease',
      }}
    >
      {timeFormatted}
    </span>
  );
}
