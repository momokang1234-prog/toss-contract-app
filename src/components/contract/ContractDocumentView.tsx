import { useEffect, useRef } from 'react';
import type { Contract } from '../../hooks/useContracts';
import { generatePrintableHTML } from '../../domain/contract/template';

interface Props {
  contract: Contract;
}

export function ContractDocumentView({ contract }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (!ref.current.shadowRoot) {
        ref.current.attachShadow({ mode: 'open' });
      }
      ref.current.shadowRoot!.innerHTML = generatePrintableHTML(contract);
    }
  }, [contract]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: '100%', 
        overflowX: 'auto',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E5E8EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }} 
    />
  );
}
