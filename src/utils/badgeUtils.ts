import i18n from '../i18n';

export type BadgeColor = 'blue' | 'teal' | 'green' | 'red' | 'yellow' | 'elephant';

const badgeLabels: Record<string, Record<string, string>> = {
  ko: { draft: '작성 중', pending: '서명 대기', rejected: '거절됨', completed: '완료', cancelled: '취소됨' },
  en: { draft: 'Drafting', pending: 'Pending Sign', rejected: 'Rejected', completed: 'Completed', cancelled: 'Cancelled' },
  zh: { draft: '起草中', pending: '待签署', rejected: '已拒绝', completed: '已完成', cancelled: '已取消' },
  vi: { draft: 'Đang soạn', pending: 'Chờ ký', rejected: 'Bị từ chối', completed: 'Đã hoàn thành', cancelled: 'Đã hủy' },
  th: { draft: 'กำลังร่าง', pending: 'รอลงนาม', rejected: 'ถูกปฏิเสธ', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิกแล้ว' },
  km: { draft: 'កំពុងព្រាង', pending: 'រង់ចាំចុះហត្ថលេខា', rejected: 'ត្រូវបានปฏิเสธ', completed: 'បានបញ្ចប់', cancelled: 'បានលុបចោល' },
  ne: { draft: 'मस्यौदा', pending: 'हस्ताक्षर पर्खिँदै', rejected: 'अस्वीकृत', completed: 'सम्पन्न', cancelled: 'रद्द भयो' },
  uz: { draft: 'Loyiha', pending: 'Imzo kutilmoqda', rejected: 'Rad etildi', completed: 'Tugallandi', cancelled: 'Bekor qilindi' },
  id: { draft: 'Draft', pending: 'Menunggu Tanda Tangan', rejected: 'Ditolak', completed: 'Selesai', cancelled: 'Dibatalkan' },
  mn: { draft: 'Төсөл', pending: 'Гарын үсэг хүлээж байна', rejected: 'Татгалзсан', completed: 'Дууссан', cancelled: 'Цуцлагдсан' },
};

export const getContractBadge = (status: string): { label: string; color: BadgeColor } => {
  const lang = i18n.language?.split('-')[0] ?? 'ko';
  const labels = badgeLabels[lang] ?? badgeLabels['en'] ?? badgeLabels['ko'];

  switch (status) {
    case 'draft':
      return { label: labels.draft, color: 'elephant' };
    case 'sent':
    case 'viewed':
      return { label: labels.pending, color: 'yellow' };
    case 'rejected':
      return { label: labels.rejected, color: 'red' };
    case 'signed':
    case 'completed':
      return { label: labels.completed, color: 'blue' };
    case 'cancelled':
    case 'expired':
      return { label: labels.cancelled, color: 'red' };
    default:
      return { label: status, color: 'elephant' };
  }
};

