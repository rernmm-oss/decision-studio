import React, {useEffect, useId, useRef} from 'react';
import {ArrowUpRight, X} from 'lucide-react';
import './tarot-invite.css';

function TarotCards() {
  return <div className="tarot-invite-art" aria-hidden="true">
    <span className="tarot-invite-orbit" />
    <div className="tarot-invite-card tarot-invite-card-left">
      <svg viewBox="0 0 80 122" fill="none"><rect x="7" y="7" width="66" height="108" rx="8"/><path d="M40 35 49 61 40 87 31 61Z"/><circle cx="40" cy="61" r="20"/><path d="M19 21h4m-2-2v4m36 78h4m-2-2v4"/></svg>
    </div>
    <div className="tarot-invite-card tarot-invite-card-right">
      <svg viewBox="0 0 80 122" fill="none"><rect x="7" y="7" width="66" height="108" rx="8"/><circle cx="40" cy="61" r="19"/><circle cx="40" cy="61" r="11"/><path d="M40 32v6m0 46v6M11 61h6m46 0h6M20 41l4 4m32 32 4 4m0-40-4 4M24 77l-4 4"/></svg>
    </div>
    <div className="tarot-invite-card tarot-invite-card-center">
      <svg viewBox="0 0 80 122" fill="none"><rect x="7" y="7" width="66" height="108" rx="8"/><path d="M47 42a20 20 0 1 0 0 38 21 21 0 0 1 0-38Z"/><path d="m53 41 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><path d="M40 18v7m-3.5-3.5h7M40 97v7m-3.5-3.5h7"/></svg>
    </div>
    <span className="tarot-invite-spark tarot-invite-spark-one">✦</span>
    <span className="tarot-invite-spark tarot-invite-spark-two">✧</span>
  </div>;
}

export default function TarotInvite({choice, onClose, lang, t}) {
  const dialogRef = useRef(null);
  const dismissRef = useRef(null);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dismissRef.current?.focus({preventScroll: true});
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
    };
  }, []);

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }

  return <dialog
    ref={dialogRef}
    className="tarot-invite"
    lang={lang === 'zh' ? 'zh-CN' : 'en'}
    aria-labelledby={headingId}
    aria-describedby={descriptionId}
    onCancel={event => {event.preventDefault(); onClose();}}
    onClick={closeOnBackdrop}
  >
    <button type="button" className="tarot-invite-close" onClick={onClose} aria-label={t('Close tarot invitation')}><X size={18}/></button>
    <TarotCards/>
    <span className="tarot-invite-eyebrow">{t('TUTTO TAROT')}</span>
    <h2 id={headingId}>{t('Want a tarot reading?')}</h2>
    <p className="tarot-invite-description" id={descriptionId}>{t('Explore your choice through a tarot reading.')}</p>
    <div className="tarot-invite-choice"><span>{t('Your choice')}</span><strong>{choice}</strong></div>
    <div className="tarot-invite-actions">
      <a href="https://tuttotarot.com/" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="tarot-invite-primary" onClick={onClose}>{t('Go to TUTTO TAROT')}<ArrowUpRight size={18}/></a>
      <button type="button" ref={dismissRef} className="tarot-invite-dismiss" onClick={onClose}>{t('Not now')}</button>
    </div>
    <p className="tarot-invite-destination">{t('TUTTO TAROT · Opens in a new tab')}</p>
  </dialog>;
}
