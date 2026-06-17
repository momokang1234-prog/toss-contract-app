import styles from './DevGalleryPage.module.css';

const PAGES = [
  { title: '로그인', url: '/login?preview=true', role: null },
  { title: '메인 대시보드 (사장)', url: '/employer/dashboard', role: 'employer' },
  { title: '사업장 관리', url: '/employer/business/manage', role: 'employer' },
  { title: '진행중 계약 (사장)', url: '/employer/contracts', role: 'employer' },
  { title: '계약서 작성 Step 1', url: '/employer/contracts/new', role: 'employer' },
  { title: '내 계약 (근로자)', url: '/worker/contracts', role: 'worker' },
];

export default function DevGalleryPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Toss Contract App - Frontend Gallery</h1>
        <p>전체 화면을 한눈에 시각적으로 확인하는 개발자 모드입니다.</p>
      </header>
      
      <div className={styles.grid}>
        {PAGES.map((page, idx) => {
          // 우회 라우터를 통해 모의 권한(Mock Role) 주입 후 목적지로 이동
          const src = `/dev/bypass?role=${page.role || ''}&path=${encodeURIComponent(page.url)}`;
          return (
            <div key={idx} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.title}>{page.title}</span>
                <span className={styles.roleBadge}>{page.role === 'employer' ? '사장님' : page.role === 'worker' ? '근로자' : '공통'}</span>
              </div>
              <iframe 
                className={styles.frame} 
                src={src} 
                title={page.title}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
