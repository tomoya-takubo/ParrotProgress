'use client';

import { Card, CardContent } from './ui/Card';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {

  // フォームの状態を管理
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp]= useState(false); // サインアップボード管理

  // フォーム送信時の処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('送信されたデータ: ', {email, password, mode: isSignUp ? 'サインアップ' : 'サインイン'})
    // TODO: 後で認証処理を実装
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <Card className={styles.modalCard}>
        <CardContent className={styles.modalContent}>
          <div className={styles.closeButton}>
            <button onClick={onClose}>✕</button>
          </div>
          <div className={styles.modalInner}>
            <h2 className={styles.modalTitle}>
              {isSignUp ? 'アカウント作成' : 'サインイン'}
            </h2>
            {/* タブ切り替えを追加 */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${isSignUp? styles.actibtaTab : ''}`}
                onClick={() => setIsSignUp(false)}
              >
                サインイン
              </button>
              <button
                className={`${styles.tab} ${isSignUp? styles.actibtaTab : ''}`}
                onClick={() => setIsSignUp(true)}
              >
                アカウント作成
              </button>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>

              {/* メールアドレス入力部 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>メールアドレス</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* パスワード入力部 */}
              <div className={styles.formGroup}>
                <label className={styles.label}>パスワード</label>
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                {isSignUp ? 'アカウント作成' : 'サインイン'}
              </button>

            </form>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}