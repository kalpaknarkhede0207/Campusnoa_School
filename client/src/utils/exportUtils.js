/**
 * Universal CSV & Excel Export Utility for CampusNoa ERP
 * Generates standards-compliant CSV with UTF-8 BOM for Microsoft Excel & Google Sheets compatibility.
 */

export function exportToCSV(filename, rows, headers = null) {
  if (!rows || rows.length === 0) {
    throw new Error('No data available to export');
  }

  // Determine headers
  const headerKeys = headers 
    ? (Array.isArray(headers) ? headers.map(h => (typeof h === 'string' ? h : h.key)) : Object.keys(headers))
    : Object.keys(rows[0]);

  const headerLabels = headers && Array.isArray(headers) && typeof headers[0] === 'object'
    ? headers.map(h => h.label || h.key)
    : headerKeys;

  // Format CSV line with escaping
  const formatCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvRows = [];
  
  // Header row
  csvRows.push(headerLabels.map(formatCell).join(','));

  // Data rows
  for (const row of rows) {
    const rowValues = headerKeys.map(key => {
      // Support nested paths like 'student.name'
      if (key.includes('.')) {
        const parts = key.split('.');
        let curr = row;
        for (const p of parts) {
          curr = curr?.[p];
        }
        return formatCell(curr);
      }
      return formatCell(row[key]);
    });
    csvRows.push(rowValues.join(','));
  }

  // UTF-8 BOM + CSV Content
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
