'use strict';

const PDFDocument = require('pdfkit');

function generatePayslipPdf(payslip, lines) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('PeoplePay360', { align: 'center' });
      doc.fontSize(14).text('Payslip', { align: 'center' });
      doc.moveDown();

      // Employee Details
      doc.fontSize(12)
        .text(`Employee: ${payslip.first_name} ${payslip.last_name} (${payslip.employee_code || ''})`)
        .text(`Period: ${payslip.period_start} to ${payslip.period_end}`)
        .text(`Status: ${payslip.status}`);
      doc.moveDown();

      // Table Header
      doc.fontSize(10).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Code', 50, tableTop);
      doc.text('Name', 150, tableTop);
      doc.text('Amount', 400, tableTop, { width: 100, align: 'right' });
      doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
      
      let y = tableTop + 20;
      doc.font('Helvetica');

      // Sort lines by sequence
      const sortedLines = [...lines].sort((a, b) => a.sequence - b.sequence);

      for (const line of sortedLines) {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        
        doc.text(line.code, 50, y);
        doc.text(line.name, 150, y);
        doc.text(Number(line.amount).toFixed(2), 400, y, { width: 100, align: 'right' });
        y += 15;
      }

      // Net Amount Summary
      const netLine = sortedLines.find(l => l.category === 'net');
      if (netLine) {
        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Net Pay: ${Number(netLine.amount).toFixed(2)}`, { align: 'right' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generatePayslipPdf
};
