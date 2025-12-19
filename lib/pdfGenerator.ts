import { jsPDF } from 'jspdf';

/**
 * Converts an array of base64 image strings into a multi-page PDF document
 * @param images - Array of base64-encoded image strings (data:image/jpeg;base64,...)
 * @returns Promise resolving to a Blob containing the PDF document
 */
export async function generateSecurePDF(images: string[]): Promise<Blob> {
  if (!images || images.length === 0) {
    throw new Error('At least one image is required to generate PDF');
  }

  return new Promise((resolve, reject) => {
    try {
      // Create PDF with A4 dimensions in portrait mode
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Process each image
      images.forEach((imageData, index) => {
        // Add new page if not the first image
        if (index > 0) {
          pdf.addPage();
        }

        try {
          // Create temporary image element to get dimensions
          const img = new Image();
          img.src = imageData;

          img.onload = () => {
            // Calculate dimensions to fit image within page while maintaining aspect ratio
            const imgWidth = img.width;
            const imgHeight = img.height;
            const pageAspect = pageWidth / pageHeight;
            const imgAspect = imgWidth / imgHeight;

            let finalWidth = pageWidth;
            let finalHeight = pageWidth / imgAspect;

            if (finalHeight > pageHeight) {
              finalHeight = pageHeight;
              finalWidth = pageHeight * imgAspect;
            }

            // Center image on page
            const xOffset = (pageWidth - finalWidth) / 2;
            const yOffset = (pageHeight - finalHeight) / 2;

            // Add image to PDF
            pdf.addImage(imageData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);

            // Add page number at bottom
            const pageNum = index + 1;
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(
              `Page ${pageNum}`,
              pageWidth / 2,
              pageHeight - 5,
              { align: 'center' }
            );

            // If this is the last image, generate the PDF blob
            if (index === images.length - 1) {
              const pdfBlob = pdf.output('blob');
              resolve(pdfBlob);
            }
          };

          img.onerror = () => {
            reject(new Error(`Failed to load image ${index + 1}`));
          };
        } catch (error) {
          reject(new Error(`Error processing image ${index + 1}: ${error}`));
        }
      });
    } catch (error) {
      reject(new Error(`Failed to generate PDF: ${error}`));
    }
  });
}

/**
 * Uploads a PDF blob to Firebase Storage
 * @param pdfBlob - The PDF blob to upload
 * @param filename - Name for the PDF file
 * @returns Promise resolving to the download URL
 */
export async function uploadPDFToFirebase(
  pdfBlob: Blob,
  filename: string
): Promise<string> {
  // This will be implemented when integrating with Firebase Storage
  // For now, returning a placeholder
  console.log(`Would upload ${filename} (${pdfBlob.size} bytes) to Firebase Storage`);
  return `gs://hati-registry.appspot.com/documents/${filename}`;
}

/**
 * Downloads a PDF blob to the user's device
 * @param pdfBlob - The PDF blob to download
 * @param filename - Name for the downloaded file
 */
export function downloadPDF(pdfBlob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
