/**
 * Categorizes characters into two groups based on whether they are part of any combo,
 * filtered by their field position.
 */
export const getCategorizedChars = (characters: any, combos: any[], positionFilter: string) => {
  // Extract all unique character names involved in any combo
  const comboCharNames = new Set(combos.flatMap((c) => c.char_names.map((n: string) => n.trim())));

  // Filter characters based on the selected position (pitcher, catcher, etc.)
  const filteredNames = Object.keys(characters).filter((name) => {
    if (positionFilter === 'all') return true;
    return characters[name].position === positionFilter;
  });

  const hasCombo: string[] = [];
  const noCombo: string[] = [];

  filteredNames.forEach((name) => {
    if (comboCharNames.has(name.trim())) {
      hasCombo.push(name);
    } else {
      noCombo.push(name);
    }
  });

  return { hasCombo, noCombo };
};
