/**
 * Indian School ERP Formatting Utilities (CBSE & NEP 2020 Standard)
 */

/**
 * Format currency using Indian Numbering System (Lakhs & Crores)
 * e.g., 125000 -> ₹1,25,000
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format date to standard CBSE DD/MM/YYYY format
 * e.g., '2026-10-12' -> '12/10/2026'
 */
export function formatCBSEDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (_) {
    return dateString;
  }
}

/**
 * Format date to human friendly CBSE format
 * e.g., '2026-10-12' -> '12 Oct 2026'
 */
export function formatFriendlyDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (_) {
    return dateString;
  }
}

/**
 * Get next school working day for homework due date
 * (Tomorrow, or Monday if Friday/Saturday)
 */
export function getNextSchoolDay() {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
  if (day === 5) {
    // Friday -> Due Monday (+3 days)
    d.setDate(d.getDate() + 3);
  } else if (day === 6) {
    // Saturday -> Due Monday (+2 days)
    d.setDate(d.getDate() + 2);
  } else {
    // Due tomorrow (+1 day)
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
}
