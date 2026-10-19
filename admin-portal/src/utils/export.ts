/**
 * Export data to CSV with UTF-8 BOM so Lao (ພາສາລາວ) & international characters
 * open flawlessly in Microsoft Excel, Google Sheets, and Apple Numbers.
 */
export function exportToCsv(
  filename: string,
  rows: Record<string, any>[],
  columns?: { key: string; header: string }[]
) {
  if (!rows || !rows.length) {
    alert('No data to export.');
    return;
  }

  const effectiveCols =
    columns ||
    Object.keys(rows[0]).map((key) => ({
      key,
      header: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
    }));

  const headersLine = effectiveCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');

  const dataLines = rows.map((row) =>
    effectiveCols
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') {
          if (val instanceof Date) {
            val = val.toISOString();
          } else {
            val = JSON.stringify(val);
          }
        }
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headersLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
