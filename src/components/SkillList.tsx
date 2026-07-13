import { Search } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import skillsDataJa from '../data/skills.json';
import skillsDataEn from '../data/skills_en.json';
import skillsDataZh from '../data/skills_zh.json';
import { cn, getSkillTypeStyle } from '../utils/style';

const skillsDataJaTyped = skillsDataJa as Record<string, any>;

const LOCALE_SKILLS: Record<string, Record<string, any>> = {
  ja: skillsDataJa as Record<string, any>,
  en: skillsDataEn as Record<string, any>,
  zh: skillsDataZh as Record<string, any>,
};

const SkillList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, i18n } = useTranslation();

  // Use Memo for performance and to handle dictionary-to-array conversion.
  // Each skill's japanese key is the canonical identifier used across all
  // game data; name/description are localized per current language, falling
  // back to the Japanese key/description when a translation isn't filled in yet.
  const filteredSkills = useMemo(() => {
    if (!skillsDataJaTyped) return [];

    const localeSkills = LOCALE_SKILLS[i18n.language] ?? skillsDataJaTyped;

    const skillEntries = Object.entries(skillsDataJaTyped).map(([key, jaSkill]) => {
      const localized = localeSkills[key] ?? {};
      return {
        key,
        name: localized.name || key,
        description: localized.description || jaSkill.description || jaSkill.effect || '',
        type: jaSkill.type,
        category: jaSkill.category,
      };
    });
    const term = searchTerm.toLowerCase().trim();

    if (!term) return skillEntries;

    return skillEntries.filter((skill) => {
      const name = skill.name.toLowerCase();
      const description = skill.description.toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }, [searchTerm, i18n.language]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
        <input
          type="text"
          placeholder={t('ui.search_skills_placeholder')}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Count */}
      <div className="px-2 flex justify-between items-center">
        <span className="text-sm font-black text-black uppercase tracking-widest">
          {t('ui.skills_found_count', { count: filteredSkills.length })}
        </span>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <div
              key={skill.key}
              className="flex items-start gap-4 p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div
                className={cn(
                  'shrink-0 mt-0.5 px-4 py-2 rounded-xl border-2 font-black text-base whitespace-nowrap',
                  getSkillTypeStyle(skill.type),
                )}
              >
                {skill.name}
              </div>

              <p className="flex-1 text-base text-black font-medium leading-relaxed pt-2.5">
                {skill.description}
              </p>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-black font-bold">{t('ui.no_skills_found')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillList;
