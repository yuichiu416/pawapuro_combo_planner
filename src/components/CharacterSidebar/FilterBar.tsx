// src/components/CharacterSidebar/FilterBar.tsx

import { MapPin, Search } from 'lucide-react';
import type React from 'react';
import { POSITIONS } from '@/constants';
import { cn } from '../../utils/style';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  posFilter: string | null;
  setPosFilter: (val: string | null) => void;
  mapFilter: string | null;
  setMapFilter: (val: string | null) => void;
  filterNoKanji: boolean;
  toggleKanjiFilter: () => void;
  isMapExpanded: boolean;
  setIsMapExpanded: (val: boolean) => void;
  availableMaps: string[];
  testId: string;
}

export const FilterBar: React.FC<FilterBarProps> = (props) => (
  <>
    <div className="flex items-center gap-1">
      <button
        data-testid={`${props.testId}-kanji-filter-toggle`}
        onClick={props.toggleKanjiFilter}
        className={cn(
          'w-7 h-7 rounded-lg text-sm font-black border flex items-center justify-center transition-all',
          props.filterNoKanji
            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
            : 'bg-white text-black border-slate-200 hover:border-slate-300',
        )}
      >
        ア
      </button>
      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
      <button
        data-testid={`${props.testId}-pos-filter-all`}
        onClick={() => props.setPosFilter(null)}
        className={cn(
          'px-2 h-7 rounded-lg text-xs font-black border uppercase transition-all',
          !props.posFilter
            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
            : 'bg-white text-black border-slate-200',
        )}
      >
        全
      </button>
      {POSITIONS.map((pos) => (
        <button
          key={pos}
          data-testid={`${props.testId}-pos-filter-${pos}`}
          onClick={() => props.setPosFilter(pos === props.posFilter ? null : pos)}
          className={cn(
            'w-7 h-7 rounded-lg text-xs font-black border flex items-center justify-center transition-all',
            props.posFilter === pos
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
              : 'bg-white text-black border-slate-200 hover:border-slate-300',
          )}
        >
          {pos}
        </button>
      ))}
    </div>

    <div className="flex gap-1.5 pt-0.5">
      <button
        data-testid={`${props.testId}-map-filter-trigger`}
        onClick={() => props.setIsMapExpanded(!props.isMapExpanded)}
        className={cn(
          'flex items-center gap-1 px-2 h-8 rounded-lg text-xs font-black border uppercase transition-all shrink-0',
          !props.mapFilter
            ? 'bg-slate-800 border-slate-800 text-white'
            : 'bg-white text-black border-slate-200',
        )}
      >
        <MapPin size={10} className={props.mapFilter ? 'text-blue-400' : ''} />
        {props.mapFilter || '指定なし'}
      </button>

      <div className="relative flex-1 group">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black group-focus-within:text-blue-500"
          size={12}
        />
        <input
          data-testid={`${props.testId}-character-search-input`}
          type="text"
          placeholder="名前・スキルで検索"
          value={props.searchTerm}
          onChange={(e) => props.setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-2 h-8 bg-slate-50 border border-slate-200 rounded-lg font-black text-xs uppercase outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
        />
      </div>
    </div>

    {props.isMapExpanded && (
      <div
        data-testid={`${props.testId}-map-filter-popover`}
        className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-1"
      >
        <button
          data-testid={`${props.testId}-map-filter-option-any`}
          onClick={() => {
            props.setMapFilter(null);
            props.setIsMapExpanded(false);
          }}
          className={cn(
            'px-2 py-1 rounded-md text-xs font-black border uppercase transition-all',
            !props.mapFilter ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white text-black',
          )}
        >
          指定なし
        </button>
        {props.availableMaps.map((map) => (
          <button
            key={map}
            data-testid={`${props.testId}-map-filter-option-${map}`}
            onClick={() => {
              props.setMapFilter(map);
              props.setIsMapExpanded(false);
            }}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-black border uppercase transition-all',
              props.mapFilter === map
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white text-black',
            )}
          >
            {map}
          </button>
        ))}
      </div>
    )}
  </>
);
