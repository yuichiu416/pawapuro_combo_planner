// src/__tests__/components/CharacterLinkIcon.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CharacterLinkIcon } from '@/components/CharacterLink/CharacterLinkIcon';
import type { LinkData } from '@/types';

vi.mock('@/data/skills.json', () => ({
  default: {
    '根性◯': { type: 'blue', description: '', category: 'fielder' },
    ド根性: { type: 'gold', description: '', category: 'fielder' },
    '緩急◯': { type: 'blue', description: '', category: 'pitcher' },
    変幻自在: { type: 'gold', description: '', category: 'pitcher' },
  },
}));

afterEach(() => cleanup());

const upgradeLink: LinkData = {
  format: 'upgrade',
  condition: '二打席連続で外野に飛ばす',
  granted_skills: ['ド根性', '変幻自在'],
  prerequisite_skills: [
    { name: '根性◯', level: 1, verified: true },
    { name: '緩急◯', level: 2, verified: true },
  ],
  upgrades: [
    { from: { name: '根性◯', level: 1, type: 'blue' }, to: { name: 'ド根性', type: 'gold' } },
    { from: { name: '緩急◯', level: 2, type: 'blue' }, to: { name: '変幻自在', type: 'gold' } },
  ],
  stats: { 筋力: 30, 精神: 15 },
  note: null,
  raw: 'raw text',
  source: 'tournament',
};

const ambiguousLink: LinkData = {
  format: 'upgrade',
  condition: 'ストレートをヒットにする',
  granted_skills: [['バズーカ送球', 'ささやき戦術'], '精密機械'],
  prerequisite_skills: [
    { name: '対ストレート◯', level: 1, verified: true },
    { name: '低め◯', level: 1, verified: true },
  ],
  upgrades: [],
  stats: { 敏捷: 15, 技術: 5 },
  note: null,
  raw: 'raw text',
  source: 'tournament',
};

const descriptiveLink: LinkData = {
  format: 'descriptive',
  condition: null,
  granted_skills: [],
  prerequisite_skills: [],
  upgrades: [],
  skill_groups: [
    ['外角必打', '怪物球威'],
    ['アウトコースヒッター', '重い球'],
  ],
  stats: { 筋力: 20, 変化球: 30 },
  note: null,
  raw: 'raw text',
  source: 'tournament',
};

describe('CharacterLinkIcon', () => {
  it('renders children unchanged and shows no tooltip when there is no link data', () => {
    render(
      <CharacterLinkIcon name="宇渡幹久" link={undefined}>
        <img alt="宇渡幹久" src="test.png" />
      </CharacterLinkIcon>,
    );
    expect(screen.getByAltText('宇渡幹久')).toBeInTheDocument();
    expect(screen.queryByTestId('link-tooltip-宇渡幹久')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByTestId('character-link-icon-宇渡幹久'));
    expect(screen.queryByTestId('link-tooltip-宇渡幹久')).not.toBeInTheDocument();
  });

  it('shows the tooltip on hover and hides it on mouse leave', () => {
    render(
      <CharacterLinkIcon name="掘杉等" link={upgradeLink}>
        <img alt="掘杉等" src="test.png" />
      </CharacterLinkIcon>,
    );
    expect(screen.queryByTestId('link-tooltip-掘杉等')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByTestId('character-link-icon-掘杉等'));
    expect(screen.getByTestId('link-tooltip-掘杉等')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByTestId('character-link-icon-掘杉等'));
    expect(screen.queryByTestId('link-tooltip-掘杉等')).not.toBeInTheDocument();
  });

  it('renders the condition text and all upgrade pairs in order', () => {
    render(
      <CharacterLinkIcon name="掘杉等" link={upgradeLink}>
        <img alt="掘杉等" src="test.png" />
      </CharacterLinkIcon>,
    );
    fireEvent.mouseEnter(screen.getByTestId('character-link-icon-掘杉等'));

    expect(screen.getByTestId('link-tooltip-condition-掘杉等')).toHaveTextContent(
      '二打席連続で外野に飛ばす',
    );
    expect(screen.getByTestId('link-upgrade-0-from')).toHaveTextContent('根性◯');
    expect(screen.getByTestId('link-upgrade-0-from')).toHaveTextContent('Lv1');
    expect(screen.getByTestId('link-upgrade-0-to')).toHaveTextContent('ド根性');
    expect(screen.getByTestId('link-upgrade-1-from')).toHaveTextContent('緩急◯');
    expect(screen.getByTestId('link-upgrade-1-to')).toHaveTextContent('変幻自在');
  });

  it('renders stat rewards', () => {
    render(
      <CharacterLinkIcon name="掘杉等" link={upgradeLink}>
        <img alt="掘杉等" src="test.png" />
      </CharacterLinkIcon>,
    );
    fireEvent.mouseEnter(screen.getByTestId('character-link-icon-掘杉等'));
    const stats = screen.getByTestId('link-tooltip-stats-掘杉等');
    expect(stats).toHaveTextContent('筋力');
    expect(stats).toHaveTextContent('30');
    expect(stats).toHaveTextContent('精神');
    expect(stats).toHaveTextContent('15');
  });

  it('falls back to an unpaired "need one of / get one of" view when upgrades cannot be confidently paired', () => {
    render(
      <CharacterLinkIcon name="小田切巧" link={ambiguousLink}>
        <img alt="小田切巧" src="test.png" />
      </CharacterLinkIcon>,
    );
    fireEvent.mouseEnter(screen.getByTestId('character-link-icon-小田切巧'));

    expect(screen.queryByTestId('link-upgrade-0-from')).not.toBeInTheDocument();
    const needed = screen.getByTestId('link-tooltip-needed-小田切巧');
    expect(needed).toHaveTextContent('対ストレート◯');
    expect(needed).toHaveTextContent('低め◯');
    const granted = screen.getByTestId('link-tooltip-granted-小田切巧');
    expect(granted).toHaveTextContent('バズーカ送球');
    expect(granted).toHaveTextContent('ささやき戦術');
    expect(granted).toHaveTextContent('精密機械');
  });

  it('renders descriptive-format links (no condition, no arrows) as tagged skill groups', () => {
    render(
      <CharacterLinkIcon name="松崎トミオ" link={descriptiveLink}>
        <img alt="松崎トミオ" src="test.png" />
      </CharacterLinkIcon>,
    );
    fireEvent.mouseEnter(screen.getByTestId('character-link-icon-松崎トミオ'));

    expect(screen.queryByTestId('link-tooltip-condition-松崎トミオ')).not.toBeInTheDocument();
    expect(screen.queryByTestId('link-upgrade-0-from')).not.toBeInTheDocument();
    const groups = screen.getByTestId('link-tooltip-groups-松崎トミオ');
    expect(groups).toHaveTextContent('外角必打');
    expect(groups).toHaveTextContent('怪物球威');
    expect(groups).toHaveTextContent('アウトコースヒッター');
    expect(groups).toHaveTextContent('重い球');
  });
});
