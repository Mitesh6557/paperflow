import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useViewerStore } from '../store/viewerStore';
import { useAnnotationStore } from '../store/annotationStore';

// Helper to convert hex to rgb for pdf-lib (0-1 range)
const hexToRgb = (hex) => {
  if (hex === 'transparent') return undefined;
  if (!hex) return rgb(0, 0, 0);
  
  // Remove '#' if present
  hex = hex.replace(/^#/, '');
  
  // Parse short hex like #FFF
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return rgb(r, g, b);
};

export async function exportAnnotatedPdf() {
  const pdfDocument = useViewerStore.getState().pdfDocument;
  const fileName = useViewerStore.getState().fileName || 'document.pdf';
  const annotations = useAnnotationStore.getState().annotations;
  
  if (!pdfDocument) throw new Error("No document loaded");

  // Get original bytes from pdfjs-dist
  const originalBytes = await pdfDocument.getData();
  
  // Load into pdf-lib
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();
  
  // Embed fonts
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  // Group annotations by page
  const annByPage = annotations.reduce((acc, ann) => {
    if (!acc[ann.pageNumber]) acc[ann.pageNumber] = [];
    acc[ann.pageNumber].push(ann);
    return acc;
  }, {});

  // Iterate over each page that has annotations
  for (const [pageStr, pageAnns] of Object.entries(annByPage)) {
    const pageNum = parseInt(pageStr, 10);
    if (pageNum > pages.length) continue;
    
    // pdf-lib pages are 0-indexed
    const page = pages[pageNum - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    
    for (const ann of pageAnns) {
      const { x, y, width, height, type, style = {}, text, points } = ann;
      const { strokeColor, fillColor, strokeWidth = 2, opacity = 1, strokeStyle = 'solid' } = style;
      
      const borderColor = hexToRgb(strokeColor);
      const color = hexToRgb(fillColor);
      
      let borderDashArray = undefined;
      if (strokeStyle === 'dashed') borderDashArray = [strokeWidth * 3, strokeWidth * 3];
      else if (strokeStyle === 'dotted') borderDashArray = [strokeWidth, strokeWidth * 2];

      // Translate coordinates to bottom-left origin
      const pdfY = pageHeight - y;
      
      try {
        switch (type) {
          case 'rect':
            page.drawRectangle({
              x,
              y: pageHeight - (y + height),
              width,
              height,
              borderColor,
              borderWidth: borderColor ? strokeWidth : 0,
              color,
              opacity,
              borderOpacity: opacity,
              borderDashArray
            });
            break;
            
          case 'circle':
            page.drawEllipse({
              x: x + width / 2,
              y: pageHeight - (y + height / 2),
              xScale: width / 2,
              yScale: height / 2,
              borderColor,
              borderWidth: borderColor ? strokeWidth : 0,
              color,
              opacity,
              borderOpacity: opacity,
              borderDashArray
            });
            break;
            
          case 'line':
            page.drawLine({
              start: { x, y: pdfY },
              end: { x: x + width, y: pageHeight - (y + height) },
              thickness: strokeWidth,
              color: borderColor || rgb(0,0,0),
              opacity,
              dashArray: borderDashArray
            });
            break;
            
          case 'arrow':
            // Draw main line
            const endX = x + width;
            const endYFlipped = pageHeight - (y + height);
            
            page.drawLine({
              start: { x, y: pdfY },
              end: { x: endX, y: endYFlipped },
              thickness: strokeWidth,
              color: borderColor || rgb(0,0,0),
              opacity,
              dashArray: borderDashArray
            });
            
            // Draw arrowhead
            const angle = Math.atan2(height, width); // Note: height is dy, width is dx. But in pdf-lib y goes UP
            // Let's re-calculate angle based on pdf coords
            const dx = width;
            const dy = -height; // Because canvas y is down, pdf y is up
            const pdfAngle = Math.atan2(dy, dx);
            
            const headLen = 15;
            const angle1 = pdfAngle - Math.PI / 6;
            const angle2 = pdfAngle + Math.PI / 6;
            
            page.drawLine({
              start: { x: endX, y: endYFlipped },
              end: { x: endX - headLen * Math.cos(angle1), y: endYFlipped - headLen * Math.sin(angle1) },
              thickness: strokeWidth,
              color: borderColor || rgb(0,0,0),
              opacity
            });
            page.drawLine({
              start: { x: endX, y: endYFlipped },
              end: { x: endX - headLen * Math.cos(angle2), y: endYFlipped - headLen * Math.sin(angle2) },
              thickness: strokeWidth,
              color: borderColor || rgb(0,0,0),
              opacity
            });
            break;
            
          case 'draw':
            if (points && points.length > 1) {
              for (let i = 1; i < points.length; i++) {
                page.drawLine({
                  start: { x: x + points[i-1].x, y: pageHeight - (y + points[i-1].y) },
                  end: { x: x + points[i].x, y: pageHeight - (y + points[i].y) },
                  thickness: strokeWidth,
                  color: borderColor || rgb(0,0,0),
                  opacity,
                  dashArray: borderDashArray
                });
              }
            }
            break;
            
          case 'highlight':
            page.drawRectangle({
              x,
              y: pageHeight - (y + height),
              width,
              height,
              color: hexToRgb('#fde047'), // Default yellow highlight
              opacity: 0.4
            });
            break;
            
          case 'text':
            let font = fontNormal;
            if (style.bold && style.italic) font = fontBoldItalic;
            else if (style.bold) font = fontBold;
            else if (style.italic) font = fontItalic;
            
            const fontSize = style.fontSize || 16;
            
            // Calculate alignment
            const textWidth = font.widthOfTextAtSize(text || '', fontSize);
            let textX = x;
            if (style.align === 'center') textX = x + width / 2 - textWidth / 2;
            else if (style.align === 'right') textX = x + width - textWidth;
            
            page.drawText(text || '', {
              x: textX,
              y: pageHeight - (y + fontSize), // y is baseline
              size: fontSize,
              font,
              color: borderColor || rgb(0,0,0),
              opacity
            });
            break;
            
          default:
            break;
        }
      } catch (e) {
        console.warn(`Failed to export annotation ${ann.id}`, e);
      }
    }
  }

  // Save the modified PDF
  const pdfBytes = await pdfDoc.save();
  
  // Trigger download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Create output filename
  const baseName = fileName.replace(/\.pdf$/i, '');
  a.download = `${baseName}-annotated.pdf`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
