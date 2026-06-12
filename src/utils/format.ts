export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
}
