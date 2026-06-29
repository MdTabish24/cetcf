const fs = require('fs');
const path = 'c:/Users/Mohammad Tabish/Documents/Shared from ubuntu/CETCF website/cetc-foundation-react/src/style.css';
const appendText = `\n/* Dark Theme Text Overrides */
.course-card-title { color: var(--text-main) !important; }
.course-fee { color: var(--text-main) !important; }
.course-fee small { color: var(--text-muted) !important; }
.course-card-sector { color: var(--gold2) !important; }
.nav-links a { color: var(--text-main) !important; }
.nav-links a:hover, .nav-links a.active { color: var(--gold) !important; }
`;
fs.appendFileSync(path, appendText, 'utf8');
console.log('Appended dark theme overrides to style.css');
