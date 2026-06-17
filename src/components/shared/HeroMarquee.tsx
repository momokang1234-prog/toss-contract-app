import styles from './HeroMarquee.module.css';

const IMAGES = [
  '/assets/marquee/contract_doc_1781603373026_transparent.png',
  '/assets/marquee/digital_sign_1781603405614_transparent.png',
  '/assets/marquee/handshake_deal_1781603394558_transparent.png',
  '/assets/marquee/salary_coins_1781603382673_transparent.png',
  '/assets/marquee/contract_doc_1781603373026_transparent.png',
  '/assets/marquee/digital_sign_1781603405614_transparent.png',
  '/assets/marquee/handshake_deal_1781603394558_transparent.png',
  '/assets/marquee/salary_coins_1781603382673_transparent.png'
];

export function HeroMarquee() {
  return (
    <div className={styles.container}>
      <div className={styles.track}>
        {/* 그룹 1 */}
        <div className={styles.group}>
          {IMAGES.map((src, idx) => (
            <div key={`g1-${idx}`} className={styles.imageWrapper}>
              <img src={src} className={styles.image} alt="" loading="lazy" />
            </div>
          ))}
        </div>
        {/* 그룹 2 (자연스러운 루프를 위해 동일한 그룹을 복제) */}
        <div className={styles.group}>
          {IMAGES.map((src, idx) => (
            <div key={`g2-${idx}`} className={styles.imageWrapper}>
              <img src={src} className={styles.image} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
