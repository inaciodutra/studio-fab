export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF';
  const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${(v ?? '').replace(/"/g, '""')}"`).join(';'))].join('\n');
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
