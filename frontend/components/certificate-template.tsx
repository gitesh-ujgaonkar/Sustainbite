import React from 'react';

export interface CertificateTemplateProps {
  type: 'volunteer' | 'restaurant';
  name: string;
  quantity_kg: number;
  date: string;
  certificate_number?: string;
  isPreview?: boolean;
}

export function CertificateTemplate({ type, name, quantity_kg, date, certificate_number, isPreview = false }: CertificateTemplateProps) {
  const title =
    type === 'volunteer'
      ? 'Certificate of Grateful Acknowledgement'
      : 'Certificate of Commendable Stewardship';

  return (
    <div
      aria-hidden={!isPreview}
      className={
        isPreview
          ? "w-full flex justify-center items-center p-8 bg-gray-100 min-h-screen"
          : "absolute -left-[9999px] top-0 pointer-events-none"
      }
    >
      <div
        id="certificate-node"
        className="relative bg-gray-50 flex items-center justify-center font-sans"
        style={{ width: '1123px', height: '794px' }} // Exact A4 Landscape dimensions at 96 DPI
      >
        {/* Outer Embellished Border */}
        <div className="absolute inset-4 border-[16px] border-emerald-50/50 flex items-center justify-center p-8">
          <div className="absolute inset-0 border-2 border-emerald-700/20 m-6" />
          
          {/* Inner Certificate Container */}
          <div className="bg-white w-full h-full shadow-sm rounded-lg flex flex-col items-center justify-center text-center p-16 relative overflow-hidden">
            
            {/* Corner accoutrements */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-emerald-600 rounded-tl-lg m-8" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-emerald-600 rounded-tr-lg m-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-emerald-600 rounded-bl-lg m-8" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-emerald-600 rounded-br-lg m-8" />

            {/* Logo Placeholder */}
            <div className="mb-8 p-4 bg-emerald-50 rounded-full">
              <span className="text-6xl" role="img" aria-label="leaf">🌿</span>
            </div>

            {/* Top Text */}
            <h1 className="text-4xl font-serif text-emerald-950 font-semibold tracking-wide uppercase mb-2">
              The Hunger Signal
            </h1>
            <p className="text-emerald-700 tracking-[0.2em] uppercase text-sm font-medium mb-12">
              Official Platform Recognition
            </p>

            <h2 className="text-3xl font-serif italic text-gray-700 mb-8">
              {title}
            </h2>

            <p className="text-gray-500 mb-4">is hereby proudly presented to</p>

            {/* Recipient Name */}
            <div className="border-b border-gray-300 min-w-[500px] pb-2 mb-8">
              <h3 className="text-6xl font-serif text-emerald-900 font-bold tracking-tight">
                {name}
              </h3>
            </div>

            {/* Impact Statement */}
            <p className="text-xl text-gray-700 max-w-2xl leading-relaxed mx-auto mb-16">
              In deep appreciation of your unwavering commitment to ending hunger and preserving our environment. 
              Your active participation has directly rescued <span className="font-bold text-emerald-700">{quantity_kg} kg</span> of surplus food, powerfully transforming waste into sustenance for our community.
            </p>

            {/* Signature Area */}
            <div className="flex justify-between w-full max-w-3xl mt-auto items-end px-12">
              <div className="flex flex-col items-center">
                <span className="text-lg text-gray-800 font-serif mb-2">{date}</span>
                <div className="w-48 border-t border-gray-400"></div>
                <span className="text-sm text-gray-500 uppercase tracking-wider mt-2">Date Awarded</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif italic text-emerald-800 mb-1">SustainBite.</span>
                <div className="w-48 border-t border-gray-400"></div>
                <span className="text-sm text-gray-500 uppercase tracking-wider mt-2">The Hunger Signal Foundation</span>
              </div>
            </div>

            {/* Official ID Stamp */}
            {certificate_number && (
              <div className="absolute bottom-6 right-8 text-xs font-mono text-gray-400 opacity-70 tracking-widest">
                ID: {certificate_number}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
