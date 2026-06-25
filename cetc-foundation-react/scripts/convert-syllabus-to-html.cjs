const fs = require('fs');
const path = require('path');

const booksDir = path.join(__dirname, '../generated/books');
const htmlDir = path.join(__dirname, '../generated/html_books');

if (!fs.existsSync(htmlDir)) {
  fs.mkdirSync(htmlDir, { recursive: true });
}

const generateHTML = (data) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.course_name} - Syllabus</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #2980b9;
            margin-top: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        h3 {
            color: #34495e;
        }
        .meta-info {
            display: flex;
            justify-content: space-between;
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .module {
            background-color: #fdfdfd;
            border: 1px solid #e1e8ed;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .career-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .career-card {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .assessment-box {
            background-color: #e8f4f8;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${data.course_name}</h1>
        
        <div class="meta-info">
            <span>📚 Sector: ${data.sector}</span>
            <span>🎓 Level: ${data.level}</span>
            <span>⏱️ Duration: ${data.duration} (${data.total_weeks} Weeks / ${data.total_hours} Hours)</span>
        </div>

        <h2>Course Overview</h2>
        <p>${data.hero_description}</p>
        <p>${data.overview_description}</p>

        <h2>Eligibility Requirements</h2>
        <ul>
            ${data.eligibility ? data.eligibility.map(item => `<li>${item}</li>`).join('') : '<li>N/A</li>'}
        </ul>

        <h2>Modules</h2>
        ${data.modules ? data.modules.map(module => `
            <div class="module">
                <h3>Module ${module.number}: ${module.title}</h3>
                <p><strong>${module.week_range}</strong> | <strong>${module.hours} Hours</strong></p>
                <ul>
                    ${module.topics ? module.topics.map(topic => `<li>${topic}</li>`).join('') : ''}
                </ul>
            </div>
        `).join('') : ''}

        <h2>Assessment & Certification</h2>
        <div class="assessment-box">
            <p><strong>Total Marks:</strong> ${data.assessment ? data.assessment.total_marks : ''} (Pass Percentage: ${data.assessment ? data.assessment.pass_percentage : ''}%)</p>
            <p><strong>Theory (${data.assessment ? data.assessment.theory_marks : ''} Marks):</strong> ${data.assessment ? data.assessment.theory_format : ''} - ${data.assessment ? data.assessment.theory_duration : ''}</p>
            <p><strong>Practical (${data.assessment ? data.assessment.practical_marks : ''} Marks):</strong> ${data.assessment ? data.assessment.practical_format : ''}</p>
            
            ${data.assessment && data.assessment.practical_items ? `
                <h4>Practical Tasks:</h4>
                <ul>
                    ${data.assessment.practical_items.map(item => `<li><strong>${item.title} (${item.marks} Marks):</strong> ${item.description}</li>`).join('')}
                </ul>
            ` : ''}
        </div>

        <h2>Learning Outcomes</h2>
        <ul>
            ${data.learning_outcomes ? data.learning_outcomes.map(item => `<li>${item}</li>`).join('') : ''}
        </ul>

        <h2>Career Opportunities</h2>
        <div class="career-grid">
            ${data.career_paths ? data.career_paths.map(path => `
                <div class="career-card">
                    <div class="icon">${path.icon || '💼'}</div>
                    <h4>${path.title}</h4>
                    <p>${path.type}</p>
                    <p><strong>${path.salary}</strong></p>
                </div>
            `).join('') : ''}
        </div>
        
        <p style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 0.9em;">
            © ${new Date().getFullYear()} CETC Foundation. All rights reserved.
        </p>
    </div>
</body>
</html>`;
};

const convertFiles = () => {
  let count = 0;
  if (!fs.existsSync(booksDir)) {
    console.log("Books directory not found.");
    return;
  }
  
  const files = fs.readdirSync(booksDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const jsonContent = fs.readFileSync(path.join(booksDir, file), 'utf8');
      try {
        const data = JSON.parse(jsonContent);
        const htmlContent = generateHTML(data);
        const htmlFileName = file.replace('.json', '.html');
        fs.writeFileSync(path.join(htmlDir, htmlFileName), htmlContent);
        count++;
        console.log(`✅ Converted ${file} to HTML`);
      } catch (e) {
        console.error(`❌ Error parsing ${file}:`, e.message);
      }
    }
  });
  console.log(`\n🎉 Successfully converted ${count} syllabus books to HTML!`);
};

convertFiles();
