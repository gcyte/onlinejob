import fs from 'fs';
import path from 'path';

const files = [
    'src/components/manage/find-talent/CandidateCard.tsx',
    'src/components/manage/find-talent/SidebarFilters.tsx',
    'src/components/manage/find-talent/FindTalentClient.tsx'
];

files.forEach(f => {
    const fullPath = path.resolve(process.cwd(), f);
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/blue-900/g, 'blue-600');
    content = content.replace(/blue-950/g, 'blue-700');
    content = content.replace(/#0B4060/g, '#2563eb');
    content = content.replace(/#12649A/g, '#3b82f6');
    fs.writeFileSync(fullPath, content);
});

console.log('Colors successfully replaced to match global brand palette.');
