const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.controller.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const controllers = getFiles(path.join(__dirname, 'src', 'modules'));

for (const file of controllers) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already secured explicitly or if it's the health controller
  if (content.includes('JwtAuthGuard') || file.includes('health.controller.ts') || file.includes('auth.controller.ts')) {
    continue;
  }

  // 1. Ensure UseGuards is imported
  if (!content.includes('UseGuards')) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+'@nestjs\/common';/, (match, p1) => {
      // Avoid duplicate 'UseGuards'
      if (p1.includes('UseGuards')) return match;
      return `import { UseGuards, ${p1.trim()} } from '@nestjs/common';`;
    });
    // Fallback if no @nestjs/common import exists
    if (!content.includes('UseGuards')) {
      content = `import { UseGuards } from '@nestjs/common';\n` + content;
    }
  }

  // 2. Calculate relative path to guards
  // e.g., file = .../src/modules/admin/cost-rules/admin-cost-rules.controller.ts
  const relativeFromSrc = path.relative(path.join(__dirname, 'src'), file);
  const depth = relativeFromSrc.split('/').length - 1; 
  const prefix = Array(depth).fill('..').join('/') || '.';

  const guardImports = `
import { JwtAuthGuard } from '${prefix}/common/guards/jwt-auth.guard';
import { TenantGuard } from '${prefix}/common/guards/tenant.guard';
import { RolesGuard } from '${prefix}/common/guards/roles.guard';
`;

  // Insert imports below the last import statement
  const importMatches = [...content.matchAll(/^import .*$/gm)];
  if (importMatches.length > 0) {
    const lastImport = importMatches[importMatches.length - 1];
    const insertPos = lastImport.index + lastImport[0].length;
    content = content.slice(0, insertPos) + guardImports + content.slice(insertPos);
  } else {
    content = guardImports + content;
  }

  // 3. Inject @UseGuards
  content = content.replace(/@Controller\(([\s\S]*?)\)/g, `@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)\n@Controller($1)`);

  fs.writeFileSync(file, content);
}

console.log('Successfully injected explicit guards into ' + controllers.length + ' controllers.');
