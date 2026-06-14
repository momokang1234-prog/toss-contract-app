import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { supabase } from '../api/supabase';

export async function generateAndUploadPDF(
  elementId: string,
  contractId: string
): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('계약서 요소를 찾을 수 없습니다.');

  // 1. PDF 렌더링
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  const pdfBlob = pdf.output('blob');

  // 2. Supabase Storage 업로드
  const filePath = `contracts/${contractId}_${Date.now()}.pdf`;
  
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

  // 3. 다운로드 URL 가져오기
  const { data: { publicUrl } } = supabase.storage
    .from('contract_documents')
    .getPublicUrl(filePath);

  return publicUrl;
}
