import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Indian-numbering-system amount-in-words, for the payslip's "Net Pay" line — a small detail
// that reads as real financial software rather than a generic invoice template.
export function amountInWords(amount: number): string {
  const num = Math.round(Math.abs(amount));
  if (num === 0) return 'Zero Rupees Only';
  const ones = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n > 19) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
    return ones[n];
  }

  let n = num;
  const crores = Math.floor(n / 10000000); n %= 10000000;
  const lakhs = Math.floor(n / 100000); n %= 100000;
  const thousands = Math.floor(n / 1000); n %= 1000;
  const hundreds = Math.floor(n / 100); n %= 100;
  const remainder = n;

  let result = '';
  if (crores > 0) result += `${inWords(crores)} Crore `;
  if (lakhs > 0) result += `${inWords(lakhs)} Lakh `;
  if (thousands > 0) result += `${inWords(thousands)} Thousand `;
  if (hundreds > 0) result += `${inWords(hundreds)} Hundred `;
  if (remainder > 0) {
    if (result !== '') result += 'and ';
    result += `${inWords(remainder)} `;
  }
  return `${result.trim()} Rupees Only`.replace(/\s+/g, ' ');
}
