// src/__tests__/i18n/i18n.test.ts
// TDD: these tests define what the i18n system must do.
// Run with: npx vitest run src/__tests__/i18n/i18n.test.ts

import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '@/i18n/config';

describe('i18n configuration', () => {
  it('initializes with Japanese as default language', () => {
    expect(i18n.language).toBe('ja');
  });

  it('supports all three target languages', () => {
    const supported = i18n.options.supportedLngs as string[];
    expect(supported).toContain('ja');
    expect(supported).toContain('en');
    expect(supported).toContain('zh');
  });

  it('translates a key in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('nav.combo_planner')).toBe('コンボプランナー');
  });

  it('translates a key in English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('nav.combo_planner')).toBe('Combo Planner');
  });

  it('translates a key in Chinese', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('nav.combo_planner')).toBe('Combo Planner');
  });

  it('falls back to key if translation missing', async () => {
    await i18n.changeLanguage('ja');
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('translates stat names in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('stats.strength')).toBe('筋力');
    expect(i18n.t('stats.speed')).toBe('敏捷');
    expect(i18n.t('stats.technique')).toBe('技術');
    expect(i18n.t('stats.breaking_ball')).toBe('変化球');
    expect(i18n.t('stats.spirit')).toBe('精神');
  });

  it('translates stat names in English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('stats.strength')).toBe('Strength');
    expect(i18n.t('stats.speed')).toBe('Agility');
    expect(i18n.t('stats.technique')).toBe('Technique');
    expect(i18n.t('stats.breaking_ball')).toBe('Breaking Ball');
    expect(i18n.t('stats.spirit')).toBe('Spirit');
  });

  it('translates stat names in Chinese', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('stats.strength')).toBe('筋力');
    expect(i18n.t('stats.speed')).toBe('敏捷');
  });

  it('translates position names', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('positions.pitcher')).toBe('投手');
    expect(i18n.t('positions.catcher')).toBe('捕手');
    expect(i18n.t('positions.manager')).toBe('マネージャー');
  });

  it('translates UI labels in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.save')).toBe('保存');
    expect(i18n.t('ui.clear')).toBe('クリア');
    expect(i18n.t('ui.search_placeholder')).toBe('名前・スキルで検索');
    expect(i18n.t('ui.active_roster')).toBe('選手登録');
    expect(i18n.t('ui.combos_found')).toBe('コンボ数');
  });

  it('translates difficulty labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('difficulty.rookie')).toBe('ルーキー');
    expect(i18n.t('difficulty.normal')).toBe('ノーマル');
    expect(i18n.t('difficulty.expert')).toBe('達人');
  });

  it('translates CharacterSidebar labels in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.roster_updated')).toBe('ロースター更新');
    expect(i18n.t('ui.added')).toBe('追加');
    expect(i18n.t('ui.removed')).toBe('削除');
    expect(i18n.t('ui.undo')).toBe('取り消す');
    expect(i18n.t('ui.add')).toBe('追加');
    expect(i18n.t('ui.remove')).toBe('削除');
    expect(i18n.t('ui.char_count', { count: 5 })).toBe('5 キャラ');
  });

  it('translates CharacterSidebar labels in English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('ui.roster_updated')).toBe('Roster Updated');
    expect(i18n.t('ui.added')).toBe('Added');
    expect(i18n.t('ui.removed')).toBe('Removed');
    expect(i18n.t('ui.undo')).toBe('Undo');
    expect(i18n.t('ui.add')).toBe('Add');
    expect(i18n.t('ui.remove')).toBe('Remove');
    expect(i18n.t('ui.char_count', { count: 5 })).toBe('5 Characters');
  });

  it('translates CharacterSidebar labels in Chinese', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('ui.roster_updated')).toBe('名單已更新');
    expect(i18n.t('ui.added')).toBe('新增');
    expect(i18n.t('ui.removed')).toBe('移除');
    expect(i18n.t('ui.undo')).toBe('復原');
    expect(i18n.t('ui.add')).toBe('新增');
    expect(i18n.t('ui.remove')).toBe('移除');
    expect(i18n.t('ui.char_count', { count: 5 })).toBe('5 位角色');
  });

  it('translates MapSection labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.combos_found')).toBe('コンボ数');
  });

  it('translates RewardAnalysis labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.total')).toBe('合計');
    expect(i18n.t('ui.total_xp_earned')).toBe('獲得経験点合計');
    expect(i18n.t('ui.no_active_bonuses')).toBe('発動中のボーナスなし');
    expect(i18n.t('ui.combo_effects')).toBe('コンボ効果');
    expect(i18n.t('ui.gold_skills_count', { count: 3 })).toBe('3 金特');
    expect(i18n.t('ui.missing_characters_count', { count: 2 })).toBe('不足しているキャラ (2)');

    i18n.changeLanguage('en');
    expect(i18n.t('ui.total')).toBe('Total');
    expect(i18n.t('ui.total_xp_earned')).toBe('Total XP Earned');
    expect(i18n.t('ui.no_active_bonuses')).toBe('No Active Bonuses');
    expect(i18n.t('ui.combo_effects')).toBe('Combo Effects');
    expect(i18n.t('ui.gold_skills_count', { count: 3 })).toBe('3 Gold Skills');
    expect(i18n.t('ui.missing_characters_count', { count: 2 })).toBe('Missing Characters (2)');

    i18n.changeLanguage('zh');
    expect(i18n.t('ui.total')).toBe('總計');
    expect(i18n.t('ui.total_xp_earned')).toBe('獲得經驗值總計');
    expect(i18n.t('ui.no_active_bonuses')).toBe('無啟用中的加成');
    expect(i18n.t('ui.combo_effects')).toBe('Combo效果');
    expect(i18n.t('ui.gold_skills_count', { count: 3 })).toBe('3 個金特');
    expect(i18n.t('ui.missing_characters_count', { count: 2 })).toBe('缺少角色 (2)');
  });

  it('translates ClearConfirmModal labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.attention')).toBe('注意！');
    expect(i18n.t('ui.close_modal')).toBe('モーダルを閉じる');
    expect(i18n.t('ui.reset_roster_title')).toBe('本当にリセットしますか？');
    expect(i18n.t('ui.reset_roster_body')).toBe(
      '選択中のキャラが全て解除されます。もう一度スカウトし直す必要があります！',
    );
    expect(i18n.t('ui.confirm_wipe')).toBe('はい、消去します！');
    expect(i18n.t('ui.cancel_wipe')).toBe('いいえ、残します');

    i18n.changeLanguage('en');
    expect(i18n.t('ui.attention')).toBe('ATTENTION!');
    expect(i18n.t('ui.close_modal')).toBe('Close modal');
    expect(i18n.t('ui.reset_roster_title')).toBe('RESET ROSTER?');
    expect(i18n.t('ui.reset_roster_body')).toBe(
      "This will clear all selected characters. You'll have to scout them all over again!",
    );
    expect(i18n.t('ui.confirm_wipe')).toBe('YES, WIPE IT!');
    expect(i18n.t('ui.cancel_wipe')).toBe('NO, KEEP IT');

    i18n.changeLanguage('zh');
    expect(i18n.t('ui.attention')).toBe('注意！');
    expect(i18n.t('ui.close_modal')).toBe('關閉視窗');
    expect(i18n.t('ui.reset_roster_title')).toBe('確定要重置名單嗎？');
    expect(i18n.t('ui.reset_roster_body')).toBe('這將清除所有已選角色，你必須重新招募一次！');
    expect(i18n.t('ui.confirm_wipe')).toBe('是的，清除吧！');
    expect(i18n.t('ui.cancel_wipe')).toBe('不，保留');
  });

  it('translates MatchExpCalculator labels (existing exp_calc keys)', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('exp_calc.title')).toBe('獲得経験値計算');
    expect(i18n.t('exp_calc.own_score')).toBe('自チーム得点');
    expect(i18n.t('exp_calc.opp_score')).toBe('失点');
    expect(i18n.t('exp_calc.correction')).toBe('補正');
    expect(i18n.t('exp_calc.batting')).toBe('打撃イベント');
    expect(i18n.t('exp_calc.pitching')).toBe('投球イベント');
    expect(i18n.t('exp_calc.add_game')).toBe('試合を追加');
    expect(i18n.t('exp_calc.rename_hint')).toBe('ダブルクリックで名前変更');
    expect(i18n.t('exp_calc.game_result')).toBe('この試合の経験値');
    expect(i18n.t('exp_calc.total_result')).toBe('全試合合計');
    expect(i18n.t('exp_calc.events.hr')).toBe('ホームラン');
  });

  it('translates new MatchExpCalculator keys', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.unsaved')).toBe('未保存');
    expect(i18n.t('ui.close')).toBe('閉じる');
    expect(i18n.t('exp_calc.decrease')).toBe('減らす');
    expect(i18n.t('exp_calc.increase')).toBe('増やす');
    expect(i18n.t('ui.unsaved_changes')).toBe('未保存の変更');
    expect(i18n.t('ui.unsaved_confirm')).toBe('変更が保存されていません。このまま閉じますか？');
    expect(i18n.t('exp_calc.game_number', { count: 2 })).toBe('試合 2');
    expect(i18n.t('exp_calc.round_1')).toBe('一回戦');
    expect(i18n.t('exp_calc.round_2')).toBe('二回戦');
    expect(i18n.t('exp_calc.round_3')).toBe('三回戦');
    expect(i18n.t('exp_calc.semifinal')).toBe('準決勝');
    expect(i18n.t('exp_calc.final')).toBe('決勝');

    i18n.changeLanguage('en');
    expect(i18n.t('ui.unsaved')).toBe('Unsaved');
    expect(i18n.t('ui.close')).toBe('Close');
    expect(i18n.t('exp_calc.round_1')).toBe('Round 1');
    expect(i18n.t('exp_calc.semifinal')).toBe('Semifinal');
    expect(i18n.t('exp_calc.final')).toBe('Final');
    expect(i18n.t('exp_calc.game_number', { count: 2 })).toBe('Game 2');

    i18n.changeLanguage('zh');
    expect(i18n.t('ui.unsaved')).toBe('未儲存');
    expect(i18n.t('ui.close')).toBe('關閉');
    expect(i18n.t('exp_calc.round_1')).toBe('第一戰');
    expect(i18n.t('exp_calc.semifinal')).toBe('準決賽');
    expect(i18n.t('exp_calc.final')).toBe('決賽');
    expect(i18n.t('exp_calc.game_number', { count: 2 })).toBe('比賽 2');
  });

  it('translates SlotSwitcher labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.current_team')).toBe('現在のチーム');
    expect(i18n.t('ui.slot_number', { num: '01' })).toBe('スロット 01');
    expect(i18n.t('ui.load')).toBe('読込');
    expect(i18n.t('ui.overwrite')).toBe('上書き');

    i18n.changeLanguage('en');
    expect(i18n.t('ui.current_team')).toBe('Current Team');
    expect(i18n.t('ui.slot_number', { num: '01' })).toBe('Slot 01');
    expect(i18n.t('ui.load')).toBe('LOAD');
    expect(i18n.t('ui.overwrite')).toBe('OVERWRITE');

    i18n.changeLanguage('zh');
    expect(i18n.t('ui.current_team')).toBe('目前隊伍');
    expect(i18n.t('ui.slot_number', { num: '01' })).toBe('欄位 01');
    expect(i18n.t('ui.load')).toBe('讀取');
    expect(i18n.t('ui.overwrite')).toBe('覆蓋');
  });

  it('translates App.tsx remaining labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.save_team')).toBe('チームを保存');
    expect(i18n.t('ui.save_locally')).toBe('ローカルに保存');
    expect(i18n.t('ui.syncing')).toBe('同期中...');
    expect(i18n.t('ui.last_saved')).toBe('最終保存');

    i18n.changeLanguage('en');
    expect(i18n.t('ui.save_team')).toBe('Save Team');
    expect(i18n.t('ui.save_locally')).toBe('Save Locally');
    expect(i18n.t('ui.syncing')).toBe('Syncing...');
    expect(i18n.t('ui.last_saved')).toBe('Last Saved');

    i18n.changeLanguage('zh');
    expect(i18n.t('ui.save_team')).toBe('儲存隊伍');
    expect(i18n.t('ui.save_locally')).toBe('本地儲存');
    expect(i18n.t('ui.syncing')).toBe('同步中...');
    expect(i18n.t('ui.last_saved')).toBe('最後儲存');
  });

  it('translates loading state', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.loading')).toBe('読み込み中...');
    i18n.changeLanguage('en');
    expect(i18n.t('ui.loading')).toBe('Loading...');
    i18n.changeLanguage('zh');
    expect(i18n.t('ui.loading')).toBe('載入中...');
  });
});
