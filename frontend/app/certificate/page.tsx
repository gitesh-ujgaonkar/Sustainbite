import React from 'react';
import { CertificateTemplate } from '@/components/certificate-template';

export default function CertificatePreviewPage() {
  return (
    <div>
      {/* 
        This is a temporary hidden route strictly engineered to preview the 1123x794 PDF 
        Certificate geometry cleanly inside the browser without downloading it.
      */}
      <CertificateTemplate
        type="volunteer"
        name="Ujgaonkar Gitesh"
        quantity_kg={452}
        date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        isPreview={true}
      />
    </div>
  );
}
