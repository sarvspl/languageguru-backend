const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function makeDocx() {
  const zip = new JSZip();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="1A3A6B"/>
        </w:rPr>
        <w:t>LANGUAGE GURU INDIA</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="26"/>
          <w:color w:val="E85D04"/>
        </w:rPr>
        <w:t>Linguist Profile &amp; Curriculum Vitae (CV)</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Applicant Name: </w:t></w:r>
      <w:r><w:t>Test Linguist</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Email ID: </w:t></w:r>
      <w:r><w:t>test@languageguru.com</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Mobile / WhatsApp: </w:t></w:r>
      <w:r><w:t>+91 98765 43210</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>City: </w:t></w:r>
      <w:r><w:t>New Delhi, India</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Language Pair: </w:t></w:r>
      <w:r><w:t>English - Hindi / Multilingual</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Specialisation: </w:t></w:r>
      <w:r><w:t>Transcription, Certified &amp; Commercial Translation</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Experience: </w:t></w:r>
      <w:r><w:t>1 – 2 Years Verified Translation Experience</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Certification: </w:t></w:r>
      <w:r><w:t>Certified English Specialist</w:t></w:r>
    </w:p>
    <w:sectPr/>
  </w:body>
</w:document>`;

  zip.file('[Content_Types].xml', contentTypes);
  zip.folder('_rels').file('.rels', rels);
  zip.folder('word').file('document.xml', docXml);
  zip.folder('word').folder('_rels').file('document.xml.rels', docRels);

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const dest = path.join(uploadsDir, 'test_linguist_resume.docx');
  fs.writeFileSync(dest, buf);
  console.log('Valid docx generated at:', dest, 'Length:', buf.length);
}

makeDocx().catch(console.error);
