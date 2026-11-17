import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploads = path.join(root, 'uploads');
const approved = {};
const entries = fs.existsSync(uploads) ? fs.readdirSync(uploads, {withFileTypes: true}) : [];
for (const entry of entries) {
  if (entry.name === '.gitkeep') continue;
  if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.pdf')) throw new Error('Only regular PDF files are accepted');
  const file = path.join(uploads, entry.name);
  const size = fs.statSync(file).size;
  if (size === 0 || size > 10 * 1024 * 1024) throw new Error('PDF size limit is 10 MiB');
  const bytes = fs.readFileSync(file);
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')) || !bytes.subarray(-2048).includes(Buffer.from('%%EOF'))) throw new Error('Invalid PDF signature');
  // On GitHub Actions Linux, libmagic determines MIME from file contents.
  const {execFileSync} = await import('node:child_process');
  if (process.platform === 'linux') {
    const mime = execFileSync('file', ['--brief', '--mime-type', '--', file], {encoding:'utf8'}).trim();
    if (mime !== 'application/pdf') throw new Error('Detected MIME is not application/pdf');
  } else {
    throw new Error('Non-empty uploads must be validated on Linux with libmagic before publication');
  }
  execFileSync('qpdf', ['--check', file], {stdio: 'pipe', timeout: 15000});
  const structure = execFileSync('qpdf', ['--json', file], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 15000});
  if (/\"\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction|AA|XFA|Encrypt)\"/.test(structure)) throw new Error('Active or encrypted PDF rejected');
  // Reject common active content. This is an additional check, not a malware scanner.
  const text = bytes.toString('latin1');
  if (/\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction|AA|XFA)\b/.test(text)) throw new Error('Active PDF content is rejected');
  approved['/uploads/' + entry.name] = {source: 'uploads/' + entry.name, name: randomUUID() + '.pdf'};
}
fs.writeFileSync(path.join(root, 'approved-pdfs.json'), JSON.stringify(approved, null, 2));
console.log(`Validated ${Object.keys(approved).length} PDFs. Limit 10 MiB, MIME and signature checks, random publication filenames.`);
