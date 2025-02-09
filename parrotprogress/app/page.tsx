'use client'; 
import { ArrowRight, BookOpen, Gift, Timer } from 'lucide-react';
import StartButton from './components/StartButton';
import styles from './styles/Home.module.css';
import { ParrotCollection } from './components/ParrotCollection';



export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}> ぱろっとぷろぐれす </h1>
          <p className={styles.subtitle}>PartyParrotと一緒に楽しく継続</p>
          <div className={styles.heroParrot}>
            <img
              src="/images/60fpsparrot.gif"
              alt="Party Parrot"
            />
          </div>
          <StartButton />
        </div>
      </div>
      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
                <Timer className="w-6 h-6" />
              </div>
              <h3 className={styles.featureTitle}>集中タイマー</h3>
            </div>
            <p className={styles.featureDescription}>
              25分の集中タイムで効率的に作業。達成するたびにPartyParrotがお祝いとコインをプレゼント！
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className={styles.featureTitle}>3行日記</h3>
            </div>
            <p className={styles.featureDescription}>
              シンプルな3行で今日を振り返り。継続でPartyParrotから特別なメッセージが届きます！
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <div className={`${styles.iconWrapper} ${styles.iconPink}`}>
                <Gift className="w-6 h-6" />
              </div>
              <h3 className={styles.featureTitle}>PartyParrotガチャ</h3>
            </div>
            <p className={styles.featureDescription}>
              獲得したコインでレアなPartyParrotをゲット！特殊能力を活用して作業効率アップ！
            </p>
          </div>
        </div>
      </section>
      <section className={styles.collection}>
        <div className={styles.collectionInner}>
          <h2 className={styles.collectionTitle}>可愛いPartyParrotを集めよう！</h2>
          <ParrotCollection />
          <p className={styles.collectionDescription}>
            目標達成や継続記録でレアなPartyParrotをゲット！
          </p>
        </div>
      </section>
      <section className={styles.ecoSection}>
        <div className={styles.ecoInner}>
          <h2 className={styles.ecoTitle}>カカポ保護活動への貢献</h2>
          <div className={styles.ecoDescription}>
            <p>あなたの継続的な活動が、実際のカカポ（PartyParrotのモデル）の保護活動に貢献します。</p>
            <p>カカポは絶滅が危惧されている貴重な鳥類です。</p>
          </div>
          <a 
            href="https://www.doc.govt.nz/kakapo-recovery" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.ecoLink}
          >
            詳しく見る <ArrowRight className={styles.ecoArrow} />
          </a>
        </div>
      </section>
    </main>
  );
}