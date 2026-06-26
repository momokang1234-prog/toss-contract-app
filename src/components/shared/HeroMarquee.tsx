import styles from './HeroMarquee.module.css';

// 토스 공식 2D 이모지(static.toss.im/2d-emojis). 규정 준수 + 브라우저/런타임 모두 렌더.
const IMAGES = [
  'https://static.toss.im/2d-emojis/png/4x/u1F4C4.png', // 📄 계약서
  'https://static.toss.im/2d-emojis/png/4x/u270D.png',  // ✍️ 서명
  'https://static.toss.im/2d-emojis/png/4x/u1F91D.png', // 🤝 악수
  'https://static.toss.im/2d-emojis/png/4x/u1F4B0.png', // 💰 급여
  'https://static.toss.im/2d-emojis/png/4x/u1F4C4.png',
  'https://static.toss.im/2d-emojis/png/4x/u270D.png',
  'https://static.toss.im/2d-emojis/png/4x/u1F91D.png',
  'https://static.toss.im/2d-emojis/png/4x/u1F4B0.png',
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
