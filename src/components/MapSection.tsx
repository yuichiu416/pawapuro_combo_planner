// src/components/MapSection.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { ComboCard } from '@/components/ComboCard';

interface MapSectionProps {
  mapName: string;
  combos: string[][];
  selectedComboIds: Set<string>;
  toggleCombo: (id: string) => void;
  ownedChars: Set<string>;
  toggleCharacter: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
}

export const MapSection: React.FC<MapSectionProps> = ({
  mapName, combos, selectedComboIds, toggleCombo, ...gridProps
}) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <MapPin className="text-blue-600" size={28} />
      <h2 className="font-black text-3xl italic uppercase">{mapName}</h2>
    </div>
    <div className="grid gap-6">
      {combos?.map((names) => {
        const comboId = names.join('&');
        return (
          <ComboCard 
            key={comboId}
            names={names}
            isSelected={selectedComboIds.has(comboId)}
            onToggleCombo={() => toggleCombo(comboId)}
            {...gridProps}
          />
        );
      })}
    </div>
  </section>
);