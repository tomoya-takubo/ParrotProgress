'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Star, Gift, Book, Award, Users, HelpCircle, Zap, Link, LogOut } from 'lucide-react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/authentication';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// コンポーネントのインポート
import GachaAnimation from '@/components/dashboard/gacha/GachaAnimation';
import DiaryModal from '@/components/dashboard/modals/DiaryModal';
import ActivityHistory from '@/components/dashboard/ActivityHistory/ActivityHistory';
import Diary from '@/components/dashboard/Diary/Diary';
import type { DiaryEntry, UserStatus } from '@/types';

//#region Dashboard コンポーネント - メインダッシュボード
export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  //#region State
  // モーダル表示用のstate
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDiaryEntries, setSelectedDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

// page.tsx の userStatus 定義部分に以下を追加
const userStatus: UserStatus = {
  level: 15,
  currentXP: 2800,
  nextLevelXP: 3500,
  dailyXP: 280,
  dailyGoalXP: 500,
  totalDiaryEntries: 42, // 日記総記録数
  streak: 15,
  ranking: getRankFromStreak(15) // 連続ログイン日数からランクを決定
};

// ページの上部または別のファイルに追加する関数
function getRankFromStreak(streak: number): string {
  if (streak >= 60) return 'プラチナ';
  if (streak >= 30) return 'ゴールド';
  if (streak >= 10) return 'シルバー';
  return 'ブロンズ';
}
  
  // タイマーオプション
  const timerOptions = [
    { time: 5, label: 'クイック', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
    { time: 15, label: 'ショート', gradient: 'linear-gradient(135deg, #818cf8, #6366f1)' },
    { time: 25, label: '標準', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
    { time: 45, label: 'ディープ', gradient: 'linear-gradient(135deg, #c084fc, #9333ea)' },
    { time: 60, label: 'フル', gradient: 'linear-gradient(135deg, #e879f9, #d946ef)' }
  ];
  //#endregion

  //#region Handlers
  /**
   * 活動履歴のセルがクリックされたときのハンドラ
   * 選択された日付の日記データをSupabaseから取得し、モーダルで表示する
   */
  const handleActivityCellClick = (date: string) => {
    // ガチャモーダルが開いている場合は処理を中断
    if (showGachaModal) {
      return;
    }
    
    console.log(`セルがクリックされました: ${date}`);
    
    // 実際のアプリケーションではここでsupabaseからデータを取得
    // 例: const { data, error } = await supabase.from('diary_entries').select('*').eq('date', date);
    
    // 今回はモックデータを使用
    const mockEntries: DiaryEntry[] = [
      {
        time: '14:45',
        tags: ['標準', '25分'],
        activities: ['英語の勉強を開始', '新しい単語を習得', '明日も頑張ろう']
      },
      {
        time: '12:30',
        tags: ['読書', '英語'],
        activities: ['新しい本を買った', '読書を始めた', '面白そう']
      }
    ];
    
    setSelectedDate(date);
    setSelectedDiaryEntries(mockEntries);
    setShowDiaryModal(true);
  };

  // ログアウト処理を行うハンドラ
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await signOut();
      
      if (response.success) {
        // ログアウト成功時にホームページへリダイレクト
        router.push('/');
      } else {
        console.error('ログアウトエラー:', response.error);
        alert('ログアウトに失敗しました。もう一度お試しください。');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('ログアウト処理エラー:', error);
      alert('ログアウト中にエラーが発生しました。');
      setIsLoggingOut(false);
    }
  };
  //#endregion

  // ガチャを開始する関数
  const startGacha = () => {
    setShowGachaModal(true);
  };
  
  // ガチャを閉じる関数
  const closeGacha = () => {
    setShowGachaModal(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        {/* ヘッダー */}
        <div className={styles.headerContainer}>
          <h1 className={styles.appTitle}>ぱろっとぷろぐれす</h1>
          <div className={styles.navButtons}>
            {/* ログアウトボタンを追加 */}
            <button 
              className={`${styles.navButton} ${styles.logoutButton}`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={20} />
              <span>{isLoggingOut ? 'ログアウト中...' : 'ログアウト'}</span>
            </button>
            <div className={styles.divider}></div>
            <button className={styles.navButton}>
              <Star size={20} />
              <span>統計</span>
            </button>
            <button 
              className={`${styles.navButton} ${styles.primaryButton}`}
              onClick={() => router.push('/collection')}
            >
              <Book size={20} />
              <span>コレクション</span>
            </button>
          </div>
        </div>

        {/* XPステータスバーとガチャボタン */}
        <div className={styles.statusCard}>
          <div className={styles.statusCardContent}>
            {/* レベル進捗バー - Today's XPを削除し、バーを拡張 */}
            <div className={styles.levelProgress}>
              <div className={styles.levelInfo}>
                <span>Level {userStatus.level}</span>
                <span>{userStatus.currentXP} / {userStatus.nextLevelXP} XP</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar}
                  style={{ width: `${(userStatus.currentXP / userStatus.nextLevelXP) * 100}%` }}
                />
              </div>
            </div>

            <div>
              {/* ガチャボタン */}
              <button 
                className={styles.gachaButton} 
                onClick={startGacha}
                // ガチャモーダルが開いているときはボタンを無効化
                disabled={showGachaModal}
              >
                <div className={styles.ticketContainer}>
                  <span className={styles.ticketLabel}>チケット</span>
                  <span className={styles.ticketCount}>3枚</span>
                </div>
                <div className={styles.gachaButtonContent}>
                  <Gift size={24} />
                  <span>ガチャを回す</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className={styles.statsCard}>
          <div className={styles.statsGrid}>
            {[
              {
                icon: Book,
                title: '日記総記録数',
                value: '42件',
                subtext: '継続は力なり！',
                gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
              },
              {
                icon: Award,
                title: '継続記録',
                value: `${userStatus.streak}日連続`,
                subtext: '自己ベスト更新中！',
                gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
              },
              {
                icon: Star,
                title: 'ランク',
                value: userStatus.ranking,
                subtext: 'ゴールドまであと3日',
                gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              }
            ].map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statHeader}>
                  <div 
                    className={styles.statIconContainer}
                    style={{ background: stat.gradient }}
                  >
                    <stat.icon size={20} />
                  </div>
                  <div className={styles.statInfo}>
                    <div className={styles.statLabel}>{stat.title}</div>
                    <div className={styles.statValue}>{stat.value}</div>
                  </div>
                </div>
                <div className={styles.statDescription}>{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      
        {/* 活動履歴 - ガチャモーダルの状態を渡す */}
        <ActivityHistory 
          onCellClick={handleActivityCellClick} 
          isGachaOpen={showGachaModal} 
        />

        {/* 3行日記 */}
        <Diary />

        {/* モーダルコンポーネント */}
        {/* ガチャアニメーションコンポーネント */}
        <GachaAnimation
          isOpen={showGachaModal}
          startGacha={startGacha}
          onClose={closeGacha}
          tickets={3}
          userId={1} // 現在のログインユーザーID、認証システムと連携する場合は動的に変更
        />
        
      </div>
    </div>
  );
}
//#endregion