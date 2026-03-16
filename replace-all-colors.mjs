import fs from 'fs';
import path from 'path';

const files = [
    'src/components/jobs/filter-sidebar.tsx',
    'src/components/jobs/apply/ResumeUpload.tsx',
    'src/components/jobs/apply/FooterActions.tsx',
    'src/components/footer-benefits.tsx',
    'src/components/dashboard/public-profile-card.tsx',
    'src/app/manage/tickets/[id]/page.tsx',
    'src/app/manage/jobs/new/page.tsx',
    'src/app/freelancers/[id]/page.tsx',
    'src/app/dashboard/applicants/status-dropdown.tsx',
    'src/app/companies/[id]/page.tsx',
    'src/app/dashboard/applicants/[id]/page.tsx'
];

let replacedCount = 0;

files.forEach(f => {
    try {
        const fullPath = path.resolve(process.cwd(), f);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;

            content = content.replace(/blue-900/g, 'blue-600');
            content = content.replace(/blue-950/g, 'blue-700');
            content = content.replace(/#0B4060/g, '#2563eb');
            content = content.replace(/#12649A/g, '#3b82f6');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                replacedCount++;
            }
        }
    } catch (e) {
        console.error(`Error processing ${f}:`, e);
    }
});

console.log(`Colors successfully replaced in ${replacedCount} files to match global brand palette.`);
