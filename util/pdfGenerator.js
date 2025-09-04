const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Type mapping with colors
const TYPE_MAPPING = {
  0: { label: 'Admin', color: '#9c27b0' },
  1: { label: 'Purchase', color: '#4caf50' },
  2: { label: 'Trainer', color: '#ff9800' },
  3: { label: 'Create', color: '#2196f3' },
  4: { label: 'Edit', color: '#673ab7' },
  5: { label: 'Upscaler', color: '#009688' },
  6: { label: 'Generate', color: '#e91e63' },
  7: { label: 'Face Swap', color: '#FF5722' },
  8: { label: 'Ideogram', color: '#9C27B0' },
  9: { label: 'Qwen Edit', color: '#3F51B5' }
};

// Create rounded rectangle with fill
function createRoundedRectangle(doc, x, y, width, height, radius, fillColor) {
  doc.fillColor(fillColor);
  doc.roundedRect(x, y, width, height, radius);
  doc.fill();
}

// Add text with rounded background
function addTextWithRoundedBackground(doc, text, x, y, bgColor, textColor = '#FFFFFF', fontSize = 8) {
  const textWidth = doc.widthOfString(text, { fontSize });
  const textHeight = fontSize + 4;
  const padding = 6;
  
  // Draw rounded background
  createRoundedRectangle(doc, x, y - 2, textWidth + padding * 2, textHeight, 4, bgColor);
  
  // Add text
  doc.fillColor(textColor);
  doc.fontSize(fontSize).text(text, x + padding, y, { width: textWidth });
}

// Generate PDF report
async function generateCoinHistoryReport(reportData, fileName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 30,
        layout: 'portrait'
      });
      
      // Create user-specific directory path
      const userReportsDir = path.join(__dirname, '..', 'storage', 'GenerativeReplicate', reportData.userId, 'reports');
      
      // Ensure the user-specific directory exists
      if (!fs.existsSync(userReportsDir)) {
        fs.mkdirSync(userReportsDir, { recursive: true });
      }
      
      const filePath = path.join(userReportsDir, fileName);
      
      // Create write stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Page width for mobile-friendly layout
      const pageWidth = doc.page.width - 60; // Account for margins
      
      // TITLE SECTION
      doc.fontSize(16).fillColor('#000000').text('GIC Photo AI', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).text('Coin History', { align: 'center' });
      doc.moveDown(1);
      
      // User info
      doc.fontSize(10);
      doc.text(`User: ${reportData.userId}`, { align: 'left' });
      doc.text(`Start date: ${reportData.startDate}`, { align: 'left' });
      doc.text(`End date: ${reportData.endDate}`, { align: 'left' });
      doc.moveDown(1);
      
      // Add line separator
      doc.strokeColor('#CCCCCC').lineWidth(1);
      doc.moveTo(30, doc.y).lineTo(pageWidth + 30, doc.y).stroke();
      doc.moveDown(0.5);
      
      // HEADER
      doc.fontSize(10).fillColor('#000000');
      const headerY = doc.y;
      const colWidth = pageWidth / 5;
      
      doc.text('DATE', 30, headerY, { width: colWidth });
      doc.text('DIRECTION', 30 + colWidth, headerY, { width: colWidth });
      doc.text('COINS', 30 + colWidth * 2, headerY, { width: colWidth });
      doc.text('DOLLARS', 30 + colWidth * 3, headerY, { width: colWidth });
      doc.text('TYPE', 30 + colWidth * 4, headerY, { width: colWidth });
      
      doc.moveDown(1);
      
      // Add line separator
      doc.strokeColor('#CCCCCC').lineWidth(1);
      doc.moveTo(30, doc.y).lineTo(pageWidth + 30, doc.y).stroke();
      doc.moveDown(0.5);
      
      // DETAIL ROWS
      let totalCoins = 0;
      
      for (const record of reportData.records) {
        const currentY = doc.y;
        
        // Check if we need a new page (accounting for row height and spacing)
        const rowHeight = 20; // Approximate height of a row
        if (currentY > doc.page.height - 100 - rowHeight) {
          doc.addPage();
          doc.fontSize(10).fillColor('#000000');
          // Reset Y position to top of new page (accounting for margins)
          doc.y = 100;
        }
        
        // DATE column
        const dateText = new Date(record.date).toISOString().replace('T', ' ').slice(0, 19);
        doc.fillColor('#000000').fontSize(10).text(dateText, 30, doc.y + 2, { width: colWidth });

        // DIRECTION column
        const directionColor = record.is_income ? '#4caf50' : '#f44336';
        const directionText = record.is_income ? 'Income' : 'Expense';
        addTextWithRoundedBackground(doc, directionText, 30 + colWidth, doc.y, directionColor);
        
        // COINS column
        const coinSign = record.is_income ? '+' : '-';
        const coinColor = record.is_income ? '#4caf50' : '#f44336';
        const coinText = `${coinSign}${record.coin}`;
        doc.fillColor(coinColor);
        doc.fontSize(10).text(coinText, 30 + colWidth * 2, doc.y + 2, { width: colWidth });
        
        // DOLLARS column
        const dollarText = record.is_income ? record.dollar.toString() : '-';
        doc.fillColor('#000000').text(dollarText, 30 + colWidth * 3, doc.y + 2, { width: colWidth });
        
        // TYPE column
        const typeInfo = TYPE_MAPPING[record.type] || { label: 'Unknown', color: '#757575' };
        addTextWithRoundedBackground(doc, typeInfo.label, 30 + colWidth * 4, doc.y, typeInfo.color);
        
        // Calculate total coins
        totalCoins += record.is_income ? record.coin : -record.coin;
        
        doc.moveDown(1.5);
      }
      
      // FOOTER
      doc.moveDown(1);
      doc.strokeColor('#CCCCCC').lineWidth(1);
      doc.moveTo(30, doc.y).lineTo(pageWidth + 30, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Total coins
      doc.fontSize(12).fillColor('#000000');
      const totalColor = totalCoins >= 0 ? '#4caf50' : '#f44336';
      const totalSign = totalCoins >= 0 ? '+' : '';
      doc.fillColor(totalColor);
      doc.text(`Total Coins: ${totalSign}${totalCoins}`, { align: 'right' });
      
      // Finalize the PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve(fileName);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateCoinHistoryReport };