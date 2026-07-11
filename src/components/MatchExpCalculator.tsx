// src/components/MatchExpCalculator.tsx
import { Calculator, ChevronDown, ChevronUp, Plus, Save, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { cn } from '@/utils/style';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatKey = '筋力' | '敏捷' | '技術' | '変化球' | '精神';

interface EventDef {
  id: string;
  label: string;
  note?: string;
  stats: Record<StatKey, number>;
}

interface GameData {
  id: string;
  name: string;
  counts: Record<string, number>;
  ownScore: number;
  oppScore: number;
}

export interface MatchExpSaveData {
  difficulty: 0.5 | 1.0 | 1.2;
  games: GameData[];
}

interface MatchExpCalculatorProps {
  slotNumber: number;
  savedData: MatchExpSaveData | null;
  onSave: (data: MatchExpSaveData) => void;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BATTING_EVENTS: EventDef[] = [
  { id: 'single',    label: 'シングルヒット',       stats: { 筋力:3,  敏捷:3,  技術:4,  変化球:0,  精神:2  } },
  { id: 'double',    label: 'ツーベースヒット',      stats: { 筋力:7,  敏捷:8,  技術:5,  変化球:0,  精神:5  } },
  { id: 'triple',    label: 'スリーベースヒット',    stats: { 筋力:8,  敏捷:10, 技術:5,  変化球:0,  精神:8  } },
  { id: 'hr',        label: 'ホームラン',           stats: { 筋力:10, 敏捷:0,  技術:5,  変化球:0,  精神:9  } },
  { id: 'bunt',      label: '犠打',                stats: { 筋力:0,  敏捷:4,  技術:4,  変化球:0,  精神:5  } },
  { id: 'sf',        label: '犠牲フライ',           stats: { 筋力:3,  敏捷:5,  技術:3,  変化球:0,  精神:9  } },
  { id: 'steal',     label: '盗塁',                note: 'COM操作分含む', stats: { 筋力:2,  敏捷:8,  技術:2,  変化球:0,  精神:0  } },
];

const PITCHING_EVENTS: EventDef[] = [
  { id: 'inning',    label: '投球操作イニング',       note: '同イニング複数回でも1回計算', stats: { 筋力:3, 敏捷:1, 技術:1, 変化球:3,  精神:3  } },
  { id: 'straight',  label: 'ストレート系で打ち取り', note: '第2・オリ変含む', stats: { 筋力:7, 敏捷:2, 技術:3, 変化球:0,  精神:5  } },
  { id: 'curve',     label: '変化球で打ち取り',       stats: { 筋力:0, 敏捷:1, 技術:7, 変化球:16, 精神:5  } },
  { id: 'strikeout', label: '奪三振で打ち取り',       stats: { 筋力:5, 敏捷:1, 技術:5, 変化球:5,  精神:9  } },
  { id: 'fly',       label: 'フライ/ライナー打ち取り', stats: { 筋力:4, 敏捷:5, 技術:4, 変化球:2,  精神:6  } },
  { id: 'grounder',  label: 'ゴロで打ち取り',         note: 'ゴロ打ち取りと併殺は重複しない', stats: { 筋力:2, 敏捷:2, 技術:6, 変化球:4,  精神:8  } },
  { id: 'dp',        label: '併殺',                  note: 'ストレート併殺は両方を加算', stats: { 筋力:3, 敏捷:10, 技術:10, 変化球:5, 精神:10 } },
];

const ALL_EVENTS = [...BATTING_EVENTS, ...PITCHING_EVENTS];
const STAT_KEYS: StatKey[] = ['筋力', '敏捷', '技術', '変化球', '精神'];

const DEFAULT_GAMES: Record<string, { label: string; opponent: string }[]> = {
  '2024-2025': [
    { label: '一回戦', opponent: '熱盛' },
    { label: '二回戦', opponent: 'クイーンココロ' },
    { label: '三回戦', opponent: '零武' },
    { label: '準決勝', opponent: 'Ω鳴海' },
    { label: '決勝',   opponent: 'サッたん' },
  ],
  '2026-2027': [
    { label: '一回戦', opponent: '' },
    { label: '二回戦', opponent: '' },
    { label: '三回戦', opponent: '' },
    { label: '準決勝', opponent: '' },
    { label: '決勝',   opponent: '' },
  ],
};

function makeDefaultGames(version: string): GameData[] {
  const defs = DEFAULT_GAMES[version] ?? DEFAULT_GAMES['2026-2027'];
  return defs.map((d, i) => ({
    id: `game-${i}`,
    name: d.opponent ? `${d.label}（${d.opponent}）` : d.label,
    counts: Object.fromEntries(ALL_EVENTS.map(e => [e.id, 0])),
    ownScore: 0,
    oppScore: 0,
  }));
}

function calcStats(game: GameData, difficulty: number): Record<StatKey, number> {
  const base: Record<StatKey, number> = { 筋力:0, 敏捷:0, 技術:0, 変化球:0, 精神:0 };

  ALL_EVENTS.forEach(ev => {
    const n = game.counts[ev.id] ?? 0;
    if (n > 0) {
      STAT_KEYS.forEach(k => { base[k] += ev.stats[k] * n; });
    }
  });

  const diff = game.ownScore - game.oppScore;
  const scoreMult = diff >= 10 ? 2.0 : diff > 0 ? 1 + diff * 0.1 : 1.0;
  const lossCapped = Math.min(game.oppScore, 4);
  const penaltyMult = 1.0 - lossCapped * 0.06;
  const total = scoreMult * penaltyMult * difficulty;

  const result: Record<StatKey, number> = {} as Record<StatKey, number>;
  STAT_KEYS.forEach(k => { result[k] = Math.round(base[k] * total); });
  return result;
}

function sumStats(games: GameData[], difficulty: number): Record<StatKey, number> {
  const sum: Record<StatKey, number> = { 筋力:0, 敏捷:0, 技術:0, 変化球:0, 精神:0 };
  games.forEach(g => {
    const r = calcStats(g, difficulty);
    STAT_KEYS.forEach(k => { sum[k] += r[k]; });
  });
  return sum;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Counter: React.FC<{ value: number; onChange: (v: number) => void; testId?: string }> = ({ value, onChange, testId }) => (
  <div className="flex items-center gap-1">
    <button
      type="button"
      aria-label="減らす"
      data-testid={testId ? `${testId}-decrement` : undefined}
      onClick={() => onChange(Math.max(0, value - 1))}
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-lg leading-none active:scale-95 transition-all"
    >−</button>
    <span data-testid={testId ? `${testId}-value` : undefined} className="w-6 text-center text-sm font-semibold text-slate-800">{value}</span>
    <button
      type="button"
      aria-label="増やす"
      data-testid={testId ? `${testId}-increment` : undefined}
      onClick={() => onChange(value + 1)}
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium text-lg leading-none active:scale-95 transition-all"
    >+</button>
  </div>
);

const StatBadge: React.FC<{ label: string; value: number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div
    data-testid={`stat-badge-${label}`}
    className={cn(
    'flex flex-col items-center rounded-xl px-3 py-2 min-w-[3.5rem]',
    highlight ? 'bg-[#0059C1] text-white' : 'bg-slate-100 text-slate-700'
  )}>
    <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
    <span className="text-lg font-black leading-tight">+{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const MatchExpCalculator: React.FC<MatchExpCalculatorProps> = ({
  slotNumber,
  savedData,
  onSave,
  onClose,
}) => {
  const { version } = useGameVersion();

  const initData = useCallback((): MatchExpSaveData => {
    if (savedData) return JSON.parse(JSON.stringify(savedData));
    return { difficulty: 1.0, games: makeDefaultGames(version) };
  }, [savedData, version]);

  const [data, setData] = useState<MatchExpSaveData>(initData);
  const [activeTab, setActiveTab] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showBatting, setShowBatting] = useState(true);
  const [showPitching, setShowPitching] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName !== null && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const markDirty = (updater: (prev: MatchExpSaveData) => MatchExpSaveData) => {
    setData(prev => updater(prev));
    setIsDirty(true);
  };

  const updateGame = (field: keyof GameData, value: any) => {
    markDirty(prev => ({
      ...prev,
      games: prev.games.map((g, i) => i === activeTab ? { ...g, [field]: value } : g),
    }));
  };

  const updateCount = (eventId: string, value: number) => {
    markDirty(prev => ({
      ...prev,
      games: prev.games.map((g, i) => i === activeTab
        ? { ...g, counts: { ...g.counts, [eventId]: value } }
        : g),
    }));
  };

  const addGame = () => {
    markDirty(prev => ({
      ...prev,
      games: [...prev.games, {
        id: `game-${Date.now()}`,
        name: `試合 ${prev.games.length + 1}`,
        counts: Object.fromEntries(ALL_EVENTS.map(e => [e.id, 0])),
        ownScore: 0,
        oppScore: 0,
      }],
    }));
    setActiveTab(data.games.length);
  };

  const deleteGame = (idx: number) => {
    if (data.games.length <= 1) return;
    markDirty(prev => ({
      ...prev,
      games: prev.games.filter((_, i) => i !== idx),
    }));
    setActiveTab(prev => Math.min(prev, data.games.length - 2));
  };

  const handleClose = () => {
    if (isDirty) { setShowConfirmClose(true); } else { onClose(); }
  };

  const handleSave = () => {
    onSave(data);
    setIsDirty(false);
  };

  const game = data.games[activeTab] ?? data.games[0];
  const gameResult = calcStats(game, data.difficulty);
  const totalResult = sumStats(data.games, data.difficulty);
  const diff = game.ownScore - game.oppScore;
  const scoreMult = diff >= 10 ? 2.0 : diff > 0 ? 1 + diff * 0.1 : 1.0;
  const penaltyMult = 1.0 - Math.min(game.oppScore, 4) * 0.06;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#0059C1]" />
            <span className="font-black text-sm uppercase tracking-wide text-slate-800">獲得経験値計算</span>
            {isDirty && <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">未保存</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="exp-calc-save-btn"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0059C1] text-white rounded-lg text-xs font-black uppercase tracking-wide hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Save size={13} />保存
            </button>
            <button type="button" data-testid="exp-calc-close-btn" onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">難易度</span>
          {([['ルーキー', 0.5], ['ノーマル', 1.0], ['達人', 1.2]] as const).map(([label, val]) => (
            <button
              key={val}
              type="button"
              onClick={() => markDirty(prev => ({ ...prev, difficulty: val }))}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide transition-all',
                data.difficulty === val
                  ? 'bg-[#0059C1] text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
              )}
            >{label} ×{val}</button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto">
          {data.games.map((g, i) => (
            <div key={g.id} className="flex items-center shrink-0">
              {editingName === g.id ? (
                <input
                  ref={nameInputRef}
                  defaultValue={g.name}
                  onBlur={e => {
                    if (e.target.value.trim()) updateGame('name', e.target.value.trim());
                    setEditingName(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setEditingName(null);
                  }}
                  className="w-28 text-xs font-bold px-2 py-1 border-2 border-blue-400 rounded-t-lg outline-none bg-white"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab(i)}
                  onDoubleClick={() => setEditingName(g.id)}
                  title="ダブルクリックで名前変更"
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all whitespace-nowrap',
                    activeTab === i
                      ? 'bg-white border-t border-x border-slate-200 text-[#0059C1] -mb-px z-10 relative'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >{g.name}</button>
              )}
              {activeTab === i && data.games.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteGame(i)}
                  className="ml-1 text-slate-300 hover:text-red-400 transition-colors"
                ><Trash2 size={11} /></button>
              )}
            </div>
          ))}
          <button
            type="button"
            data-testid="exp-calc-add-game-btn"
            onClick={addGame}
            className="ml-1 p-1 text-slate-400 hover:text-[#0059C1] transition-colors shrink-0"
            title="試合を追加"
          ><Plus size={14} /></button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 border-t border-slate-100">

          {/* Score inputs */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">自チーム得点</p>
              <Counter testId="exp-calc-own-score" value={game.ownScore} onChange={v => updateGame('ownScore', v)} />
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">失点</p>
              <Counter testId="exp-calc-opp-score" value={game.oppScore} onChange={v => updateGame('oppScore', v)} />
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">補正</p>
              <p className="text-xs font-black text-slate-700">
                ×{scoreMult.toFixed(1)}
                {game.oppScore > 0 && <span className="text-amber-500 ml-1">−{Math.min(game.oppScore, 4) * 6}%</span>}
              </p>
            </div>
          </div>

          {/* Batting section */}
          <button
            type="button"
            onClick={() => setShowBatting(p => !p)}
            className="flex items-center gap-2 w-full mb-2 text-left"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">打撃イベント</span>
            {showBatting ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
          </button>
          {showBatting && (
            <div className="space-y-1 mb-4">
              {BATTING_EVENTS.map(ev => (
                <div key={ev.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="text-sm text-slate-700">{ev.label}</p>
                    {ev.note && <p className="text-[10px] text-slate-400">{ev.note}</p>}
                  </div>
                  <Counter testId={`exp-calc-event-${ev.id}`} value={game.counts[ev.id] ?? 0} onChange={v => updateCount(ev.id, v)} />
                </div>
              ))}
            </div>
          )}

          {/* Pitching section */}
          <button
            type="button"
            onClick={() => setShowPitching(p => !p)}
            className="flex items-center gap-2 w-full mb-2 text-left"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">投球イベント</span>
            {showPitching ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
          </button>
          {showPitching && (
            <div className="space-y-1 mb-4">
              {PITCHING_EVENTS.map(ev => (
                <div key={ev.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="text-sm text-slate-700">{ev.label}</p>
                    {ev.note && <p className="text-[10px] text-slate-400">{ev.note}</p>}
                  </div>
                  <Counter testId={`exp-calc-event-${ev.id}`} value={game.counts[ev.id] ?? 0} onChange={v => updateCount(ev.id, v)} />
                </div>
              ))}
            </div>
          )}

          {/* Per-game result */}
          <div data-testid="exp-calc-game-result" className="bg-slate-50 rounded-xl p-4 mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">この試合の経験値</p>
            <div className="flex gap-2 flex-wrap">
              {STAT_KEYS.map(k => <StatBadge key={k} label={k} value={gameResult[k]} />)}
            </div>
          </div>

          {/* Total across all games */}
          {data.games.length > 1 && (
            <div data-testid="exp-calc-total-result" className="bg-[#0059C1]/5 border border-[#0059C1]/20 rounded-xl p-4">
              <p className="text-[10px] font-black text-[#0059C1] uppercase tracking-wider mb-3">全試合合計</p>
              <div className="flex gap-2 flex-wrap">
                {STAT_KEYS.map(k => <StatBadge key={k} label={k} value={totalResult[k]} highlight />)}
              </div>
            </div>
          )}
        </div>

        {/* Confirm close dialog */}
        {showConfirmClose && (
          <div data-testid="exp-calc-confirm-dialog" className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-2xl backdrop-blur-sm z-10">
            <div className="text-center px-8">
              <p className="font-black text-slate-800 mb-2">未保存の変更</p>
              <p className="text-sm text-slate-500 mb-6">変更が保存されていません。このまま閉じますか？</p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  data-testid="exp-calc-cancel-close-btn"
                  onClick={() => setShowConfirmClose(false)}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                >キャンセル</button>
                <button
                  type="button"
                  data-testid="exp-calc-confirm-close-btn"
                  onClick={onClose}
                  className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600"
                >閉じる</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ─── Trigger Button ───────────────────────────────────────────────────────────

export const MatchExpButton: React.FC<{
  slotNumber: number;
  savedData: MatchExpSaveData | null;
  onSave: (data: MatchExpSaveData) => void;
}> = ({ slotNumber, savedData, onSave }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-testid="match-exp-calc-btn"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wide hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all"
      >
        <Calculator size={13} />
        獲得経験値計算
      </button>
      {open && (
        <MatchExpCalculator
          slotNumber={slotNumber}
          savedData={savedData}
          onSave={(d) => { onSave(d); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
