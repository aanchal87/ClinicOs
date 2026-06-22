import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export function generatePrescriptionPdf(prescription: any): string {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `prescription-${prescription.id}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Clinic Header
  doc
    .fillColor('#0f766e') // Teal accent color
    .fontSize(22)
    .text(prescription.clinic?.name || 'ClinicOS Dermatology Centre', { align: 'center' })
    .fontSize(10)
    .fillColor('#4b5563')
    .text(prescription.clinic?.address || '', { align: 'center' })
    .text(`Phone: ${prescription.clinic?.contactNumber || ''}`, { align: 'center' })
    .moveDown();

  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown();

  // Patient & Doctor Information
  doc
    .fillColor('#1f2937')
    .fontSize(12)
    .text(`Patient Name: ${prescription.patient?.fullName || 'N/A'}`)
    .text(`Patient ID: ${prescription.patient?.patientCustomId || 'N/A'}`)
    .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`)
    .moveDown(0.5);

  doc
    .text(`Doctor: ${prescription.doctor?.fullName || 'N/A'}`)
    .text(`Qualifications: ${prescription.doctor?.qualifications || ''}`)
    .moveDown();

  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown();

  // Rx Heading
  doc
    .fillColor('#0f766e')
    .fontSize(16)
    .text('Rx (Prescribed Medicines)', { underline: true })
    .moveDown();

  // Prescription Items
  if (prescription.items && prescription.items.length > 0) {
    prescription.items.forEach((item: any, idx: number) => {
      doc
        .fillColor('#1f2937')
        .fontSize(11)
        .text(`${idx + 1}. ${item.drugName} (${item.strength || ''}) - ${item.dosageForm || 'Tablet'}`)
        .fontSize(9)
        .fillColor('#4b5563')
        .text(`   Dose: ${item.dose} | Frequency: ${item.frequency} | Duration: ${item.duration}`)
        .text(`   Instructions: ${item.instructions || 'None'}`)
        .moveDown(0.8);
    });
  } else {
    doc.fillColor('#6b7280').text('No prescription items registered.');
  }

  doc.moveDown();

  // Advice
  if (prescription.advice) {
    doc
      .fillColor('#1f2937')
      .fontSize(11)
      .text('General Advice:', { underline: true })
      .fontSize(10)
      .fillColor('#4b5563')
      .text(prescription.advice)
      .moveDown();
  }

  // Footer Signature
  doc.moveDown(2);
  doc
    .fillColor('#1f2937')
    .fontSize(11)
    .text('Dr. Signature / Seal', { align: 'right' });

  doc.end();

  return filePath;
}
