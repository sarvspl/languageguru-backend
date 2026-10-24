const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('./node_modules/docx');
const fs = require('fs');
const path = require('path');

async function createAayushRanjanCv() {
  const borderThin = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
  };

  const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

  // Personal details table
  const detailsRows = [
    ["Name of Staff", "Aayush Ranjan"],
    ["Profession", "Full-Stack Developer / Software Developer"],
    ["Proposed Position", "Full-Stack Developer / Software Engineer"],
    ["Nationality", "Indian"],
    ["Years with Firm", "Since November 2025"],
    ["Location", "Kolkata, West Bengal, India"],
  ].map(([label, val]) => new TableRow({
    children: [
      new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        margins: cellMargins,
        borders: borderThin,
        children: [new Paragraph({
          children: [new TextRun({ text: label, bold: true, size: 21, font: "Calibri" })]
        })],
      }),
      new TableCell({
        width: { size: 6500, type: WidthType.DXA },
        margins: cellMargins,
        borders: borderThin,
        children: [new Paragraph({
          children: [new TextRun({ text: val, size: 21, font: "Calibri" })]
        })],
      }),
    ],
  }));

  // Education table
  const eduRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 4000, type: WidthType.DXA },
          margins: cellMargins,
          borders: borderThin,
          children: [new Paragraph({ children: [new TextRun({ text: "Institution", bold: true, size: 20, font: "Calibri" })] })],
        }),
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          margins: cellMargins,
          borders: borderThin,
          children: [new Paragraph({ children: [new TextRun({ text: "Period", bold: true, size: 20, font: "Calibri" })] })],
        }),
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          borders: borderThin,
          children: [new Paragraph({ children: [new TextRun({ text: "Degree", bold: true, size: 20, font: "Calibri" })] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 4000, type: WidthType.DXA },
          margins: cellMargins,
          borders: borderThin,
          children: [new Paragraph({ children: [new TextRun({ text: "Millennium Institute of Technology, Bhopal", size: 20, font: "Calibri" })] })],
        }),
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          margins: cellMargins,
          borders: borderThin,
          children: [new Paragraph({ children: [new TextRun({ text: "September 2022 – May 2025", size: 20, font: "Calibri" })] })],
        }),
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          borders: borderThin,
          children: [new Paragraph({ children: [new TextRun({ text: "Bachelor of Technology — Computer Science & Engineering", size: 20, font: "Calibri" })] })],
        }),
      ],
    }),
  ];

  // Employment record table
  const empRows = [
    ["Period", "November 2025 – Present"],
    ["Employer", "SAR Venture & Softwares Pvt Ltd"],
    ["Position", "Full Stack Developer"],
    ["Location", "Kolkata, India"],
    ["Activities Performed", "Develop and maintain full-stack applications using React.js, Next.js, Node.js and Express.js. Design secure RESTful APIs with JWT authentication, RBAC and validation. Manage MySQL/PostgreSQL databases, schema design, indexing, migrations and query optimization. Use Redux Toolkit and Redis for state management, caching, sessions and rate limiting. Deploy and maintain production applications on AWS (EC2, S3, CloudFront) and manage cPanel environments, domains, SSL, email services and databases."],
    ["Period", "May 2025 – November 2025"],
    ["Employer", "SAR Venture & Softwares Pvt Ltd"],
    ["Position", "Full Stack Web Developer Intern"],
    ["Location", "Kolkata, India"],
    ["Activities Performed", "Assisted in building responsive frontend user interfaces using React.js, Next.js and Tailwind CSS. Developed backend REST API endpoints using Express.js and Prisma ORM with PostgreSQL. Participated in database optimization, API testing, bug resolution, and client project deployments."],
  ].map(([label, val]) => new TableRow({
    children: [
      new TableCell({
        width: { size: 3000, type: WidthType.DXA },
        margins: cellMargins,
        borders: borderThin,
        children: [new Paragraph({
          children: [new TextRun({ text: label, bold: true, size: 20, font: "Calibri" })]
        })],
      }),
      new TableCell({
        width: { size: 6500, type: WidthType.DXA },
        margins: cellMargins,
        borders: borderThin,
        children: [new Paragraph({
          children: [new TextRun({ text: val, size: 20, font: "Calibri" })]
        })],
      }),
    ],
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 1000, right: 1000 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: "SAR VENTURE & SOFTWARES PVT LTD",
              bold: true,
              size: 16,
              color: "007acc",
              font: "Calibri"
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "CURRICULUM VITAE",
              bold: true,
              size: 32,
              font: "Calibri"
            }),
          ],
        }),
        new Table({
          rows: detailsRows,
          width: { size: 9500, type: WidthType.DXA },
        }),
        new Paragraph({
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: "1. KEY QUALIFICATIONS",
              bold: true,
              size: 22,
              color: "1e5aa0",
              font: "Calibri"
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: "Full-Stack Developer with professional experience developing and maintaining scalable web applications using React.js, Next.js, Node.js, Express.js, PostgreSQL, MySQL, Redis and AWS. Experienced in secure RESTful API development, JWT authentication, role-based access control, database design and optimization, Redux Toolkit, cloud deployment, cPanel administration, SSL configuration and responsive frontend development. Has worked on e-commerce, CMS, AI-powered portfolio, bulk email, analytics and board-management applications.",
              size: 21,
              font: "Calibri"
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 180, after: 100 },
          children: [
            new TextRun({
              text: "2. EDUCATION",
              bold: true,
              size: 22,
              color: "1e5aa0",
              font: "Calibri"
            }),
          ],
        }),
        new Table({
          rows: eduRows,
          width: { size: 9500, type: WidthType.DXA },
        }),
        new Paragraph({
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: "3. EMPLOYMENT RECORD",
              bold: true,
              size: 22,
              color: "1e5aa0",
              font: "Calibri"
            }),
          ],
        }),
        new Table({
          rows: empRows,
          width: { size: 9500, type: WidthType.DXA },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Save to target files
  fs.writeFileSync(path.join(uploadsDir, 'test_linguist_resume.docx'), buffer);
  fs.writeFileSync(path.join(uploadsDir, '1792756754464-422338936-test_linguist_resume.docx.docx'), buffer);
  fs.writeFileSync(path.join(uploadsDir, 'aayush_ranjan_cv.docx'), buffer);

  console.log('Successfully generated authentic Aayush Ranjan CV DOCX. Size:', buffer.length);
}

createAayushRanjanCv().catch(console.error);
