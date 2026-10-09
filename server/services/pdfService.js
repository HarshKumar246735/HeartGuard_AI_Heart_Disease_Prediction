const PDFDocument = require('pdfkit');
const { CHEST_PAIN_LABELS } = require('../utils/insights');

const DISCLAIMER =
  'HeartGuard AI provides an educational risk estimate based on the information provided. It is not a medical diagnosis and should not replace professional medical advice.';
const COLORS = { ink: '#10242B', teal: '#0E6B6B', muted: '#5B6B73', line: '#D9E3E2', Low: '#2F855A', Moderate: '#B7791F', Higher: '#C0392B' };
const LABEL = { Low: 'Lower Estimated Risk', Moderate: 'Moderate Estimated Risk', Higher: 'Higher Estimated Risk' };
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '-');

function buildRows(a) {
  const rows = [
    ['Age', `${a.age} years`],
    ['Gender', cap(a.gender)],
    ['Resting blood pressure', `${a.bloodPressure} mmHg`],
    ['Total cholesterol', `${a.cholesterol} mg/dL`],
    ['Fasting blood sugar', `${a.bloodSugar} mg/dL`],
    ['Maximum heart rate', `${a.heartRate} bpm`],
    ['Chest pain type', CHEST_PAIN_LABELS[a.chestPainType]],
    ['Exercise-induced angina', a.exerciseAngina ? 'Yes' : 'No'],
  ];
  const profile = [];
  if (a.bmi) profile.push(['BMI', String(a.bmi)]);
  if (a.smoking) profile.push(['Smoking', cap(a.smoking)]);
  if (a.alcohol) profile.push(['Alcohol', cap(a.alcohol)]);
  if (a.physicalActivity) profile.push(['Physical activity', cap(a.physicalActivity)]);
  return { rows, profile };
}

/** Streams a PDF report for one assessment into `res`. */
function streamReport(res, { assessment, user }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'HeartGuard AI Assessment Report', Author: 'HeartGuard AI' } });
  doc.pipe(res);
  const W = doc.page.width - 100;
  const level = assessment.prediction;

  // Header
  doc.rect(0, 0, doc.page.width, 78).fill(COLORS.ink);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text('HeartGuard AI', 50, 28);
  doc.font('Helvetica').fontSize(10).fillColor('#BFD3D1').text('Educational heart-risk assessment report', 50, 52);
  doc.fillColor(COLORS.ink);

  doc.y = 100;
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted);
  doc.text(`Prepared for: ${user.name}`, 50, 100);
  doc.text(`Assessment date: ${new Date(assessment.createdAt).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}`, 50, 114);
  doc.text(`Reference: ${assessment._id}`, 50, 128);

  // Result box
  const top = 156;
  doc.roundedRect(50, top, W, 84, 8).lineWidth(1).strokeColor(COLORS.line).stroke();
  doc.rect(50, top, 6, 84).fill(COLORS[level]);
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text('YOUR HEART RISK ESTIMATE', 72, top + 14);
  doc.fillColor(COLORS[level]).font('Helvetica-Bold').fontSize(20).text(LABEL[level], 72, top + 32);
  doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(30).text(`${Math.round(assessment.probability * 100)}%`, 50, top + 24, { width: W - 24, align: 'right' });
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text('model probability', 50, top + 60, { width: W - 24, align: 'right' });

  const section = (title) => {
    if (doc.y > 700) doc.addPage();
    doc.moveDown(1.2);
    doc.fillColor(COLORS.teal).font('Helvetica-Bold').fontSize(12).text(title, 50);
    doc.moveTo(50, doc.y + 2).lineTo(50 + W, doc.y + 2).strokeColor(COLORS.line).stroke();
    doc.moveDown(0.6);
  };
  const table = (rows) => {
    rows.forEach(([k, v]) => {
      if (doc.y > 760) doc.addPage();
      const y = doc.y;
      doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text(k, 50, y, { width: 220 });
      doc.fillColor(COLORS.ink).font('Helvetica-Bold').text(v, 280, y, { width: W - 230 });
      doc.moveDown(0.3);
    });
  };

  doc.y = top + 100;
  const { rows, profile } = buildRows(assessment);
  section('Input values used by the model');
  table(rows);
  if (profile.length) {
    section('Additional profile information (not used in the estimate)');
    table(profile);
  }

  section('Factors to consider');
  (assessment.factors || []).forEach((f) => {
    if (doc.y > 740) doc.addPage();
    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10).text(f.title, 50);
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text(f.text, 50, doc.y, { width: W });
    doc.moveDown(0.5);
  });

  section('General health insights');
  (assessment.insights || []).forEach((t) => {
    if (doc.y > 760) doc.addPage();
    doc.fillColor(COLORS.ink).font('Helvetica').fontSize(10).text(`•  ${t}`, 56, doc.y, { width: W - 6 });
    doc.moveDown(0.3);
  });

  if (doc.y > 690) doc.addPage();
  doc.moveDown(1.2);
  const boxY = doc.y;
  doc.roundedRect(50, boxY, W, 62, 6).fill('#EEF5F4');
  doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(9).text('Medical disclaimer', 62, boxY + 10);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted).text(DISCLAIMER, 62, boxY + 24, { width: W - 24 });

  doc.end();
}

module.exports = { streamReport };
