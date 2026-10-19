import React, {useEffect, useId, useRef, useState} from 'react';
import {CalendarDays, ChevronLeft, ChevronRight, X} from 'lucide-react';
import './date-picker.css';

const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return dateKey(date) === value ? date : null;
}

export default function DecisionDatePicker({value = '', onChange, lang, t}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => parseDate(value) || new Date());
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const calendarRef = useRef(null);
  const calendarId = useId();
  const selectedDate = parseDate(value);
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
  const todayKey = dateKey(new Date());
  const monthLabel = month.toLocaleDateString(locale, {year: 'numeric', month: 'long'});
  const buttonLabel = selectedDate
    ? selectedDate.toLocaleDateString(locale, {year: 'numeric', month: 'short', day: 'numeric'})
    : value || t('Choose a decision date');
  const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekCount = Math.ceil((firstWeekday + daysInMonth) / 7);

  useEffect(() => {
    if (!open) return;
    const dismiss = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    const initialButton = calendarRef.current?.querySelector('[aria-pressed="true"]')
      || calendarRef.current?.querySelector('[data-today="true"]')
      || calendarRef.current?.querySelector('.decision-calendar-day');
    initialButton?.focus();
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(nextValue) {
    onChange(nextValue);
    closeAndFocus();
  }

  function toggleCalendar() {
    if (!open) setMonth(parseDate(value) || new Date());
    setOpen(!open);
  }

  return <div className="decision-date-picker" ref={rootRef} onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocus();
    }
  }}>
    <button type="button" className={`decision-date-trigger${value ? ' has-value' : ''}`} ref={triggerRef} aria-expanded={open} aria-controls={calendarId} aria-haspopup="dialog" onClick={toggleCalendar}>
      <CalendarDays size={18}/><span>{buttonLabel}</span>
    </button>
    {open && <div id={calendarId} className="decision-calendar" ref={calendarRef} role="dialog" aria-label={t('Choose a decision date')}>
      <div className="decision-calendar-heading">
        <strong aria-live="polite">{monthLabel}</strong>
        <div className="decision-calendar-navigation">
          <button type="button" aria-label={t('Previous month')} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))}><ChevronLeft size={17}/></button>
          <button type="button" aria-label={t('Next month')} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))}><ChevronRight size={17}/></button>
          <button type="button" aria-label={t('Close calendar')} onClick={closeAndFocus}><X size={16}/></button>
        </div>
      </div>
      {value && !selectedDate && <p className="decision-calendar-note">{t('Current date note')}: {value}</p>}
      <table className="decision-calendar-table" aria-label={monthLabel}>
        <thead><tr>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <th scope="col" key={day}>{t(day)}</th>)}</tr></thead>
        <tbody>{Array.from({length: weekCount}, (_, week) => <tr key={week}>{Array.from({length: 7}, (_, weekday) => {
          const day = week * 7 + weekday - firstWeekday + 1;
          if (day < 1 || day > daysInMonth) return <td key={weekday}/>;
          const date = new Date(month.getFullYear(), month.getMonth(), day, 12);
          const key = dateKey(date);
          return <td key={weekday}><button type="button" className="decision-calendar-day" aria-label={date.toLocaleDateString(locale, {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'})} aria-pressed={value === key} aria-current={key === todayKey ? 'date' : undefined} data-today={key === todayKey} onClick={() => choose(key)}>{day}</button></td>;
        })}</tr>)}</tbody>
      </table>
      <div className="decision-calendar-footer">
        <button type="button" onClick={() => choose('')}>{t('No decision date')}</button>
        <button type="button" onClick={() => choose(todayKey)}>{t('Today')}</button>
      </div>
    </div>}
  </div>;
}
