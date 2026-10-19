import React, {useEffect, useId, useState} from 'react';
import {Check, CheckCircle2, Sparkles} from 'lucide-react';
import './final-choice.css';

export default function FinalChoice({record, onConfirm, onTarot, t}) {
  const groupName = useId();
  const [choice, setChoice] = useState(record?.selectedOption || '');
  useEffect(() => setChoice(record?.selectedOption || ''), [record?.id, record?.selectedOption]);
  if (!record) return null;
  const validChoice = record.options.some(option => option.name === choice);
  const saved = record.status === 'Decided' && validChoice && choice === record.selectedOption;

  return <section className="final-choice panel" aria-labelledby={`${groupName}-title`}>
    <div className="final-choice-heading">
      <span className="panel-kicker">{t('Your next chapter')}</span>
      <h3 id={`${groupName}-title`}>{t('Which path will you choose?')}</h3>
      <p>{t('Choose when you’re ready. You can always revisit your decision.')}</p>
    </div>
    <fieldset className="final-choice-options">
      <legend className="visually-hidden">{t('Your final choice')}</legend>
      {record.options.map((option, index) => <label key={option.name} className={`final-choice-option${choice === option.name ? ' selected' : ''}`}>
        <input type="radio" name={groupName} value={option.name} checked={choice === option.name} onChange={() => setChoice(option.name)}/>
        <span className="final-choice-number">0{index + 1}</span>
        <span>{option.name}</span>
        <span className="final-choice-check" aria-hidden="true">{choice === option.name && <Check size={14}/>}</span>
      </label>)}
    </fieldset>
    <div className="final-choice-footer">
      {saved ? <span className="final-choice-saved" role="status"><CheckCircle2 size={16}/>{t('Your choice is saved.')}</span> : <span className="final-choice-hint">{t('Still thinking? You can leave this for later.')}</span>}
      {saved ? <button type="button" className="btn ghost" onClick={() => onTarot(choice)}><Sparkles size={16}/>{t('Try a tarot reading')}</button> : <button type="button" className="btn primary" disabled={!validChoice} onClick={() => onConfirm(record.id, choice)}><Check size={16}/>{t('Confirm my choice')}</button>}
    </div>
  </section>;
}
