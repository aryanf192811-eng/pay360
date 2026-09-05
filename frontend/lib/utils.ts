import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function amountInWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    let str = "";
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str.trim();
  }

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const hundreds = Math.floor(num / 100);
  num %= 100;
  const remainder = Math.floor(num);

  let result = "";
  if (crores > 0) result += inWords(crores) + " Crore ";
  if (lakhs > 0) result += inWords(lakhs) + " Lakh ";
  if (thousands > 0) result += inWords(thousands) + " Thousand ";
  if (hundreds > 0) result += inWords(hundreds) + " Hundred ";
  if (remainder > 0) {
    if (result !== "") result += "and ";
    result += inWords(remainder) + " ";
  }

  return (result.trim() + " Rupees Only").replace(/\s+/g, ' ');
}
