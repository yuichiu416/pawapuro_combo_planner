import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { cn, getSkillTypeStyle } from '../utils/style';
import skillsDataRaw from '../data/skills.json';

const skillsData = skillsDataRaw as Record<string, any>;

const SkillList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Use Memo for performance and to handle dictionary-to-array conversion
  const filteredSkills = useMemo(() => {
    if (!skillsData) return [];
    
    const skillEntries = Object.values(skillsData);
    const term = searchTerm.toLowerCase().trim();

    if (!term) return skillEntries;

    return skillEntries.filter(skill => {
      const name = (skill?.name ?? "").toLowerCase();
      const description = (skill?.description ?? "").toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search skills by name or description..."
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Count */}
      <div className="px-2 flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Found {filteredSkills.length} Skills
        </span>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill, idx) => (
            <div 
              key={`${skill.name}-${idx}`} 
              className="group flex items-start gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className={cn(
                "mt-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap", 
                getSkillTypeStyle(skill.type)
              )}>
                {skill.type || 'UNKNOWN'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-800 text-lg">
                    {skill.name}
                  </h4>
                  {skill.isCustom && (
                    <span className="text-[9px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black tracking-tighter italic">
                      CUSTOM
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  {skill.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic">No matching skills found...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillList;