import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Home, Type, Gamepad2, Users, Flame, Star, Zap, Volume2, X, ChevronLeft, ChevronRight,
  Check, RotateCcw, Lock, Play, Layers, ListChecks, Puzzle, Trophy, Feather, Leaf,
  Droplets, Heart, MessageCircle, PawPrint, Sparkles, Mic, BookOpen, ExternalLink, AlertTriangle,
  Settings, VolumeX, ChevronDown, ClipboardCheck,
} from 'lucide-react';

import { languageData } from './languageData.js';

/* Content lives in ./languageData.js — edit words, audio links and lessons there. */
const wordsById = Object.fromEntries(languageData.words.map((w) => [w.id, w]));
const deckById = Object.fromEntries(languageData.decks.map((d) => [d.id, d]));
const deckWords = (deckId) => languageData.words.filter((w) => w.category === deckId);

/* =============================================================================
   XP RULES — tweak the reward amounts here
   ============================================================================= */
const XP = { flashcard: 2, quizCorrect: 10, phrase: 15, lessonBonus: 20 };

/* =============================================================================
   PREFERENCES (sound effects + computer voice) — saved per device
   ============================================================================= */
const PREFS_KEY = 'mikmaw-learn-prefs-v1';
const prefs = (() => {
  const base = { sfx: true, voice: languageData.settings.useComputerVoiceFallback };
  try { return { ...base, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch { return base; }
})();
function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {} }

/* Tiny built-in sound effects (no files needed) */
let actx = null;
function sfx(kind) {
  if (!prefs.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { tap: [[520, 0, 0.05]], correct: [[660, 0, 0.12], [880, 0.1, 0.18]], wrong: [[240, 0, 0.18], [190, 0.12, 0.22]],
      complete: [[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.36, 0.3]] }[kind] || [];
    const t0 = actx.currentTime;
    notes.forEach(([f, start, dur]) => {
      const o = actx.createOscillator(); const g = actx.createGain();
      o.type = kind === 'wrong' ? 'triangle' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + start); g.gain.exponentialRampToValueAtTime(kind === 'tap' ? 0.05 : 0.14, t0 + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      o.connect(g).connect(actx.destination); o.start(t0 + start); o.stop(t0 + start + dur + 0.05);
    });
  } catch {}
}

/* =============================================================================
   PROGRESS — saved in localStorage so it survives a refresh
   ============================================================================= */
const STORE_KEY = 'mikmaw-learn-progress-v1';
const blankProgress = () => ({ xp: 0, completed: {}, streak: 0, lastActive: null, bestStreak: 0, name: '', onboarded: false });
const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 86400000);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankProgress();
    const p = { ...blankProgress(), ...JSON.parse(raw) };
    // A streak breaks if you missed more than one day.
    if (p.lastActive && dayDiff(p.lastActive, todayStr()) > 1) p.streak = 0;
    return p;
  } catch { return blankProgress(); }
}
function saveProgress(p) { try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch { /* storage unavailable — progress lives in memory */ } }

/* =============================================================================
   AUDIO — plays a real .mp3 if one is provided, otherwise the browser voice.
   ============================================================================= */
const audioBus = { current: null };
function stopAll() {
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
  if (audioBus.current) { try { audioBus.current.pause(); } catch {} audioBus.current = null; }
}
function speak(text, onEnd) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) { setTimeout(onEnd, 900); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/'/g, ''));
    u.rate = 0.75; u.pitch = 1.05; u.lang = 'en-CA';
    u.onend = onEnd; u.onerror = onEnd;
    synth.speak(u);
    setTimeout(onEnd, 6000); // safety net
  } catch { setTimeout(onEnd, 900); }
}
/**
 * playItem — the single audio player used everywhere.
 *  1. audioUrl has a link → play that real recording right away.
 *  2. audioUrl is empty (or the file fails to load) → use the computer voice
 *     if settings.useComputerVoiceFallback is on, otherwise stay silent.
 */
function playItem({ audioUrl, text }, onEnd) {
  stopAll();
  let done = false; const finish = () => { if (!done) { done = true; onEnd && onEnd(); } };
  const fallback = () => (prefs.voice ? speak(text, finish) : setTimeout(finish, 600));
  if (audioUrl && audioUrl.trim()) {
    const a = new Audio(audioUrl.trim()); audioBus.current = a;
    a.onended = finish; a.onerror = fallback;
    a.play().catch(fallback);
  } else fallback();
}

/* =============================================================================
   SMALL UI PIECES
   ============================================================================= */
const cx = (...c) => c.filter(Boolean).join(' ');

function Btn({ variant = 'forest', size = 'md', className = '', children, ...props }) {
  const v = {
    forest: 'bg-forest-500 text-white border-b-4 border-forest-800 hover:bg-forest-600',
    clay: 'bg-clay-500 text-white border-b-4 border-clay-700 hover:bg-clay-600',
    light: 'bg-white text-ink border-2 border-b-4 border-sand-300 hover:bg-sand-100',
    ghost: 'bg-transparent text-forest-700 hover:bg-forest-50 border-b-4 border-transparent',
    danger: 'bg-berry text-white border-b-4 border-[#7d2427] hover:brightness-110',
  }[variant];
  const s = { sm: 'min-h-[44px] px-4 text-sm', md: 'min-h-[52px] px-5 text-base', lg: 'min-h-[58px] px-6 text-lg' }[size];
  return (
    <button
      {...props}
      className={cx('select-none rounded-2xl font-extrabold tracking-wide inline-flex items-center justify-center gap-2',
        'transition-all duration-100 hover:-translate-y-[1px] active:translate-y-[3px] active:border-b-[1px]',
        'disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-4 focus-visible:ring-forest-300', v, s, className)}
    >{children}</button>
  );
}

function SoundWave({ className = '' }) {
  return (
    <span className={cx('inline-flex items-end gap-[3px] h-5', className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="w-[3px] rounded-full bg-current"
          style={{ animation: `wave .9s ${i * 0.12}s ease-in-out infinite`, height: '30%' }} />
      ))}
      <style>{`@keyframes wave{0%,100%{height:25%}50%{height:100%}}`}</style>
    </span>
  );
}

/** Listen button with an animated soundwave while audio plays */
function ListenButton({ text, audioUrl, label = 'Listen', variant = 'forest', size = 'md', compact = false, className = '', showBadge = true }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => stopAll(), []);
  const onClick = (e) => {
    e.stopPropagation();
    if (playing) { stopAll(); setPlaying(false); return; }
    setPlaying(true); playItem({ audioUrl, text }, () => setPlaying(false));
  };
  const hasRecording = !!(audioUrl && audioUrl.trim());
  const button = (
    <Btn variant={variant} size={size} onClick={onClick} aria-label={playing ? 'Stop audio' : `${label}: ${text}`}
      className={cx(compact && '!px-3 aspect-square', className)}>
      {playing ? <SoundWave /> : <Volume2 className="w-5 h-5" />}
      {!compact && <span>{playing ? 'Playing…' : label}</span>}
    </Btn>
  );
  if (!showBadge || hasRecording) return button;
  return (
    <span className={cx('inline-flex flex-col items-center gap-1.5', compact && 'items-end')}>
      {button}
      <ComingSoonBadge />
    </span>
  );
}

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sand-200 text-slate-600 text-[11px] font-bold px-2 py-0.5 whitespace-nowrap">
      <Mic className="w-3 h-3" /> Audio recording coming soon
    </span>
  );
}

function ProgressBar({ value, className = '' }) {
  return (
    <div className={cx('h-4 w-full rounded-full bg-sand-200 overflow-hidden', className)}>
      <div className="h-full rounded-full bg-forest-500 transition-all duration-500 ease-out relative" style={{ width: `${Math.max(4, value * 100)}%` }}>
        <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

const deckIcon = (k, cls = 'w-6 h-6') => ({
  greet: <MessageCircle className={cls} />, animal: <PawPrint className={cls} />,
  water: <Droplets className={cls} />, family: <Heart className={cls} />,
}[k] || <Leaf className={cls} />);
const modeIcon = (m, cls = 'w-6 h-6') => ({ flashcards: <Layers className={cls} />, quiz: <ListChecks className={cls} />, phrase: <Puzzle className={cls} /> }[m]);
const modeName = { flashcards: 'Flashcards', quiz: 'Quiz', phrase: 'Build the Phrase' };

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Builds quiz questions from languageData.quizzes (or every word in the deck). */
function buildQuiz(deckId) {
  const pool = deckWords(deckId);
  const list = (languageData.quizzes[deckId] && languageData.quizzes[deckId].length)
    ? languageData.quizzes[deckId]
    : pool.map((w, n) => ({ wordId: w.id, ask: n % 2 ? 'say' : 'meaning' }));
  return list.map(({ wordId, ask }) => {
    const w = wordsById[wordId]; if (!w) return null;
    const field = ask === 'say' ? 'mikmaw' : 'english';
    const wrong = shuffle(pool.filter((o) => o.id !== w.id)).slice(0, 3).map((o) => o[field]);
    return {
      prompt: ask === 'say' ? `How do you say “${w.english}”?` : `What does “${w.mikmaw}” mean?`,
      answer: w[field], options: shuffle([w[field], ...wrong]),
      say: w.mikmaw, audioUrl: w.audioUrl, verifiedBy: w.verifiedBy,
    };
  }).filter(Boolean);
}

/* =============================================================================
   CELEBRATION / XP SUMMARY MODAL
   ============================================================================= */
function Confetti() {
  const bits = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.8, size: 6 + Math.random() * 8,
    color: ['#C2643C', '#2E7D57', '#E3A07F', '#7FB394', '#F2C14E'][i % 5], round: i % 3 === 0,
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[60]" aria-hidden>
      {bits.map((b, i) => (
        <span key={i} className="absolute top-0 animate-fall"
          style={{ left: `${b.left}%`, width: b.size, height: b.size * (b.round ? 1 : 1.6), background: b.color,
            borderRadius: b.round ? 999 : 3, animationDelay: `${b.delay}s` }} />
      ))}
    </div>
  );
}

function CountUp({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - start) / 900); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

function SummaryModal({ title, subtitle, xp, stars, correct, total, streak, onDone, onRetry }) {
  useEffect(() => { sfx('complete'); }, []);
  return (
    <div className="fixed inset-0 z-50 bg-forest-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <Confetti />
      <div className="w-full sm:max-w-md bg-cream rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-8 animate-pop text-center shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="mx-auto w-20 h-20 rounded-full bg-clay-100 flex items-center justify-center animate-float">
          <Trophy className="w-10 h-10 text-clay-500" />
        </div>
        <p className="mk text-3xl font-extrabold text-forest-700 mt-4">Wela'lin!</p>
        <h2 className="text-xl font-black mt-1">{title}</h2>
        {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}

        <div className="flex justify-center gap-1 my-4">
          {[1, 2, 3].map((s) => (
            <Star key={s} className={cx('w-11 h-11 transition-all', s <= stars ? 'text-amber-400 fill-amber-400 animate-pop' : 'text-sand-300')}
              style={{ animationDelay: `${s * 0.15}s` }} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white border-2 border-sand-200 p-3">
            <Zap className="w-5 h-5 mx-auto text-clay-500" />
            <p className="text-2xl font-black text-clay-600">+<CountUp to={xp} /></p>
            <p className="text-[11px] font-bold uppercase text-slate-500">XP</p>
          </div>
          <div className="rounded-2xl bg-white border-2 border-sand-200 p-3">
            <Check className="w-5 h-5 mx-auto text-forest-500" />
            <p className="text-2xl font-black text-forest-600">{total ? `${correct}/${total}` : '✓'}</p>
            <p className="text-[11px] font-bold uppercase text-slate-500">Correct</p>
          </div>
          <div className="rounded-2xl bg-white border-2 border-sand-200 p-3">
            <Flame className="w-5 h-5 mx-auto text-orange-500" />
            <p className="text-2xl font-black text-orange-500">{streak}</p>
            <p className="text-[11px] font-bold uppercase text-slate-500">Day streak</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Btn variant="forest" size="lg" onClick={onDone} className="w-full">Continue</Btn>
          {onRetry && <Btn variant="light" onClick={onRetry} className="w-full"><RotateCcw className="w-5 h-5" /> Practise again</Btn>}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   HOME / LEARNING PATH
   ============================================================================= */
function HomeView({ progress, onStartLesson }) {
  const lessons = languageData.lessons;
  const doneCount = lessons.filter((l) => progress.completed[l.id]).length;
  const currentIdx = lessons.findIndex((l) => !progress.completed[l.id]);
  const totalStars = Object.values(progress.completed).reduce((a, c) => a + (c.stars || 0), 0);
  const offsets = [0, 1, 2, 1, 0, -1, -2, -1];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-forest-700 text-white p-5 sm:p-8">
        <div className="absolute inset-0 opacity-20 pattern" />
        <Feather className="absolute -right-4 -bottom-4 w-36 h-36 text-forest-500/40 rotate-12" />
        <div className="relative">
          <p className="mk text-4xl sm:text-5xl font-extrabold break-words">Kwe'{progress.name ? `, ${progress.name}` : ''}!</p>
          <p className="text-forest-100 font-bold mt-1 text-base sm:text-lg">Ready to learn some Mi'kmaw today?</p>
          <div className="grid grid-cols-3 gap-2 mt-5 max-w-md">
            {[
              { icon: <Flame className="w-5 h-5 text-orange-300" />, v: progress.streak, l: 'Day streak' },
              { icon: <Zap className="w-5 h-5 text-clay-300" />, v: progress.xp, l: 'Total XP' },
              { icon: <Star className="w-5 h-5 text-amber-300 fill-amber-300" />, v: totalStars, l: 'Stars' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 backdrop-blur px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-1">{s.icon}<span className="text-2xl font-black">{s.v}</span></div>
                <p className="text-[11px] uppercase font-bold text-forest-100 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 max-w-md">
            <div className="flex justify-between text-xs font-bold text-forest-100 mb-1"><span>Path progress</span><span>{doneCount}/{lessons.length}</span></div>
            <div className="h-3 rounded-full bg-white/15 overflow-hidden"><div className="h-full bg-clay-300 rounded-full transition-all duration-700" style={{ width: `${(doneCount / lessons.length) * 100}%` }} /></div>
          </div>
          {currentIdx >= 0 && (
            <Btn variant="clay" size="lg" className="mt-5 w-full sm:w-auto" onClick={() => onStartLesson(lessons[currentIdx])}>
              <Play className="w-5 h-5 fill-white" /> Continue: {lessons[currentIdx].title}
            </Btn>
          )}
        </div>
      </section>

      {/* Path */}
      <section>
        <h2 className="text-xl font-black mb-2 px-1">Your learning path</h2>
        <div className="relative pt-12 pb-2">
          {lessons.map((l, i) => {
            const done = !!progress.completed[l.id];
            const isCurrent = i === currentIdx;
            const locked = !done && !isCurrent;
            const deck = deckById[l.deck];
            const off = offsets[i % offsets.length];
            return (
              <div key={l.id} className="flex flex-col items-center">
                {i > 0 && <div className={cx('w-2 rounded-full my-1', isCurrent ? 'h-12' : 'h-6', done || isCurrent ? 'bg-forest-300' : 'bg-sand-200')} style={{ transform: `translateX(${off * 26}px)` }} />}
                <div className="flex flex-col items-center" style={{ transform: `translateX(${off * 32}px)` }}>
                  <button
                    disabled={locked}
                    onClick={() => onStartLesson(l)}
                    aria-label={`${l.title} — ${locked ? 'locked' : done ? 'completed' : 'start'}`}
                    className={cx('relative w-[76px] h-[72px] rounded-[50%] flex items-center justify-center transition-all duration-100',
                      'active:translate-y-[4px] hover:-translate-y-[1px] focus:outline-none focus-visible:ring-4 focus-visible:ring-clay-300',
                      done && 'bg-forest-500 text-white border-b-[6px] border-forest-800 active:border-b-2',
                      isCurrent && 'bg-clay-500 text-white border-b-[6px] border-clay-700 active:border-b-2 ring-8 ring-clay-100',
                      locked && 'bg-sand-200 text-sand-300 border-b-[6px] border-sand-300 cursor-not-allowed')}
                  >
                    {locked ? <Lock className="w-7 h-7" /> : done ? <Check className="w-8 h-8" strokeWidth={3.5} /> : modeIcon(l.mode, 'w-8 h-8')}
                    {isCurrent && <span className="absolute -top-9 whitespace-nowrap rounded-xl bg-white border-2 border-sand-200 px-3 py-1 text-xs font-black text-clay-600 animate-float shadow-sm">START</span>}
                  </button>
                  <p className={cx('mt-2 text-sm font-extrabold text-center max-w-[150px]', locked ? 'text-slate-400' : 'text-ink')}>{l.title}</p>
                  <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    {deckIcon(deck.icon, 'w-3 h-3')} {deck.title} · {modeName[l.mode]}
                  </p>
                  {done && (
                    <div className="flex gap-0.5 mt-0.5">{[1, 2, 3].map((s) => <Star key={s} className={cx('w-3.5 h-3.5', s <= progress.completed[l.id].stars ? 'text-amber-400 fill-amber-400' : 'text-sand-300')} />)}</div>
                  )}
                </div>
              </div>
            );
          })}
          {currentIdx === -1 && (
            <div className="mt-6 rounded-3xl bg-clay-50 border-2 border-clay-100 p-5 text-center">
              <Trophy className="w-10 h-10 mx-auto text-clay-500" />
              <p className="font-black mt-2">You finished the whole path!</p>
              <p className="text-sm text-slate-600">Keep practising to grow your streak and XP.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =============================================================================
   ALPHABET SOUNDBOARD
   ============================================================================= */
function AlphabetView() {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const items = languageData.alphabet.filter((a) => filter === 'all' || a.category === filter);
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black">Alphabet Soundboard</h1>
        <p className="text-slate-600 mt-1">Tap a letter to hear it and see an example word.</p>
      </header>
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        {[['all', 'All 17'], ['vowel', 'Vowels'], ['consonant', 'Consonants']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={cx('shrink-0 min-h-[44px] px-4 rounded-full font-extrabold text-sm border-2 transition-colors',
              filter === k ? 'bg-forest-600 text-white border-forest-600' : 'bg-white border-sand-200 text-slate-600 hover:border-forest-300')}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-3 min-[420px]:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((a) => (
          <button key={a.id} onClick={() => setOpen(a)}
            className={cx('group aspect-square rounded-3xl flex flex-col items-center justify-center border-2 border-b-[6px] transition-all duration-100',
              'hover:-translate-y-0.5 active:translate-y-1 active:border-b-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest-300',
              a.category === 'vowel' ? 'bg-clay-50 border-clay-300 border-b-clay-500' : 'bg-white border-sand-200 border-b-forest-300')}
            aria-label={`Letter ${a.mikmaw}`}>
            <span className={cx('mk text-5xl font-extrabold leading-none', a.category === 'vowel' ? 'text-clay-600' : 'text-forest-700')}>{a.mikmaw}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">{a.category}</span>
          </button>
        ))}
      </div>
      <div className="rounded-3xl bg-sand-100 p-4 text-sm text-slate-700 flex gap-3">
        <BookOpen className="w-5 h-5 shrink-0 text-forest-600 mt-0.5" />
        <p><b>Francis-Smith tip:</b> an apostrophe after a vowel means <i>hold that vowel longer</i> — so <span className="mk font-bold">a'</span> sounds like "aaah". You'll see it in words like <span className="mk font-bold">Kwe'</span> and <span className="mk font-bold">Wela'lin</span>.</p>
      </div>
      {open && <LetterModal item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function LetterModal({ item, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => { window.removeEventListener('keydown', k); stopAll(); };
  }, [onClose]);
  const vowel = item.category === 'vowel';
  const ex = wordsById[item.exampleWordId];
  return (
    <div className="fixed inset-0 z-50 bg-forest-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full sm:max-w-md bg-cream rounded-t-[2rem] sm:rounded-[2rem] p-5 pb-8 animate-pop max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <span className={cx('text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full', vowel ? 'bg-clay-100 text-clay-700' : 'bg-forest-100 text-forest-700')}>{item.category}</span>
          <button onClick={onClose} className="w-11 h-11 rounded-full hover:bg-sand-200 flex items-center justify-center" aria-label="Close"><X className="w-6 h-6" /></button>
        </div>
        <div className={cx('mx-auto mt-2 w-32 h-32 rounded-[2rem] flex items-center justify-center border-b-[6px]', vowel ? 'bg-clay-500 border-clay-700' : 'bg-forest-600 border-forest-800')}>
          <span className="mk text-7xl font-extrabold text-white">{item.mikmaw}</span>
        </div>
        <div className="mt-4 flex justify-center">
          <ListenButton text={item.mikmaw} audioUrl={item.audioUrl} label="Hear the letter" variant={vowel ? 'clay' : 'forest'} />
        </div>
        <div className="mt-5 rounded-2xl bg-white border-2 border-sand-200 p-4">
          <p className="text-xs font-black uppercase text-slate-500 flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> How to say it</p>
          <p className="mt-1 text-lg font-bold">{item.phoneticHint}</p>
        </div>
        {ex && <div className="mt-3 rounded-2xl bg-white border-2 border-sand-200 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase text-slate-500">Example word</p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="mk text-3xl font-extrabold text-forest-700 break-words">{ex.mikmaw}</p>
              <p className="text-slate-600 font-bold">{ex.english}</p>
              {ex.phoneticHint && <p className="text-sm text-slate-500">{ex.phoneticHint}</p>}
            </div>
            <ListenButton text={ex.mikmaw} audioUrl={ex.audioUrl} compact variant="light" />
          </div>
        </div>}
        <p className="mt-4 text-xs text-center text-slate-500">Until recordings are added, a temporary computer voice is used, so some sounds won't be exact.</p>
      </div>
    </div>
  );
}

/* =============================================================================
   PRACTICE HUB
   ============================================================================= */
function PracticeView({ session, setSession, onFinish, progress }) {
  const [deckKey, setDeckKey] = useState(null);
  if (session) {
    const props = { deckKey: session.deck, onExit: () => setSession(null), onFinish: (r) => onFinish(session, r) };
    if (session.mode === 'flashcards') return <Flashcards {...props} />;
    if (session.mode === 'quiz') return <Quiz {...props} />;
    return <BuildPhrase {...props} name={progress.name} />;
  }
  if (deckKey) {
    const deck = deckById[deckKey];
    const words = deckWords(deckKey);
    const modes = ['flashcards', 'quiz', ...(deckKey === 'greetings' ? ['phrase'] : [])];
    return (
      <div className="space-y-5">
        <button onClick={() => setDeckKey(null)} className="min-h-[44px] inline-flex items-center gap-1 font-extrabold text-forest-700"><ChevronLeft className="w-5 h-5" /> All decks</button>
        <div className={cx('rounded-[2rem] p-5 text-white', deck.color === 'clay' ? 'bg-clay-500' : 'bg-forest-600')}>
          {deckIcon(deck.icon, 'w-10 h-10')}
          <h1 className="text-3xl font-black mt-2">{deck.title}</h1>
          <p className="opacity-90 font-bold">{deck.blurb} · {words.length} words</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {modes.map((m) => (
            <button key={m} onClick={() => setSession({ deck: deckKey, mode: m })}
              className="text-left rounded-3xl bg-white border-2 border-b-[6px] border-sand-200 p-4 flex items-center gap-4 sm:flex-col sm:items-start transition-all duration-100 hover:-translate-y-0.5 hover:border-forest-300 active:translate-y-1 active:border-b-2 min-h-[76px]">
              <span className="w-12 h-12 shrink-0 rounded-2xl bg-forest-50 text-forest-600 flex items-center justify-center">{modeIcon(m)}</span>
              <span>
                <span className="block font-black text-lg">{modeName[m]}</span>
                <span className="block text-sm text-slate-500 font-bold">
                  {m === 'flashcards' ? 'Flip, listen, remember' : m === 'quiz' ? 'Test yourself, earn XP' : 'Tap tiles in the right order'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black">Practice</h1>
        <p className="text-slate-600 mt-1">Pick a deck, then choose a game.</p>
      </header>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
        {languageData.decks.map((d) => { const k = d.id; return (
          <button key={k} onClick={() => setDeckKey(k)}
            className={cx('text-left rounded-3xl p-5 text-white border-b-[6px] transition-all duration-100 hover:-translate-y-0.5 active:translate-y-1 active:border-b-2 min-h-[120px] relative overflow-hidden',
              d.color === 'clay' ? 'bg-clay-500 border-clay-700' : 'bg-forest-600 border-forest-800')}>
            <span className="absolute -right-3 -bottom-3 opacity-20">{deckIcon(d.icon, 'w-24 h-24')}</span>
            {deckIcon(d.icon, 'w-8 h-8')}
            <p className="text-xl font-black mt-2">{d.title}</p>
            <p className="text-sm opacity-90 font-bold">{deckWords(k).length} words</p>
          </button>
        ); })}
      </div>
      <button onClick={() => setSession({ deck: 'greetings', mode: 'phrase' })}
        className="w-full text-left rounded-3xl bg-white border-2 border-b-[6px] border-sand-200 p-5 flex items-center gap-4 transition-all duration-100 hover:-translate-y-0.5 hover:border-clay-300 active:translate-y-1 active:border-b-2">
        <span className="w-14 h-14 shrink-0 rounded-2xl bg-clay-100 text-clay-600 flex items-center justify-center"><Puzzle className="w-7 h-7" /></span>
        <span className="min-w-0"><span className="block font-black text-lg">Build the Phrase</span><span className="block text-sm text-slate-500 font-bold">Put the words of a greeting in order</span></span>
        <ChevronRight className="w-6 h-6 ml-auto shrink-0 text-slate-400" />
      </button>
    </div>
  );
}

function GameHeader({ onExit, value, right }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <button onClick={onExit} className="w-11 h-11 shrink-0 rounded-full hover:bg-sand-200 flex items-center justify-center" aria-label="Exit"><X className="w-6 h-6 text-slate-500" /></button>
      <ProgressBar value={value} />
      {right}
    </div>
  );
}

/* ---------------- Flashcards ---------------- */
function Flashcards({ deckKey, onExit, onFinish }) {
  const cards = deckWords(deckKey);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(new Set([0]));
  const card = cards[i];
  const go = (d) => {
    const n = i + d; if (n < 0 || n >= cards.length) return;
    setFlipped(false); setTimeout(() => { setI(n); setSeen((s) => new Set(s).add(n)); }, 150);
  };
  const last = i === cards.length - 1;
  return (
    <div className="max-w-lg mx-auto">
      <GameHeader onExit={onExit} value={(i + 1) / cards.length} right={<span className="text-sm font-black text-slate-500 shrink-0">{i + 1}/{cards.length}</span>} />
      <div className="flip w-full aspect-[4/5] max-h-[440px] mx-auto cursor-pointer select-none" onClick={() => setFlipped((f) => !f)}
        role="button" aria-label="Flip card" tabIndex={0} onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setFlipped((f) => !f)}>
        <div className={cx('flip-inner relative w-full h-full', flipped && 'is-flipped')}>
          <div className="face absolute inset-0 rounded-[2rem] bg-white border-2 border-b-[8px] border-sand-200 flex flex-col items-center justify-center p-6 text-center">
            <span className="absolute top-4 left-4 text-xs font-black uppercase text-slate-400">Mi'kmaw</span>
            <p className="mk text-4xl min-[400px]:text-5xl font-extrabold text-forest-700 break-words max-w-full">{card.mikmaw}</p>
            {card.phoneticHint && <p className="mt-2 text-slate-500 font-bold">{card.phoneticHint}</p>}
            <div className="mt-6"><ListenButton text={card.mikmaw} audioUrl={card.audioUrl} /></div>
            <p className="absolute bottom-4 text-xs font-bold text-slate-400 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Tap card to flip</p>
          </div>
          <div className="face face-back absolute inset-0 rounded-[2rem] bg-forest-600 border-b-[8px] border-forest-800 text-white flex flex-col items-center justify-center p-6 text-center">
            <span className="absolute top-4 left-4 text-xs font-black uppercase text-forest-100">English</span>
            <p className="text-4xl font-black break-words max-w-full">{card.english}</p>
            <p className="mk mt-3 text-xl font-bold text-forest-100">{card.mikmaw}</p>
            
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
        <Btn variant="light" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous" className="!px-4"><ChevronLeft className="w-6 h-6" /></Btn>
        {last ? (
          <Btn variant="clay" size="lg" onClick={() => onFinish({ xp: cards.length * XP.flashcard, stars: 3, correct: seen.size, total: cards.length })}>
            <Check className="w-5 h-5" /> Finish deck
          </Btn>
        ) : (
          <Btn variant="forest" size="lg" onClick={() => go(1)}>Next <ChevronRight className="w-5 h-5" /></Btn>
        )}
      </div>
    </div>
  );
}

/* ---------------- Quiz ---------------- */
function Quiz({ deckKey, onExit, onFinish }) {
  const questions = useMemo(() => buildQuiz(deckKey), [deckKey]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[i];
  const answered = picked !== null;
  const isRight = picked === q.answer;

  const choose = (opt) => {
    if (answered) return;
    setPicked(opt);
    if (opt === q.answer) setCorrect((c) => c + 1);
    sfx(opt === q.answer ? 'correct' : 'wrong');
    try { navigator.vibrate && navigator.vibrate(opt === q.answer ? 15 : [30, 40, 30]); } catch {}
  };
  const next = () => {
    if (i + 1 >= questions.length) {
      const score = correct / questions.length;
      onFinish({ xp: correct * XP.quizCorrect, stars: score === 1 ? 3 : score >= 0.6 ? 2 : 1, correct, total: questions.length });
      return;
    }
    setPicked(null); setI(i + 1);
  };

  return (
    <div className="max-w-lg mx-auto pb-40">
      <GameHeader onExit={onExit} value={(i + (answered ? 1 : 0)) / questions.length}
        right={<span className="flex items-center gap-1 text-sm font-black text-clay-600 shrink-0"><Zap className="w-4 h-4" />{correct * XP.quizCorrect}</span>} />
      <div key={i} className="animate-pop">
        <div className="flex items-center gap-2 mb-1"><span className="text-xs font-black uppercase text-slate-400">Question {i + 1} of {questions.length}</span></div>
        <div className="flex items-start gap-3">
          <h2 className="mk text-2xl font-extrabold flex-1">{q.prompt}</h2>
          <ListenButton text={q.say} audioUrl={q.audioUrl} compact variant="light" showBadge={false} />
        </div>
        <div className="mt-5 grid gap-3">
          {q.options.map((opt) => {
            const state = !answered ? 'idle' : opt === q.answer ? 'right' : opt === picked ? 'wrong' : 'dim';
            return (
              <button key={opt} onClick={() => choose(opt)} disabled={answered}
                className={cx('mk w-full min-h-[60px] text-left rounded-2xl border-2 border-b-[5px] px-5 py-3 text-lg font-bold transition-all duration-100',
                  state === 'idle' && 'bg-white border-sand-200 hover:border-forest-300 hover:bg-forest-50 active:translate-y-1 active:border-b-2',
                  state === 'right' && 'bg-forest-50 border-forest-500 text-forest-700 animate-pop',
                  state === 'wrong' && 'bg-red-50 border-berry text-berry animate-shake',
                  state === 'dim' && 'bg-white border-sand-200 opacity-50')}>
                <span className="flex items-center justify-between gap-2">{opt}
                  {state === 'right' && <Check className="w-6 h-6 shrink-0" strokeWidth={3} />}
                  {state === 'wrong' && <X className="w-6 h-6 shrink-0" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {answered && (
        <div className={cx('fixed left-0 right-0 bottom-0 z-40 p-4 pb-6 border-t-2 animate-pop md:pb-6', isRight ? 'bg-forest-50 border-forest-100' : 'bg-red-50 border-red-100')}
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
              <span className={cx('w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white', isRight ? 'bg-forest-500' : 'bg-berry')}>{isRight ? <Check strokeWidth={3} /> : <X strokeWidth={3} />}</span>
              <div>
                <p className={cx('font-black text-lg', isRight ? 'text-forest-700' : 'text-berry')}>{isRight ? `Nice! +${XP.quizCorrect} XP` : 'Not quite'}</p>
                {!isRight && <p className="mk text-sm font-bold text-slate-700">Answer: {q.answer}</p>}
              </div>
            </div>
            <Btn variant={isRight ? 'forest' : 'danger'} size="lg" onClick={next} className="w-full sm:w-auto">{i + 1 >= questions.length ? 'See results' : 'Continue'}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Build the Phrase ---------------- */
function BuildPhrase({ onExit, onFinish, name }) {
  const phrases = useMemo(() => languageData.phrases.map((ph) => name
    ? { ...ph, tiles: ph.tiles.map((t) => (t === '___' ? name : t)), english: ph.english.replace(/___ \(say your name!\)/, name) }
    : ph), [name]);
  const [p, setP] = useState(0);
  const [bank, setBank] = useState([]);
  const [line, setLine] = useState([]);
  const [result, setResult] = useState(null); // 'right' | 'wrong' | null
  const [firstTry, setFirstTry] = useState(0);
  const [missed, setMissed] = useState(false);
  const phrase = phrases[p];

  useEffect(() => {
    setBank(shuffle([...phrase.tiles, ...(phrase.extraTiles || [])].map((t, idx) => ({ id: `${p}-${idx}`, t }))));
    setLine([]); setResult(null); setMissed(false);
  }, [p, phrases]);

  const add = (tile) => { if (result === 'right') return; sfx('tap'); setResult(null); setBank((b) => b.filter((x) => x.id !== tile.id)); setLine((l) => [...l, tile]); };
  const remove = (tile) => { if (result === 'right') return; setResult(null); setLine((l) => l.filter((x) => x.id !== tile.id)); setBank((b) => [...b, tile]); };
  const check = () => {
    const ok = line.map((x) => x.t).join(' ') === phrase.tiles.join(' ');
    setResult(ok ? 'right' : 'wrong'); sfx(ok ? 'correct' : 'wrong');
    if (ok && !missed) setFirstTry((n) => n + 1);
    if (!ok) setMissed(true);
    if (ok) playItem({ audioUrl: phrase.audioUrl, text: phrase.tiles.join(' ') });
  };
  const next = () => {
    if (p + 1 >= phrases.length) {
      const s = firstTry / phrases.length;
      onFinish({ xp: phrases.length * XP.phrase, stars: s === 1 ? 3 : s >= 0.5 ? 2 : 1, correct: firstTry, total: phrases.length });
    } else setP(p + 1);
  };

  return (
    <div className="max-w-lg mx-auto pb-40">
      <GameHeader onExit={onExit} value={(p + (result === 'right' ? 1 : 0)) / phrases.length} right={<span className="text-sm font-black text-slate-500 shrink-0">{p + 1}/{phrases.length}</span>} />
      <div key={p} className="animate-pop">
        <div className="flex items-center gap-2"><span className="text-xs font-black uppercase text-slate-400">Build this phrase in Mi'kmaw</span></div>
        <div className="mt-2 flex items-center gap-3 rounded-3xl bg-clay-50 border-2 border-clay-100 p-4">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-clay-500 text-white flex items-center justify-center"><MessageCircle className="w-6 h-6" /></span>
          <p className="text-xl font-black">“{phrase.english}”</p>
        </div>

        {/* Answer line */}
        <div className={cx('mt-5 min-h-[124px] rounded-3xl border-2 border-dashed p-3 flex flex-wrap content-start gap-2 transition-colors',
          result === 'right' ? 'border-forest-500 bg-forest-50' : result === 'wrong' ? 'border-berry bg-red-50 animate-shake' : 'border-sand-300 bg-white')}>
          {line.length === 0 && <p className="w-full text-center text-slate-400 font-bold self-center py-8">Tap the words below in order</p>}
          {line.map((tile) => (
            <button key={tile.id} onClick={() => remove(tile)}
              className="mk min-h-[52px] px-4 rounded-2xl bg-white border-2 border-b-[5px] border-forest-300 text-lg font-extrabold text-forest-800 animate-pop active:translate-y-1 active:border-b-2 transition-all duration-100">{tile.t}</button>
          ))}
        </div>

        {/* Word bank */}
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          {bank.map((tile) => (
            <button key={tile.id} onClick={() => add(tile)}
              className="mk min-h-[52px] px-4 rounded-2xl bg-white border-2 border-b-[5px] border-sand-300 text-lg font-extrabold hover:-translate-y-0.5 hover:border-clay-300 active:translate-y-1 active:border-b-2 transition-all duration-100">{tile.t}</button>
          ))}
        </div>
      </div>

      <div className={cx('fixed left-0 right-0 bottom-0 z-40 p-4 border-t-2', result === 'right' ? 'bg-forest-50 border-forest-100' : result === 'wrong' ? 'bg-red-50 border-red-100' : 'bg-cream border-sand-200', 'md:static md:mt-6 md:border-0 md:bg-transparent md:p-0')}
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          {result === 'right' && <p className="font-black text-forest-700 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Perfect! <span className="mk">{phrase.tiles.join(' ')}</span></p>}
          {result === 'wrong' && <p className="font-black text-berry">Almost — tap a word to move it back and try again.</p>}
          {result === 'right' ? (
            <Btn variant="forest" size="lg" onClick={next} className="w-full">{p + 1 >= phrases.length ? 'Finish' : 'Next phrase'}</Btn>
          ) : (
            <Btn variant="clay" size="lg" onClick={check} disabled={line.length === 0} className="w-full">Check</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   COMMUNITY & CULTURAL RESPECT
   ============================================================================= */
function CommunityView() {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-clay-500 text-white p-6">
        <Feather className="absolute -right-6 -top-4 w-40 h-40 text-white/10 -rotate-12" />
        <p className="mk text-3xl font-extrabold relative">Msit No'kmaq</p>
        <p className="font-bold opacity-90 relative">All my relations</p>
        <p className="mt-4 relative leading-relaxed">
          This app is offered with respect on the unceded, ancestral territory of the Mi'kmaq — Mi'kma'ki — covered by the
          Peace and Friendship Treaties. The Mi'kmaw language carries the knowledge, stories and relationships of the People and the land.
        </p>
      </section>

      <section className="rounded-3xl bg-white border-2 border-sand-200 p-5">
        <h2 className="text-xl font-black flex items-center gap-2"><BookOpen className="w-6 h-6 text-forest-600" /> Keep learning</h2>
        <p className="mt-2 text-slate-700 leading-relaxed">
          Use Mi'kmaw every day — at home, at school and with friends. These resources can help you go further.
        </p>
        <div className="mt-4 grid gap-2">
          {[
            ['Mi\'kmaw Kina\'matnewey', 'https://kinu.ca'],
            ['Mi\'gmaq-Mi\'kmaq Online Talking Dictionary', 'https://www.mikmaqonline.org'],
          ].map(([n, u]) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="min-h-[48px] rounded-2xl bg-forest-50 px-4 py-3 font-extrabold text-forest-700 flex items-center justify-between gap-2 hover:bg-forest-100">
              <span>{n}</span><ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          ))}
        </div>
      </section>


      <section className="rounded-3xl bg-sand-100 p-5 text-sm text-slate-700 leading-relaxed">
        <h3 className="font-black text-base text-ink">About the spelling</h3>
        <p className="mt-1">This app uses the <b>Francis-Smith orthography</b>, the standard writing system in Nova Scotia: vowels <span className="mk font-bold">a e i o u ɨ</span> and consonants <span className="mk font-bold">p t k q s j l m n w y</span>. An apostrophe after a vowel shows a long vowel.</p>
      </section>
    </div>
  );
}

/* =============================================================================
   FOOTER (with Reset Progress for testing)
   ============================================================================= */
function Footer({ onReset }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <footer className="mt-12 border-t-2 border-sand-200 pt-6 pb-4 text-center text-sm text-slate-500 space-y-3">
      <p className="flex items-center justify-center gap-2 font-bold"><Feather className="w-4 h-4 text-clay-500" /> Made with respect for Mi'kma'ki.</p>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} className="min-h-[44px] px-4 rounded-full text-xs font-extrabold text-slate-500 border-2 border-sand-200 hover:border-berry hover:text-berry inline-flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Reset progress
        </button>
      ) : (
        <div className="inline-flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-red-50 border-2 border-red-100 p-3 animate-pop">
          <span className="font-bold text-berry">Erase all XP, stars and streak?</span>
          <div className="flex gap-2">
            <Btn variant="danger" size="sm" onClick={() => { onReset(); setConfirming(false); }}>Yes, reset</Btn>
            <Btn variant="light" size="sm" onClick={() => setConfirming(false)}>Cancel</Btn>
          </div>
        </div>
      )}
    </footer>
  );
}

/* =============================================================================
   WELCOME (first launch) + SETTINGS + EDUCATOR REVIEW
   ============================================================================= */
function Sheet({ children, onClose, label }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-forest-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={label}>
      <div className="w-full sm:max-w-md bg-cream rounded-t-[2rem] sm:rounded-[2rem] p-5 pb-8 animate-pop max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>{children}</div>
    </div>
  );
}

function WelcomeModal({ onDone }) {
  const [name, setName] = useState('');
  const submit = (e) => { e.preventDefault(); onDone(name.trim().slice(0, 20)); };
  return (
    <Sheet label="Welcome">
      <form onSubmit={submit} className="text-center">
        <div className="mx-auto w-20 h-20 rounded-[1.6rem] bg-forest-600 border-b-[6px] border-forest-800 flex items-center justify-center animate-float"><Feather className="w-10 h-10 text-white" /></div>
        <p className="mk text-4xl font-extrabold text-forest-700 mt-4">Pjila'si!</p>
        <p className="font-bold text-slate-600">Welcome to Kina'masuti — let's learn Mi'kmaw together.</p>
        <label className="block text-left mt-6">
          <span className="text-sm font-black text-slate-600">What should we call you?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoFocus placeholder="Your first name"
            className="mt-1 w-full min-h-[56px] rounded-2xl border-2 border-sand-300 bg-white px-4 text-lg font-bold focus:outline-none focus:border-forest-500" />
        </label>
        <p className="text-xs text-slate-500 mt-2 text-left">Your name and progress stay on this device only.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Btn variant="forest" size="lg" type="submit" className="w-full">Let's go!</Btn>
          <Btn variant="ghost" type="button" onClick={() => onDone('')}>Skip for now</Btn>
        </div>
      </form>
    </Sheet>
  );
}

function Toggle({ on, onChange, label, hint, icon }) {
  return (
    <button type="button" onClick={() => onChange(!on)} role="switch" aria-checked={on}
      className="w-full min-h-[64px] flex items-center gap-3 rounded-2xl bg-white border-2 border-sand-200 px-4 py-3 text-left">
      <span className="w-10 h-10 shrink-0 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">{icon}</span>
      <span className="flex-1 min-w-0"><span className="block font-black">{label}</span>{hint && <span className="block text-xs text-slate-500">{hint}</span>}</span>
      <span className={cx('w-12 h-7 shrink-0 rounded-full p-1 transition-colors', on ? 'bg-forest-500' : 'bg-sand-300')}>
        <span className={cx('block w-5 h-5 rounded-full bg-white shadow transition-transform', on && 'translate-x-5')} />
      </span>
    </button>
  );
}

function SettingsSheet({ progress, onName, onReset, onClose, prefsState, setPrefsState }) {
  const [name, setName] = useState(progress.name || '');
  const [confirm, setConfirm] = useState(false);
  const setPref = (k, v) => { prefs[k] = v; savePrefs(); setPrefsState({ ...prefs }); if (k === 'sfx' && v) sfx('correct'); };
  return (
    <Sheet onClose={onClose} label="Settings">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Settings</h2>
        <button onClick={onClose} className="w-11 h-11 rounded-full hover:bg-sand-200 flex items-center justify-center" aria-label="Close"><X className="w-6 h-6" /></button>
      </div>
      <label className="block mt-4">
        <span className="text-sm font-black text-slate-600">Your name</span>
        <div className="mt-1 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="First name"
            className="flex-1 min-w-0 min-h-[52px] rounded-2xl border-2 border-sand-300 bg-white px-4 font-bold focus:outline-none focus:border-forest-500" />
          <Btn variant="forest" size="md" onClick={() => onName(name.trim())}>Save</Btn>
        </div>
      </label>
      <div className="mt-4 space-y-3">
        <Toggle on={prefsState.sfx} onChange={(v) => setPref('sfx', v)} label="Sound effects" hint="Chimes for right and wrong answers" icon={prefsState.sfx ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />} />
        <Toggle on={prefsState.voice} onChange={(v) => setPref('voice', v)} label="Computer voice" hint="Used only when a word has no recording yet. It can't pronounce Mi'kmaw correctly." icon={<Mic className="w-5 h-5" />} />
      </div>
      <div className="mt-6 rounded-2xl bg-white border-2 border-sand-200 p-4">
        <p className="font-black">Your progress</p>
        <p className="text-sm text-slate-600 mt-1">{progress.xp} XP · {Object.keys(progress.completed).length}/{languageData.lessons.length} lessons · best streak {progress.bestStreak || 0} days</p>
        {!confirm ? (
          <Btn variant="light" size="sm" className="mt-3 w-full" onClick={() => setConfirm(true)}><RotateCcw className="w-4 h-4" /> Reset progress</Btn>
        ) : (
          <div className="mt-3 rounded-xl bg-red-50 p-3 animate-pop">
            <p className="font-bold text-berry text-sm">Erase all XP, stars and streak on this device?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Btn variant="danger" size="sm" onClick={() => { onReset(); setConfirm(false); onClose(); }}>Yes, reset</Btn>
              <Btn variant="light" size="sm" onClick={() => setConfirm(false)}>Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* =============================================================================
   APP SHELL + NAVIGATION
   ============================================================================= */
const TABS = [
  { id: 'home', label: 'Learn', icon: Home },
  { id: 'alphabet', label: 'Alphabet', icon: Type },
  { id: 'practice', label: 'Practice', icon: Gamepad2 },
  { id: 'community', label: 'Community', icon: Users },
];
const tabFromHash = () => { const h = (location.hash || '').slice(1); return TABS.some((t) => t.id === h) ? h : 'home'; };

export default function App() {
  const [tab, setTabState] = useState(tabFromHash);
  const [progress, setProgress] = useState(loadProgress);
  const [session, setSession] = useState(null); // { deck, mode, lessonId? }
  const [summary, setSummary] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [prefsState, setPrefsState] = useState({ ...prefs });

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { const h = () => { setTabState(tabFromHash()); setSession(null); }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);

  const setTab = (id) => { setTabState(id); setSession(null); stopAll(); try { history.replaceState(null, '', `#${id}`); } catch {} window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const startLesson = (lesson) => { setSession({ deck: lesson.deck, mode: lesson.mode, lessonId: lesson.id }); setTabState('practice'); try { history.replaceState(null, '', '#practice'); } catch {} window.scrollTo({ top: 0 }); };

  const finish = (sess, r) => {
    const today = todayStr();
    let earned = r.xp;
    const lessonId = sess.lessonId || languageData.lessons.find((l) => l.deck === sess.deck && l.mode === sess.mode && !progress.completed[l.id])?.id;
    const firstTime = lessonId && !progress.completed[lessonId];
    if (firstTime) earned += XP.lessonBonus;
    setProgress((p) => {
      const gap = p.lastActive ? dayDiff(p.lastActive, today) : null;
      const streak = gap === 0 ? p.streak || 1 : gap === 1 ? p.streak + 1 : 1;
      const completed = { ...p.completed };
      if (lessonId) completed[lessonId] = { stars: Math.max(r.stars, completed[lessonId]?.stars || 0), at: today };
      return { ...p, xp: p.xp + earned, completed, streak, bestStreak: Math.max(p.bestStreak || 0, streak), lastActive: today };
    });
    const gap = progress.lastActive ? dayDiff(progress.lastActive, today) : null;
    const newStreak = gap === 0 ? progress.streak || 1 : gap === 1 ? progress.streak + 1 : 1;
    setSummary({ ...r, xp: earned, streak: newStreak, sess,
      title: sess.mode === 'quiz' ? 'Quiz complete!' : sess.mode === 'phrase' ? 'Phrases built!' : 'Deck complete!',
      subtitle: firstTime ? `Lesson bonus +${XP.lessonBonus} XP included` : deckById[sess.deck]?.title });
  };

  const reset = () => { const b = { ...blankProgress(), name: progress.name, onboarded: true }; setProgress(b); try { localStorage.removeItem(STORE_KEY); } catch {} setSession(null); };
  const inGame = tab === 'practice' && session;

  return (
    <div className="min-h-screen bg-cream text-ink overflow-x-hidden">
      {/* Desktop / tablet header */}
      <header className="hidden md:block sticky top-0 z-30 bg-cream/90 backdrop-blur border-b-2 border-sand-200">
        <div className="max-w-5xl mx-auto px-6 h-[72px] flex items-center gap-6">
          <button onClick={() => setTab('home')} className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-forest-600 border-b-4 border-forest-800 flex items-center justify-center"><Feather className="w-5 h-5 text-white" /></span>
            <span className="text-left leading-tight"><span className="mk block font-black text-forest-700 text-lg">Kina'masuti</span><span className="block text-[11px] font-bold text-slate-500">Learn Mi'kmaw</span></span>
          </button>
          <nav className="flex gap-1 ml-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={cx('min-h-[48px] px-4 rounded-2xl font-extrabold flex items-center gap-2 transition-all border-2',
                  tab === id ? 'bg-forest-50 text-forest-700 border-forest-300' : 'text-slate-500 border-transparent hover:bg-sand-100')}>
                <Icon className="w-5 h-5" /> {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 pl-4 border-l-2 border-sand-200">
            <span className="flex items-center gap-1 font-black text-orange-500"><Flame className="w-5 h-5" />{progress.streak}</span>
            <span className="flex items-center gap-1 font-black text-clay-600"><Zap className="w-5 h-5" />{progress.xp}</span>
            <button onClick={() => setShowSettings(true)} className="w-11 h-11 rounded-full hover:bg-sand-100 flex items-center justify-center" aria-label="Settings"><Settings className="w-5 h-5 text-slate-500" /></button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      {!inGame && (
        <div className="md:hidden sticky top-0 z-30 bg-cream/90 backdrop-blur border-b-2 border-sand-200" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="px-4 h-14 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-forest-600 border-b-[3px] border-forest-800 flex items-center justify-center"><Feather className="w-4 h-4 text-white" /></span>
              <span className="mk font-black text-forest-700">Kina'masuti</span>
            </span>
            <span className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-black text-orange-500"><Flame className="w-5 h-5" />{progress.streak}</span>
              <span className="flex items-center gap-1 font-black text-clay-600"><Zap className="w-5 h-5" />{progress.xp}</span>
              <button onClick={() => setShowSettings(true)} className="w-11 h-11 -mr-2 rounded-full active:bg-sand-200 flex items-center justify-center" aria-label="Settings"><Settings className="w-5 h-5 text-slate-500" /></button>
            </span>
          </div>
        </div>
      )}

      <main className={cx('max-w-5xl mx-auto px-4 sm:px-6 pt-5', inGame ? 'pb-10' : 'pb-28 md:pb-10')}>
        {tab === 'home' && <HomeView progress={progress} onStartLesson={startLesson} />}
        {tab === 'alphabet' && <AlphabetView />}
        {tab === 'practice' && <PracticeView session={session} setSession={setSession} onFinish={finish} progress={progress} />}
        {tab === 'community' && <CommunityView />}
        {!inGame && <Footer onReset={reset} />}
      </main>

      {/* Mobile bottom tab bar */}
      {!inGame && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t-2 border-sand-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className="min-h-[64px] flex flex-col items-center justify-center gap-1" aria-current={tab === id ? 'page' : undefined}>
                <span className={cx('w-14 h-8 rounded-full flex items-center justify-center transition-all', tab === id ? 'bg-forest-100 text-forest-700 scale-105' : 'text-slate-400')}><Icon className="w-6 h-6" /></span>
                <span className={cx('text-[11px] font-extrabold', tab === id ? 'text-forest-700' : 'text-slate-500')}>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {!progress.onboarded && <WelcomeModal onDone={(name) => setProgress((p) => ({ ...p, name, onboarded: true }))} />}
      {showSettings && (
        <SettingsSheet progress={progress} prefsState={prefsState} setPrefsState={setPrefsState} onClose={() => setShowSettings(false)}
          onName={(name) => { setProgress((p) => ({ ...p, name })); setShowSettings(false); }} onReset={reset} />
      )}

      {summary && (
        <SummaryModal {...summary}
          onDone={() => { setSummary(null); setSession(null); setTab('home'); }}
          onRetry={() => { const s = summary.sess; setSummary(null); setSession(null); setTimeout(() => setSession({ ...s, lessonId: undefined }), 0); }} />
      )}
    </div>
  );
}
