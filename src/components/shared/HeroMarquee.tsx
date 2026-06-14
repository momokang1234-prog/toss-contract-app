import styles from './HeroMarquee.module.css';

const IMAGES = [
  '/assets/marquee/01991f04-03bb-7612-8b82-cc3586b49659.png',
  '/assets/marquee/01991ef8-4f7b-754a-8a56-0953a5dc8140.png',
  '/assets/marquee/01991ef8-4f62-7618-a896-a0019028796f.png',
  '/assets/marquee/01991f05-0336-7511-b745-1c275d80f79e.png',
  '/assets/marquee/01991ef8-4f62-75a8-86a1-a6c99d1ec8f6.png',
  '/assets/marquee/01991ef8-4f69-7036-90dc-0c79f8c4aca9.png',
  '/assets/marquee/01991f05-457e-7239-ae3a-5ea65a697f85.png',
  '/assets/marquee/01991ef8-4f48-7053-8291-41649aa8298c.png'
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
