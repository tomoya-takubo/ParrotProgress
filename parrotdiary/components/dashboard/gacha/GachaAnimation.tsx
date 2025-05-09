'use client';

//#region インポート
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext'; // 認証コンテキストをインポート
// #endregion

//#region 基本設定と初期化
/**
 * Supabaseクライアントの初期化
 * 環境変数からURLとAPIキーを取得
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 現在の日本時間をISO形式で取得する関数
 */
const getJSTISOString = () => {
  const now = new Date();
  // 日本時間 = UTC + 9時間
  return new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString();
};
//#endregion

//#region 型定義
/**
 * パロットの型定義
 * parrots テーブルの構造に合わせています
 */
interface Parrot {
  parrot_id: string; // UUID型
  name: string;
  category_id: number | null; // nullも許容
  rarity_id: string; // UUID型
  description: string | null;
  image_url: string | null;
}

/**
 * ユーザーパロットの型定義
 * user_parrots テーブルの構造に合わせています
 */
interface UserParrot {
  id?: string; // 更新時に必要な主キー（オプション）
  user_id: string;
  parrot_id: string;
  obtained_at: string;
  obtain_count: number;
}

/**
 * レアリティ表示設定の型定義
 * UIの見た目の設定を管理します
 */
interface RarityConfig {
  title: string;
  colors: string;
  bgGradient: string;
  particleColors: readonly string[];
  stars: number;
  particleCount: number;
}

/**
 * コンポーネントのプロパティ型定義
 */
interface GachaAnimationProps {
  isOpen: boolean;
  startGacha: () => void;
  onClose: () => void;
}

/**
 * レアリティタイプの定義
 * データベースのrarity_idに対応
 */
type RarityType = "ultra_rare" | "super_rare" | "rare" | "normal";

/**
 * ガチャ結果の型定義
 */
interface GachaResult {
  parrot: Parrot;
  rarityType: RarityType;
  revealed: boolean; // 結果が表示されたかどうか
}
//#endregion

//#region レアリティ設定
/**
 * UUIDとレアリティタイプのマッピング
 * データベースのrarity_idとフロントエンドの表示を紐づけます
 */
const rarityUUIDToType: Record<string, RarityType> = {
  '88b7a9a1-c650-49f1-89cf-f18ee48c120f': 'normal',
  'b9e8a015-e81b-4cf8-98ad-deaec2007c83': 'ultra_rare',
  'ea093042-a369-4442-8e6a-eba4a42ec117': 'super_rare',
  'fdbfbbe1-42dc-4f98-acf4-8f70aa7d4f8c': 'rare',
};

/**
 * より堅牢なマッピング関数
 * UUIDからレアリティタイプを取得します
 */
const getRarityType = (rarityId: string): RarityType => {
  // 念のためtrimを行い、小文字に統一
  const cleanedId = rarityId.trim().toLowerCase();
  
  // 完全一致でマッピングを試みる
  if (rarityUUIDToType[cleanedId]) {
    return rarityUUIDToType[cleanedId];
  }
  
  // 部分一致でマッピングを試みる（最初の8文字で比較）
  const partialId = cleanedId.substring(0, 8);
  for (const [key, value] of Object.entries(rarityUUIDToType)) {
    if (key.toLowerCase().includes(partialId)) {
      console.log(`部分一致でマッピングしました: ${cleanedId} -> ${value}`);
      return value;
    }
  }
  
  // フォールバック
  console.warn(`未知のrarity_idです: ${rarityId}`);
  return 'normal';
};

/**
 * レアリティタイプに対応するUI設定
 * 表示の見た目を制御します
 */
const rarityConfigs: Record<RarityType, RarityConfig> = {
  ultra_rare: {
    title: "ULTRA RARE",
    colors: "from-purple-600 via-pink-600 to-blue-600",
    bgGradient: "linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #0000ff, #8000ff, #ff0000)",
    particleColors: ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-purple-400"],
    stars: 4,
    particleCount: 20
  },
  super_rare: {
    title: "SUPER RARE",
    colors: "from-purple-500 to-pink-500",
    bgGradient: "linear-gradient(to right, #9333ea, #ec4899, #9333ea)",
    particleColors: ["bg-purple-400", "bg-pink-400"],
    stars: 3,
    particleCount: 12
  },
  rare: {
    title: "RARE",
    colors: "from-blue-500 to-cyan-500",
    bgGradient: "linear-gradient(to right, #3b82f6, #06b6d4, #3b82f6)",
    particleColors: ["bg-blue-400", "bg-cyan-400"],
    stars: 2,
    particleCount: 8
  },
  normal: {
    title: "NORMAL",
    colors: "from-gray-400 to-gray-500",
    bgGradient: "linear-gradient(to right, #9ca3af, #6b7280, #9ca3af)",
    particleColors: ["bg-gray-400"],
    stars: 1,
    particleCount: 4
  }
} as const;
//#endregion

/**
 * ガチャアニメーションコンポーネント
 * Supabaseと連携してパロットを抽選し、ユーザーのコレクションに追加します
 */
const GachaAnimation: React.FC<GachaAnimationProps> = ({
  isOpen,
  startGacha,
  onClose,
}) => {
  // 認証コンテキストからユーザー情報を取得
  const { user } = useAuth();

  //#region 状態管理
  // 基本状態
  const [showResult, setShowResult] = useState(false);        // 結果表示モード
  const [processing, setProcessing] = useState(false);        // 処理中フラグ
  const [gifUrl, setGifUrl] = useState<string | null>(null);  // ガチャアニメーションのGIF URL
  const [tickets, setTickets] = useState<number>(0);          // チケット枚数
  const [error, setError] = useState<string | null>(null);    // エラーメッセージ
  
  // 複数ガチャの状態管理
  const [gachaCount, setGachaCount] = useState<number>(1);    // ガチャ回数
  const [gachaResults, setGachaResults] = useState<GachaResult[]>([]);  // ガチャ結果の配列
  const [showDetail, setShowDetail] = useState(false);        // 詳細表示モード
  const [detailParrot, setDetailParrot] = useState<GachaResult | null>(null); // 詳細表示するパロット
  const [allRevealed, setAllRevealed] = useState(false);      // すべての結果が表示されたか
  
  // 単一ガチャ演出用の状態
  const [showingSingleResult, setShowingSingleResult] = useState(false); // 単一ガチャ結果表示
  const [currentSingleParrot, setCurrentSingleParrot] = useState<GachaResult | null>(null); // 単一ガチャのパロット
  //#endregion

  //#region 定数
  const maxGacha = 50; // ガチャ最大連数
  // #endregion

  //#region ライフサイクル管理と初期化
  // isOpenが変更された時の処理
  useEffect(() => {
    if (isOpen) {
      // ガチャを実行する前にチケット枚数を確認
      fetchTickets();
      // 初期状態にリセット
      setGachaCount(1);
      setGachaResults([]);
      setShowDetail(false);
      setDetailParrot(null);
      setAllRevealed(false);
      setShowingSingleResult(false);
      setCurrentSingleParrot(null);
      
      // セッションストレージから状態を復元（もしあれば）
      const savedState = sessionStorage.getItem('gachaState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState.showResult) {
            setGachaResults(parsedState.gachaResults);
            setShowResult(parsedState.showResult);
            setAllRevealed(parsedState.allRevealed);
          }
        } catch (e) {
          console.error('ガチャ状態の復元エラー:', e);
        }
      }
      
      // ビジビリティ変更イベントのリスナーを追加
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // タブがアクティブになったとき、状態を復元
          const savedState = sessionStorage.getItem('gachaState');
          if (savedState) {
            try {
              const parsedState = JSON.parse(savedState);
              if (parsedState.showResult) {
                setGachaResults(parsedState.gachaResults);
                setShowResult(parsedState.showResult);
                setAllRevealed(parsedState.allRevealed);
              }
            } catch (e) {
              console.error('ガチャ状態の復元エラー:', e);
            }
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // クリーンアップ関数
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isOpen, user]);

  // GIF URLを初期化
  useEffect(() => {
    const url = getSingleGifUrl('parrots', 'confusedparrot.gif');
    setGifUrl(url);
  }, []);

  // すべての結果が表示されたかチェック
  useEffect(() => {
    if (gachaResults.length > 0 && gachaResults.every(result => result.revealed)) {
      setAllRevealed(true);
    }
  }, [gachaResults]);

  // ガチャ結果状態の永続化
  useEffect(() => {
    // ガチャ結果が表示されている場合のみ保存
    if (showResult && gachaResults.length > 0) {
      // セッションストレージに状態を保存
      const stateToSave = {
        showResult,
        gachaResults,
        allRevealed
      };
      sessionStorage.setItem('gachaState', JSON.stringify(stateToSave));
    }
  }, [showResult, gachaResults, allRevealed]);
  //#endregion

  //#region データ取得・操作関数
  /**
   * 一匹のparrotのgifのURLを取得
   */
  const getSingleGifUrl = (folder: string, fileName: string) => {
    return supabase.storage.from('Parrots').getPublicUrl(`${folder}/${fileName}`).data.publicUrl;
  };

  /**
   * ユーザーのチケット情報を取得
   */
  const fetchTickets = async () => {
    if (!user) {
      console.error('ユーザーがログインしていません');
      setError('ガチャを利用するにはログインが必要です');
      return;
    }
  
    try {
      console.log('チケット情報を取得中...');
      console.log('ユーザーID:', user.id);
  
      const { data, error } = await supabase
        .from('gacha_tickets')
        .select('ticket_count, last_updated')
        .eq('user_id', user.id)
        .single();
  
      if (error) {
        console.error('チケット情報取得エラー:', error);
        if (error.code === 'PGRST116') {
          // レコードがない場合は初期レコードを作成
          await createInitialTicketRecord();
          return;
        }
        setError(`チケット情報の取得に失敗しました: ${error.message}`);
        return;
      }
  
      console.log('取得したチケット情報:', data);
      if (data) {
        // チケット数を状態に設定
        setTickets(data.ticket_count);
      } else {
        // レコードがない場合は初期レコードを作成
        await createInitialTicketRecord();
      }
    } catch (err) {
      console.error('チケット情報取得中のエラー:', err);
      setError(`予期せぬエラーが発生しました: ${(err as Error).message}`);
    }
  };
  
  /**
   * 初期チケットレコードを作成
   */
  const createInitialTicketRecord = async () => {
    if (!user) return;
  
    try {
      const { error } = await supabase
        .from('gacha_tickets')
        .insert([
          {
            user_id: user.id,
            ticket_count: 5, // 初期チケット数
            last_updated: getJSTISOString()
          }
        ]);
  
      if (error) {
        console.error('チケット初期化エラー:', error);
        setError(`チケットの初期化に失敗しました: ${error.message}`);
        return;
      }
  
      console.log('チケットを初期化しました');
      setTickets(5);
    } catch (err) {
      console.error('チケット初期化中のエラー:', err);
      setError(`予期せぬエラーが発生しました: ${(err as Error).message}`);
    }
  };
  
  /**
   * チケットを消費する関数
   * @param amount 消費するチケット数
   */
  const consumeTickets = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // まず最新のチケット情報を取得
      const { data: currentTickets, error: fetchError } = await supabase
      .from('gacha_tickets')
      .select('ticket_count')
      .eq('user_id', user.id)
      .single();

      if (fetchError) {
      console.error('チケット情報の取得に失敗しました:', fetchError);
      return false;
      }

      // チケットが足りない場合はfalseを返す
      if (currentTickets.ticket_count < amount) {
        setError(`チケットが足りません。必要: ${amount}枚, 所持: ${currentTickets.ticket_count}枚`);
        return false;
      }

      // 取得したチケット数を使用して更新
      const newTicketCount = currentTickets.ticket_count - amount;
      console.log(`チケットを消費します。現在: ${currentTickets.ticket_count}枚 → 更新後: ${newTicketCount}枚`);

      // チケット数を減らす
      const { error } = await supabase
        .from('gacha_tickets')
        .update({ 
          ticket_count: newTicketCount,
          last_updated: getJSTISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('チケット消費エラー:', error);
        return false;
      }

      console.log(`チケットを消費しました。残り: ${newTicketCount}枚`);
      setTickets(newTicketCount);
      return true;
    } catch (err) {
      console.error('チケット消費中のエラー:', err);
      return false;
    }
  };
  //#endregion

  //#region ガチャ実行処理
  /**
   * 複数回のガチャを一括で実行する関数 (最適化版)
   */
  const runMultiGacha = async (count: number) => {
    if (!user) {
      setError('ガチャを実行するにはログインが必要です');
      return;
    }
    
    // チケット数が足りるか確認
    if (tickets < count) {
      setError(`チケットが足りません。必要: ${count}枚, 所持: ${tickets}枚`);
      return;
    }
    
    setError(null);
    setProcessing(true);
    
    try {
      // 1. チケットを一括消費
      const ticketsConsumed = await consumeTickets(count);
      if (!ticketsConsumed) {
        throw new Error('チケットの消費に失敗しました');
      }
      
      // チケット消費後、親コンポーネントのコールバックを呼び出して画面更新
      startGacha();
      
      // 2. パロットを一括で抽選する (すべてのパロットを一度に取得して、ランダム選択)
      const { data: allParrots, error: parrotsError } = await supabase.from('parrots').select('*');
      
      if (parrotsError || !allParrots || allParrots.length === 0) {
        throw new Error('パロット取得エラー: ' + parrotsError?.message);
      }
      
      // ランダム抽選関数
      const getRandomParrot = () => {
        const randomIndex = Math.floor(Math.random() * allParrots.length);
        const selectedParrot = allParrots[randomIndex];
        const rarityType = getRarityType(selectedParrot.rarity_id);
        return { parrot: selectedParrot, rarityType };
      };
      
      // 指定した回数分のパロットを抽選
      const selectedParrots = Array.from({ length: count }, () => getRandomParrot());
      
      // 3. 抽選結果をユーザーのコレクションに一括で登録する
      if (user) {
        // 3.1. 現在の所持パロット情報を一括取得
        const parrotIds = selectedParrots.map(item => item.parrot.parrot_id);
        const { data: existingParrots, error: fetchError } = await supabase
          .from('user_parrots')
          .select('*')
          .eq('user_id', user.id)
          .in('parrot_id', parrotIds);
        
        if (fetchError) {
          console.error('既存パロット確認エラー詳細:', fetchError);
          throw new Error('既存パロット確認エラー: ' + fetchError.message);
        }
        
        // 3.2. 新規パロットと更新パロットに分ける
        const existingParrotMap = new Map<string, UserParrot>();
        if (existingParrots) {
          existingParrots.forEach(parrot => {
            existingParrotMap.set(parrot.parrot_id, parrot);
          });
        }
        
        // 型を明示的に定義
        const newParrots: UserParrot[] = [];
        const updateParrots: UserParrot[] = [];
        
        // 現在時刻を一度だけ取得
        const currentTime = getJSTISOString();
        
        selectedParrots.forEach(({ parrot }) => {
          if (existingParrotMap.has(parrot.parrot_id)) {
            // 既存パロットの場合は更新
            const existingParrot = existingParrotMap.get(parrot.parrot_id);
            updateParrots.push({
              id: existingParrot?.id, // 主キーが必要
              user_id: user.id,
              parrot_id: parrot.parrot_id,
              obtain_count: existingParrot?.obtain_count ? existingParrot.obtain_count + 1 : 1,
              obtained_at: currentTime
            });
          } else {
            // 新規パロットの場合は追加
            newParrots.push({
              user_id: user.id,
              parrot_id: parrot.parrot_id,
              obtained_at: currentTime,
              obtain_count: 1
            });
          }
        });

        // 3.3. データベース操作を実行する関数
        const executePromises = async () => {
          const results = [];
          
          try {
            // 1. 最初に全パロットに対して既存パロット情報を取得する
            const parrotIds = [...newParrots, ...updateParrots].map(p => p.parrot_id);
            const { data: existingUserParrots } = await supabase
              .from('user_parrots')
              .select('parrot_id, obtain_count')
              .eq('user_id', user.id)
              .in('parrot_id', parrotIds);
            
            console.log('既存パロット情報:', existingUserParrots);
            
            // 既存パロットのマップを作成
            const existingParrotMap = new Map();
            if (existingUserParrots) {
              existingUserParrots.forEach(p => {
                existingParrotMap.set(p.parrot_id, p.obtain_count);
              });
            }
            
            // 2. すべてのパロットを処理する
            for (const parrot of [...newParrots, ...updateParrots]) {
              try {
                if (existingParrotMap.has(parrot.parrot_id)) {
                  // 既存パロットの場合は更新
                  const currentCount = existingParrotMap.get(parrot.parrot_id) || 0;
                  const newCount = currentCount + 1; // 常に1増やす
                  
                  const result = await supabase
                    .from('user_parrots')
                    .update({
                      obtain_count: newCount,
                      obtained_at: currentTime
                    })
                    .eq('user_id', user.id)
                    .eq('parrot_id', parrot.parrot_id);
                  
                  console.log(`パロット更新 (ID: ${parrot.parrot_id}):`, result);
                } else {
                  // 新規パロットの場合は挿入
                  const result = await supabase
                    .from('user_parrots')
                    .insert({
                      user_id: user.id,
                      parrot_id: parrot.parrot_id,
                      obtained_at: currentTime,
                      obtain_count: 1
                    });
                  
                  console.log(`パロット新規追加 (ID: ${parrot.parrot_id}):`, result);
                  
                  // 追加した場合、マップに追加して次回から更新処理にする
                  existingParrotMap.set(parrot.parrot_id, 1);
                }
              } catch (err) {
                console.error(`パロット処理エラー (ID: ${parrot.parrot_id}):`, err);
              }
            }
            
            // 3. ガチャ履歴を一括登録
            try {
              const historyRecords = selectedParrots.map(({ parrot }) => ({
                user_id: user.id,
                parrot_id: parrot.parrot_id,
                executed_at: currentTime
              }));
              
              const historyResult = await supabase.from('gacha_history').insert(historyRecords);
              console.log('ガチャ履歴登録結果:', historyResult);
              results.push(historyResult);
            } catch (err) {
              console.error('ガチャ履歴登録エラー:', err);
            }
            
            return results;
          } catch (error) {
            console.error('データベース操作エラー:', error);
            return []; // 空の結果を返す
          }
        };

        // すべてのデータベース操作を実行
        await executePromises();
      }
      
      // 4. 結果を作成
      const results: GachaResult[] = selectedParrots.map(({ parrot, rarityType }) => ({
        parrot,
        rarityType,
        revealed: true // 最初から表示状態にする
      }));
      
      // 5. 結果を表示 (待ち時間を短縮)
      setTimeout(() => {
        setGachaResults(results);
        setShowResult(true);
        setProcessing(false);
        setAllRevealed(true); // すべて表示済みに設定
      }, 500); // 待ち時間を短縮: 2000ms → 500ms
    } catch (error) {
      console.error('複数ガチャ処理エラー:', error);
      setError(`ガチャの実行中にエラーが発生しました: ${(error as Error).message}`);
      setProcessing(false);
    }
  };
  //#endregion

  //#region UIイベントハンドラ
  /**
   * ガチャ回数を増やす
   */
  const increaseGachaCount = () => {
    // 最大10回まで、かつ持っているチケット数を超えない
    setGachaCount(prev => Math.min(prev + 1, Math.min(maxGacha, tickets)));
  };
  
  /**
   * ガチャ回数を減らす
   */
  const decreaseGachaCount = () => {
    setGachaCount(prev => Math.max(prev - 1, 1));
  };
  
  /**
   * パロット詳細表示
   */
  const showParrotDetail = (result: GachaResult) => {
    setDetailParrot(result);
    setShowDetail(true);
  };
  
  /**
   * 詳細を閉じる
   */
  const closeDetail = () => {
    setShowDetail(false);
    setDetailParrot(null);
  };
  
  /**
   * 単一ガチャ結果を閉じる
   */
  const closeSingleResult = () => {
    setShowingSingleResult(false);
    setCurrentSingleParrot(null);
  };
  
  /**
   * ガチャを閉じる処理
   * 状態をリセットして閉じる
   */
  const handleCloseGacha = () => {
    sessionStorage.removeItem('gachaState'); // セッションストレージをクリア
    setShowResult(false);
    setGachaResults([]);
    setShowDetail(false);
    setDetailParrot(null);
    setAllRevealed(false);
    setShowingSingleResult(false);
    setCurrentSingleParrot(null);
    onClose();
  };
  //#endregion

  //#region UIコンポーネント
  /**
   * パーティクル効果のコンポーネント
   * レアリティに応じたパーティクルエフェクトを表示
   */
  const Particles: React.FC<{ config: RarityConfig }> = ({ config }) => {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: config.particleCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              scale: 0,
              x: '50%',
              y: '50%',
              opacity: 0
            }}
            animate={{
              scale: [1, 0],
              x: [
                '50%',
                `${50 + (Math.random() - 0.5) * 100}%`
              ],
              y: [
                '50%',
                `${50 + (Math.random() - 0.5) * 100}%`
              ],
              opacity: [1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
            className={`absolute w-3 h-3 rounded-full ${config.particleColors[i % config.particleColors.length]}`}
            style={{
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
    );
  };

  /**
   * ガチャ結果カードのコンポーネント
   * 個々のパロットカードを表示します
   */
  const ResultCard: React.FC<{ 
    result: GachaResult, 
    index: number, 
    onClick: () => void 
  }> = ({ result, onClick }) => {
    return (
      <motion.div
        key={result.parrot.parrot_id} // IDをユニークキーとして使用
        initial={{ scale: 0.8, opacity: 0 }}
        animate={result.revealed ? { 
          scale: 1, 
          opacity: 1
        } : { scale: 0.8, opacity: 0.5 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.5,
          delay: 0.05 * Math.random() // ランダムな遅延で自然な印象に
        }}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
        className={`cursor-pointer overflow-hidden rounded-xl shadow-lg ${
          result.revealed ? 'bg-white' : 'bg-gray-200'
        }`}
        style={{
          aspectRatio: '1/1'
        }}
      >
        {result.revealed ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
            {/* レアリティに応じた背景グラデーション */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: rarityConfigs[result.rarityType].bgGradient,
                backgroundSize: '200% 100%',
              }}
            />
            
            {/* パロット画像 */}
            <div className={`relative w-3/4 h-3/4 rounded-full overflow-hidden bg-gradient-to-r ${rarityConfigs[result.rarityType].colors} p-1`}>
              <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                <img 
                  src={result.parrot.image_url || "/api/placeholder/64/64"} 
                  alt={result.parrot.name} 
                  className="w-full h-full object-contain p-1" 
                />
              </div>
            </div>
            
            {/* パロット名 */}
            <div className="w-full text-center mt-1 text-xs font-medium truncate px-1">
              {result.parrot.name}
            </div>
            
            {/* レアリティ表示（星の数） */}
            <div className="flex justify-center mt-1">
              {Array.from({ length: rarityConfigs[result.rarityType].stars }).map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        ) : (
          // まだ表示されていない場合は、？マークを表示
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
            ?
          </div>
        )}
      </motion.div>
    );
  };
  //#endregion

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  //#region レンダリング
  return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center backdrop-blur-sm z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget && (allRevealed || showingSingleResult)) {
                handleCloseGacha();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="rounded-xl p-6 w-full max-w-3xl relative overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)", // 淡い青系の背景
              }}
            >
              {/* エラー表示 */}
              {error ? (
                <div className="py-8 text-center">
                  <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
                  <button
                    onClick={handleCloseGacha}
                    className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:opacity-90 shadow-lg"
                  >
                    閉じる
                  </button>
                </div>
              // ガチャを回すモーダル - チケットがある場合の通常表示
              ) : !showResult && !showingSingleResult && !processing && tickets > 0 ? (
                <div className="py-8 text-center relative">
                  <div className="absolute inset-0 rounded-xl" style={{
                    background: "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)", // 淡い青紫ピンクのグラデーション
                    backgroundSize: '200% 200%',
                  }}></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">ガチャを回す</h3>
                    
                    <div className="mb-6">
                      <p className="text-gray-700 mb-2">現在のチケット: <span className="font-bold text-blue-600">{tickets}枚</span></p>
                    </div>
                    
                    {/* クイックアクセスボタン */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
                      {[
                        { count: 10, from: 'from-blue-500', to: 'to-cyan-500' },
                        { count: 20, from: 'from-green-500', to: 'to-lime-500' },
                        { count: 30, from: 'from-yellow-500', to: 'to-orange-500' },
                        { count: 40, from: 'from-pink-500', to: 'to-fuchsia-500' },
                        { count: 50, from: 'from-purple-500', to: 'to-indigo-500' },
                      ].map(({ count, from, to }) => (
                        <button
                          key={count}
                          onClick={() => runMultiGacha(count)}
                          disabled={tickets < count}
                          className={`py-3 bg-gradient-to-r ${from} ${to} text-white rounded-lg shadow-md ${
                            tickets < count ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                          }`}
                        >
                          {count}連ガチャ
                        </button>
                      ))}
                    </div>
                    
                    {/* カスタム回数セレクター */}
                    <div className="mb-5">
                      <p className="text-gray-700 mb-2">カスタム回数</p>
                      
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <button 
                          onClick={decreaseGachaCount}
                          disabled={gachaCount <= 1}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${gachaCount <= 1 ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-bold text-blue-600">{gachaCount}</span>
                          <span className="text-sm text-gray-500">回数</span>
                        </div>
                        
                        <button 
                          onClick={increaseGachaCount}
                          disabled={gachaCount >= maxGacha || gachaCount >= tickets}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${gachaCount >= maxGacha || gachaCount >= tickets ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => runMultiGacha(gachaCount)}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 shadow-lg"
                      >
                        {gachaCount}回ガチャを回す
                      </button>
                      
                      <button 
                        onClick={handleCloseGacha}
                        className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 mt-2"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              // ガチャ処理中のアニメーション表示
              ) : processing ? (
                <div className="py-12 text-center relative">
                  {/* 背景アニメーション */}
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(to right, #dbeafe, #c7d2fe)",
                      backgroundSize: '200% 100%',
                    }}
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {gifUrl && <Image src={gifUrl} alt="Party Parrot" width={400} height={400}/>}
                    </motion.div>
                    <motion.p
                      animate={{
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity
                      }}
                      className="mt-4 text-gray-700 font-medium"
                    >
                      ✨ パロットを探しています... ✨
                    </motion.p>
                  </div>
                </div>
              // 単一ガチャの結果表示
              ) : showingSingleResult && currentSingleParrot ? (
                <div className="relative py-6">
                  {/* 背景のグラデーション */}
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 opacity-25 rounded-xl"
                    style={{
                      background: rarityConfigs[currentSingleParrot.rarityType].bgGradient,
                      backgroundSize: '200% 100%',
                    }}
                  />

                  <div className="relative text-center z-10">
                    <div className="py-8 px-4">
                      {/* パーティクルエフェクト */}
                      <Particles config={rarityConfigs[currentSingleParrot.rarityType]} />
                      
                      {/* パロット表示部分 */}
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative"
                      >
                        <motion.div
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{
                            backgroundPosition: {
                              duration: 5,
                              repeat: Infinity,
                              ease: "linear"
                            }
                          }}
                          className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center bg-gradient-to-r ${rarityConfigs[currentSingleParrot.rarityType].colors}`}
                        >
                          <div className="bg-white rounded-full p-2">
                            <img 
                              src={currentSingleParrot.parrot.image_url || "/api/placeholder/120/120"} 
                              alt={currentSingleParrot.parrot.name || "Rare Parrot"} 
                              className="w-32 h-32" 
                            />
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* パロット情報表示 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6"
                      >
                        {/* レアリティタイトル */}
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className={`text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${rarityConfigs[currentSingleParrot.rarityType].colors}`}
                        >
                          ✨ {rarityConfigs[currentSingleParrot.rarityType].title} ✨
                        </motion.div>

                        {/* パロット名 */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className={`text-xl font-medium mb-4 bg-clip-text text-transparent bg-gradient-to-r ${rarityConfigs[currentSingleParrot.rarityType].colors}`}
                        >
                          {currentSingleParrot.parrot.name || "不明なパロット"}
                        </motion.div>

                        {/* スター表示 */}
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex justify-center gap-2 mb-4"
                        >
                        {Array.from({ length: rarityConfigs[currentSingleParrot.rarityType].stars }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            >
                              <Star className="h-8 w-8 text-yellow-400 fill-current" />
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* パロット説明文（あれば表示） */}
                        {currentSingleParrot.parrot.description && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-600 mt-2 mb-4"
                          >
                            {currentSingleParrot.parrot.description}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* OKボタン */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={closeSingleResult}
                        className={`mt-6 px-8 py-3 bg-gradient-to-r ${rarityConfigs[currentSingleParrot.rarityType].colors} text-white rounded-lg hover:opacity-90 shadow-lg z-50 relative`}
                      >
                        OK!
                      </motion.button>
                    </div>
                  </div>
                </div>
              // パロット詳細表示
              ) : showDetail && detailParrot ? (
                <div className="relative py-6">
                  {/* 閉じるボタン */}
                  <button 
                    onClick={closeDetail}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 p-2 z-20"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center text-center">
                    {/* 背景のグラデーション */}
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute inset-0 opacity-25 rounded-xl"
                      style={{
                        background: rarityConfigs[detailParrot.rarityType].bgGradient,
                        backgroundSize: '200% 100%',
                      }}
                    />
                    
                    {/* パーティクルエフェクト */}
                    <Particles config={rarityConfigs[detailParrot.rarityType]} />
                    
                    <div className="relative z-10 max-w-md mx-auto px-4 py-2">
                      {/* パロット画像 */}
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="mb-6"
                      >
                        <div className={`w-40 h-40 rounded-full bg-gradient-to-r ${rarityConfigs[detailParrot.rarityType].colors} p-2 mx-auto`}>
                          <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                            <img 
                              src={detailParrot.parrot.image_url || "/api/placeholder/120/120"} 
                              alt={detailParrot.parrot.name} 
                              className="w-32 h-32 object-contain" 
                            />
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* レアリティタイトル */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className={`text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${rarityConfigs[detailParrot.rarityType].colors} text-center`}
                      >
                        ✨ {rarityConfigs[detailParrot.rarityType].title} ✨
                      </motion.div>
                      
                      {/* パロット名 */}
                      <div className="text-xl font-medium mb-4 text-center">
                        {detailParrot.parrot.name}
                      </div>
                      
                      {/* スター表示 */}
                      <div className="flex justify-center gap-2 mb-4 text-center">
                        {Array.from({ length: rarityConfigs[detailParrot.rarityType].stars }).map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          >
                            <Star className="h-6 w-6 text-yellow-400 fill-current" />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* パロット説明文（あれば表示） */}
                      {detailParrot.parrot.description && (
                        <div className="text-gray-600 mt-4 mb-6 max-w-xs mx-auto text-center px-2">
                          {detailParrot.parrot.description}
                        </div>
                      )}
                      
                      {/* 閉じるボタン */}
                      <div className="flex justify-center">
                        <button
                          onClick={closeDetail}
                          className={`mt-6 px-8 py-3 bg-gradient-to-r ${rarityConfigs[detailParrot.rarityType].colors} text-white rounded-lg hover:opacity-90 shadow-lg`}
                        >
                          戻る
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              // グリッド表示のガチャ結果
              ) : showResult ? (
                <div className="py-6 relative">
                  {/* 背景グラデーション */}
                  <div 
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, #e0f2fe, #ddd6fe, #fbcfe8)",
                      backgroundSize: '200% 200%',
                    }}
                  />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6 text-center text-gray-800">ガチャ結果</h3>
                    
                    {/* グリッド表示 */}
                    <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden px-2">
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {gachaResults.map((result, index) => (
                          <motion.div
                            key={`${result.parrot.parrot_id}-${index}`} // ユニークなキーにする
                            initial={{ opacity: 0 }}
                            animate={{ opacity: result.revealed ? 1 : 0.4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ResultCard
                              result={result}
                              index={index}
                              onClick={() => showParrotDetail(result)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 完了ボタン */}
                    {allRevealed && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handleCloseGacha}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 shadow-lg"
                        >
                          完了
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              // ロード中表示
              ) : (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">ガチャを準備中...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
  //#endregion
};

export default GachaAnimation;