import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Users, Map as MapIcon } from 'lucide-react';
import { cn, getSkillTypeStyle } from './utils/style';

// Pure Logic Data
import mapsDataRaw from './data/maps.json';
import combosDataRaw from './data/combos.json';
import skillsDataRaw from './data/skills.json';

// TypeScript Types
interface Reward {
  skills: string[];
  exp: Record<string, number>;
}
interface Combo {
  id: string;
  members: string[];
  rewards: Reward;
}
interface MapItem {
  id: string;
  combos: string[];
}
interface Skill {
  id: string;
  type: string;
}

const mapsData = mapsDataRaw as Record<string, MapItem>;
const combosData = combosDataRaw as Record<string, Combo>;
const skillsData = skillsDataRaw as Record<string, Skill>;

const App: React.FC = () => {
  const { t, i18n } = useTranslation(['skills', 'characters', 'maps']);
  const [selectedMap, setSelectedMap] = useState<string>(Object.keys(mapsData)[0] || "");

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight underline decoration-blue-500 underline-offset-4">
            PAWAPURO 2024 COMBO DB
          </h1>
        </div>
        
        <div className="flex bg-white rounded-full shadow-sm border p-1">
          <Globe className="w-4 h-4 m-2 text-slate-400" />
          {['ja', 'zh-TW', 'en'].map((lng) => (
            <button
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={cn(
                "px-4 py-1 rounded-full text-xs font-bold uppercase transition-all",
                i18n.language === lng ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {lng}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Selection Navigation */}
        <nav className="lg:col-span-3 space-y-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <MapIcon size={16} /> {t('maps:select_map', { defaultValue: 'Locations' })}
          </h2>
          {Object.values(mapsData).map((map) => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm",
                selectedMap === map.id 
                  ? "bg-white border-blue-500 text-blue-600 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100"
              )}
            >
              {t(`maps:${map.id}`)}
            </button>
          ))}
        </nav>

        {/* Combo Display Area */}
        <section className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapsData[selectedMap]?.combos.map((comboId) => {
              const combo = combosData[comboId];
              return (
                <div key={comboId} className="bg-white border rounded-2xl p-5 hover:border-blue-300 transition-colors shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {combo.members.map((mid, idx) => (
                      <React.Fragment key={mid}>
                        <span className="text-base font-extrabold">{t(`characters:${mid}`)}</span>
                        {idx < combo.members.length - 1 && <span className="text-slate-300">×</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {combo.rewards.skills.map((sid) => (
                        <div 
                          key={sid} 
                          title={t(`skills:${sid}.desc`)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-black uppercase border-b-2",
                            getSkillTypeStyle(skillsData[sid]?.type)
                          )}
                        >
                          {t(`skills:${sid}.name`)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(combo.rewards.exp).map(([key, val]) => (
                        <div key={key} className="text-xs font-bold text-slate-500">
                          {key.toUpperCase()} <span className="text-emerald-500">+{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;