export async function downloadCertificate(elementId: string = 'certificate-node', filename: string = 'Hunger_Signal_Certificate.pdf') {
  try {
    const node = document.getElementById(elementId);
    if (!node) {
      console.error(`Certificate node with ID ${elementId} not found.`);
      return false;
    }

    // Lazy load the gigantic parsing dependencies ONLY when the user clicks the explicit 'Download' button!
    // This prevents these massive libraries from infecting the global Next.js initial bundle size. 
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // Generate high resolution canvas representation natively mapping DOM rect boundaries globally
    const canvas = await html2canvas(node, {
      scale: 2, // Double resolution for crisp text printing
      backgroundColor: '#f9fafb', // Match bg-gray-50
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // Initialize raw buffer engine A4 Landscape exactly matching 1123 x 794 template logic
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1123, 794]
    });

    // Native direct stream embed 
    pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794);

    // Forces generic anchor download across the DOM universally bypassing ad blockers globally
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return false;
  }
}
