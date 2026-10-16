import type { ConsentInput, ConsentScope } from '@/services/whatsapp-consent.service';

export interface ConsentCsvPreview {
  records: ConsentInput[];
  errors: string[];
}

export function parseConsentCsv(csv: string): ConsentCsvPreview {
  if (new TextEncoder().encode(csv).byteLength > 1_000_000)
    return { records: [], errors: ['CSV must be no larger than 1 MB'] };

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let closedQuote = false;
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (quoted) {
      if (char === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
        closedQuote = true;
      } else field += char;
    } else if (closedQuote && char !== ',' && char !== '\n' && char !== '\r')
      return { records: [], errors: ['CSV contains data after a quoted field'] };
    else if (char === '"' && field.length === 0) quoted = true;
    else if (char === '"') return { records: [], errors: ['CSV contains an unexpected quote'] };
    else if (char === ',') {
      row.push(field);
      field = '';
      closedQuote = false;
    } else if (char === '\n' || char === '\r') {
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
      closedQuote = false;
      if (char === '\r' && csv[index + 1] === '\n') index += 1;
    } else field += char;
  }
  if (quoted) return { records: [], errors: ['CSV has an unterminated quoted field'] };
  if (field.length || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  if (rows.length < 2)
    return { records: [], errors: ['CSV must include a header and at least one record'] };

  const headers = rows[0].map((value, index) =>
    (index === 0 ? value.replace(/^\uFEFF/, '') : value).trim().toLowerCase(),
  );
  if (new Set(headers).size !== headers.length)
    return { records: [], errors: ['CSV contains duplicate column names'] };
  const column = (name: string) => headers.indexOf(name);
  const required = ['phone', 'status', 'scope', 'source', 'evidence'];
  const missing = required.filter((name) => column(name) < 0);
  if (missing.length) return { records: [], errors: [`Missing columns: ${missing.join(', ')}`] };
  if (rows.length - 1 > 500) return { records: [], errors: ['Import is limited to 500 records'] };

  const errors: string[] = [];
  const records: ConsentInput[] = [];
  const phones = new Set<string>();
  const scopes: ConsentScope[] = ['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'];
  rows.slice(1).forEach((values, index) => {
    const line = index + 2;
    if (values.length !== headers.length) {
      errors.push(`Row ${line}: expected ${headers.length} columns, found ${values.length}`);
      return;
    }
    const get = (name: string) => values[column(name)]?.trim() ?? '';
    const phone = get('phone');
    const normalizedPhone = phone.replace(/\D/g, '');
    const status = get('status').toUpperCase();
    const rawScope = get('scope').toUpperCase();
    const source = get('source');
    const evidence = get('evidence');
    if (!/^\+?[1-9][\d\s().-]{7,25}$/.test(phone) || !/^[1-9]\d{7,14}$/.test(normalizedPhone)) {
      errors.push(`Row ${line}: use a valid international phone number`);
      return;
    }
    if (status !== 'OPTED_IN' && status !== 'OPTED_OUT') {
      errors.push(`Row ${line}: consent status must be OPTED_IN or OPTED_OUT`);
      return;
    }
    if (!scopes.includes(rawScope as ConsentScope)) {
      errors.push(`Row ${line}: scope must be ALL, MARKETING, UTILITY, or AUTHENTICATION`);
      return;
    }
    if (source.length < 3 || source.length > 200) {
      errors.push(`Row ${line}: source must contain 3–200 characters`);
      return;
    }
    if (evidence.length > 4000) {
      errors.push(`Row ${line}: evidence must be no longer than 4,000 characters`);
      return;
    }
    if (status === 'OPTED_IN' && !evidence) {
      errors.push(`Row ${line}: opted-in records require evidence`);
      return;
    }
    if (phones.has(normalizedPhone)) {
      errors.push(`Row ${line}: duplicate phone number; resolve duplicates before import`);
      return;
    }
    phones.add(normalizedPhone);
    records.push({
      phone,
      status,
      scope: status === 'OPTED_OUT' ? 'ALL' : (rawScope as ConsentScope),
      source,
      evidence,
    });
  });
  return { records, errors };
}
