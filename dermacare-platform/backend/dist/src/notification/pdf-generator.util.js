"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrescriptionPdf = generatePrescriptionPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function generatePrescriptionPdf(prescription) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = `prescription-${prescription.id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const doc = new pdfkit_1.default({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc
        .fillColor('#0f766e')
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
    doc
        .fillColor('#0f766e')
        .fontSize(16)
        .text('Rx (Prescribed Medicines)', { underline: true })
        .moveDown();
    if (prescription.items && prescription.items.length > 0) {
        prescription.items.forEach((item, idx) => {
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
    }
    else {
        doc.fillColor('#6b7280').text('No prescription items registered.');
    }
    doc.moveDown();
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
    doc.moveDown(2);
    doc
        .fillColor('#1f2937')
        .fontSize(11)
        .text('Dr. Signature / Seal', { align: 'right' });
    doc.end();
    return filePath;
}
//# sourceMappingURL=pdf-generator.util.js.map