import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Add a temporary class to ensure it's fully visible and styled for print if needed
    element.classList.add('pdf-export-mode');

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true, // Allow images from external URLs
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    element.classList.remove('pdf-export-mode');
  }
};
