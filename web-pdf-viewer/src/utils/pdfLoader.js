import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

async function generateFileHash(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export async function loadPdfFromFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileHash = await generateFileHash(file);
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    return { pdfDocument, fileName: file.name, fileHash };
  } catch (error) {
    console.error("Error loading PDF:", error);
    throw error;
  }
}
