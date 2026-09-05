'use strict';

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Lazy initialization of transporter so we don't throw on startup if missing
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: SMTP_USER ? {
      user: SMTP_USER,
      pass: SMTP_PASS
    } : undefined
  });

  return transporter;
}

/**
 * Sends an email with the payslip attached.
 * Returns true if sent successfully, false if provider is missing, throws on error.
 */
async function sendPayslipEmail(employeeEmail, periodStart, periodEnd, pdfBuffer) {
  const mailer = getTransporter();
  
  if (!mailer) {
    logger.warn('Email provider not configured (SMTP_HOST is unset). Skipping email send.');
    return false;
  }

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || '"PeoplePay360" <noreply@peoplepay360.local>',
      to: employeeEmail,
      subject: `Payslip for ${periodStart} to ${periodEnd}`,
      text: `Dear employee,\n\nPlease find attached your payslip for the period ${periodStart} to ${periodEnd}.\n\nBest regards,\nPeoplePay360 HR`,
      attachments: [
        {
          filename: `payslip_${periodStart}_${periodEnd}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    return true;
  } catch (err) {
    logger.error({ err, employeeEmail }, 'Failed to send payslip email');
    throw err;
  }
}

module.exports = {
  sendPayslipEmail
};
