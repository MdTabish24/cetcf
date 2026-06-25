const fs = require('fs');
const path = require('path');
const docx = require('docx');

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

const mcqsDir = path.join(__dirname, '../generated/mcqs');
const wordDir = path.join(__dirname, '../generated/word_mcqs');

if (!fs.existsSync(wordDir)) {
  fs.mkdirSync(wordDir, { recursive: true });
}

const generateWordDocument = async (data, fileName) => {
  const children = [
    new Paragraph({
      text: data.course_name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Sector: ${data.sector}`, bold: true }),
        new TextRun({ text: ` | Level: ${data.level}` }),
        new TextRun({ text: ` | Duration: ${data.duration}` }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  if (data.questions && Array.isArray(data.questions)) {
    let currentModule = -1;

    data.questions.forEach((q, index) => {
      // Add module heading if it changes
      if (q.module !== currentModule) {
        currentModule = q.module;
        let moduleTitle = `Module ${currentModule}`;
        if (data.modules) {
          const modInfo = data.modules.find(m => m.module_number === currentModule);
          if (modInfo) moduleTitle += `: ${modInfo.module_title}`;
        }
        
        children.push(
          new Paragraph({
            text: moduleTitle,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
      }

      // Question text
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Q${index + 1}. `, bold: true }),
            new TextRun({ text: q.question, bold: true }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      // Options
      if (q.options) {
        Object.entries(q.options).forEach(([key, value]) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${key}) ` }),
                new TextRun({ text: String(value) }),
              ],
              indent: { left: 720 },
            })
          );
        });
      }

      // Answer and Explanation
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Correct Answer: ${q.correct}`, bold: true, color: "008000" }),
          ],
          indent: { left: 720 },
          spacing: { before: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Explanation: `, bold: true }),
            new TextRun({ text: q.explanation }),
          ],
          indent: { left: 720 },
          spacing: { after: 200 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(wordDir, fileName), buffer);
};

const convertFiles = async () => {
  let count = 0;
  if (!fs.existsSync(mcqsDir)) {
    console.log("MCQs directory not found.");
    return;
  }
  
  const files = fs.readdirSync(mcqsDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const jsonContent = fs.readFileSync(path.join(mcqsDir, file), 'utf8');
      try {
        const data = JSON.parse(jsonContent);
        const wordFileName = file.replace('.json', '.docx');
        await generateWordDocument(data, wordFileName);
        count++;
        console.log(`✅ Converted ${file} to Word`);
      } catch (e) {
        console.error(`❌ Error parsing ${file}:`, e.message);
      }
    }
  }
  console.log(`\n🎉 Successfully converted ${count} MCQ files to Word Documents!`);
};

convertFiles();
