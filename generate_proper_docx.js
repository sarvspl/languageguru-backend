const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

async function createProfessionalResume() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "LANGUAGE GURU INDIA",
              bold: true,
              size: 36,
              color: "1A3A6B",
              font: "Arial"
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "Certified Translator & Interpreter Profile",
              italics: true,
              size: 24,
              color: "E85D04",
              font: "Arial"
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({ text: "Candidate Details", bold: true, size: 24, color: "1A3A6B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Full Name: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "Test Linguist", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Email Address: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "test@languageguru.com", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Mobile / WhatsApp: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "+91 98765 43210", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Location / City: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "New Delhi, India", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Source Language: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "English", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Target Language: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "Hindi / German", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Domain Expertise: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "Certified Legal & Commercial Documents", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Experience: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "2-5 Years", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: "Professional Summary & Bio", bold: true, size: 24, color: "1A3A6B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "Experienced linguist specializing in certified translations, notarized document processing, and embassy submissions. Native-level proficiency with acute attention to terminology accuracy and formatting fidelity.",
              size: 22,
              font: "Arial"
            }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const destPath = path.join(uploadsDir, 'test_linguist_resume.docx');
  fs.writeFileSync(destPath, buffer);
  console.log('Successfully generated valid DOCX via docx library at:', destPath, 'Size:', buffer.length);
}

createProfessionalResume().catch(console.error);
