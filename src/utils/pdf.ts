import type { Contract } from '../hooks/useContracts';
import { generatePrintableHTML, A4_WIDTH_MM, A4_HEIGHT_MM } from '../domain/contract/template';
import { supabase } from '../api/supabase';
import i18n from '../i18n';

const t = (key: string, opt?: Record<string, unknown>) => i18n.t(key, opt);

/** 
 * 공통 PDF 생성 로직 (A4 비율 유지: 단일 캡처 → A4 높이로 슬라이스)
 * template.ts 의 generatePrintableHTML을 바탕으로 PDF Blob을 생성합니다.
 */
export async function generateContractPDFBlob(contract: Contract): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const fullHTML = generatePrintableHTML(contract);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${A4_WIDTH_MM}mm`;
  container.innerHTML = fullHTML;
  document.body.appendChild(container);

  const pdf = new jsPDF('p', 'mm', 'a4');

  try {
    // 웹폰트 로딩 대기
    await new Promise(r => setTimeout(r, 400));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: container.scrollWidth,
      height: container.scrollHeight,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    const pageHeightPx = Math.floor((A4_HEIGHT_MM / A4_WIDTH_MM) * canvas.width);
    const numPages = Math.ceil(canvas.height / pageHeightPx);

    for (let i = 0; i < numPages; i++) {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = pageHeightPx;
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) continue;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, i * pageHeightPx, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx);

      if (i > 0) pdf.addPage();
      pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
    }
    
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

/** 사용자 다운로드용 */
export async function downloadContractPDF(contract: Contract): Promise<void> {
  const blob = await generateContractPDFBlob(contract);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t('contract.title').replace(/\s+/g, '')}_${contract.worker_name}_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Supabase 스토리지 업로드용 (계약서 확정 등) */
export async function generateAndUploadPDF(contract: Contract): Promise<string> {
  const isMock = typeof window !== 'undefined' && window.sessionStorage?.getItem('force_mock') === 'true';
  if (isMock) {
    console.log('[Mock] PDF 생성 및 업로드 스킵, 가짜 URL 반환');
    return `https://mock.supabase.co/storage/v1/object/public/contract_documents/mock_contract_${Date.now()}.pdf`;
  }

  const pdfBlob = await generateContractPDFBlob(contract);
  
  const filePath = `contracts/${contract.id}_${Date.now()}.pdf`;
  
  const { error } = await supabase.storage
    .from('contract_documents')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('PDF 업로드 실패:', error.message);
    throw new Error('PDF 스토리지 업로드에 실패했습니다.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('contract_documents')
    .getPublicUrl(filePath);

  return publicUrl;
}
