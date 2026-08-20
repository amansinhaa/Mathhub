export function parseCSV(text: string): { headers: string[], rows: Record<string, string | number>[], numericColumns: string[] } {
  // Detect delimiter
  const firstLine = text.split('\\n')[0];
  let delimiter = ',';
  if (firstLine.includes('\\t')) delimiter = '\\t';
  else if (firstLine.includes(';')) delimiter = ';';

  const lines = text.split('\\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  
  const rows: Record<string, string | number>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string | number> = {};
    headers.forEach((h, index) => {
      const val = values[index];
      if (!val) {
        row[h] = '';
      } else {
        const num = Number(val);
        row[h] = isNaN(num) ? val : num;
      }
    });
    rows.push(row);
  }

  const numericColumns = headers.filter(h => {
    return rows.some(r => typeof r[h] === 'number');
  });

  return { headers, rows, numericColumns };
}
