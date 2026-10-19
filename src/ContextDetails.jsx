import React, {useId, useState} from 'react';
import {WalletCards, Plus, Check} from 'lucide-react';
import DecisionDatePicker from './DecisionDatePicker.jsx';

export default function ContextDetails({context, onChange, lang, t}) {
  const [editingBudget, setEditingBudget] = useState(false);
  const budgetId = useId();
  const setBudget = budget => onChange({...context, budget});

  return <section className="optional-context" aria-label={t('Practical details')}>
    <div className="optional-context-heading"><h3>{t('Practical details')}</h3><span>{t('All optional')}</span></div>
    <div className="optional-context-grid">
      <div className="context-card">
        <h4>{t('How much would you spend?')}</h4>
        <p id={`${budgetId}-help`}>{t('Note your spending limit for this decision. Skip it if money isn’t involved.')}</p>
        {editingBudget ? <div className="budget-editor">
          <label htmlFor={budgetId}>{t('Amount and currency')}</label>
          <input id={budgetId} autoFocus type="text" value={context.budget} aria-describedby={`${budgetId}-help`} onChange={event=>setBudget(event.target.value)} placeholder={t('e.g. $1,200 total, or $200 per month')}/>
          <div className="budget-editor-actions"><button type="button" onClick={()=>{setBudget('');setEditingBudget(false);}}>{t('No spending limit')}</button><button type="button" onClick={()=>setEditingBudget(false)}><Check size={14}/>{t('Done')}</button></div>
        </div> : <button type="button" className={`context-cta${context.budget?' has-value':''}`} onClick={()=>setEditingBudget(true)} aria-expanded={false} aria-describedby={`${budgetId}-help`}><WalletCards size={18}/><span>{context.budget||t('Add a spending limit')}</span>{!context.budget&&<Plus size={15}/>}</button>}
      </div>
      <div className="context-card">
        <h4>{t('When would you like to decide?')}</h4>
        <p>{t('Choose a day to make your decision by. Leave it open if there’s no rush.')}</p>
        <DecisionDatePicker value={context.deadline} onChange={deadline=>onChange({...context,deadline})} lang={lang} t={t}/>
      </div>
    </div>
  </section>;
}
