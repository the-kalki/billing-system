import { InvoiceItem, UnitType } from "@/types/billing";

export interface ItemCalculationInput {
  unitPrice: number;
  quantity: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  gstRate: number;
  isInterState?: boolean;
}

export function calculateItemAmounts(input: ItemCalculationInput) {
  const { unitPrice, quantity, discountType, discountValue, gstRate, isInterState = false } = input;
  
  const baseGross = Math.round(unitPrice * quantity * 100) / 100;
  
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((baseGross * (discountValue / 100)) * 100) / 100;
  } else {
    discountAmount = Math.min(discountValue, baseGross);
  }
  
  const taxableAmount = Math.max(0, Math.round((baseGross - discountAmount) * 100) / 100);
  const totalTax = Math.round(((taxableAmount * gstRate) / 100) * 100) / 100;
  
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  if (isInterState) {
    igstAmount = totalTax;
  } else {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  }
  
  const totalAmount = Math.round((taxableAmount + totalTax) * 100) / 100;
  
  return {
    baseGross,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    totalAmount,
  };
}

export function calculateInvoiceTotals(items: InvoiceItem[]) {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let totalTax = 0;
  
  for (const item of items) {
    subtotal += (item.unitPrice * item.quantity);
    totalDiscount += item.discountAmount;
    taxableAmount += item.taxableAmount;
    cgstTotal += item.cgstAmount;
    sgstTotal += item.sgstAmount;
    igstTotal += item.igstAmount;
    totalTax += item.totalTax;
  }
  
  subtotal = Math.round(subtotal * 100) / 100;
  totalDiscount = Math.round(totalDiscount * 100) / 100;
  taxableAmount = Math.round(taxableAmount * 100) / 100;
  cgstTotal = Math.round(cgstTotal * 100) / 100;
  sgstTotal = Math.round(sgstTotal * 100) / 100;
  igstTotal = Math.round(igstTotal * 100) / 100;
  totalTax = Math.round(totalTax * 100) / 100;
  
  const rawTotal = taxableAmount + totalTax;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;
  
  return {
    subtotal,
    totalDiscount,
    taxableAmount,
    cgstTotal,
    sgstTotal,
    igstTotal,
    totalTax,
    roundOff,
    grandTotal,
  };
}

// Indian Rupee Number to Words conversion (e.g. 1540 -> "One Thousand Five Hundred Forty Rupees Only")
export function numberToWordsRupees(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];
  
  function convertLessThanThousand(n: number): string {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }
  
  const integerPart = Math.floor(Math.abs(num));
  let remaining = integerPart;
  
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundredAndLess = remaining;
  
  let result = "";
  if (crore > 0) result += convertLessThanThousand(crore) + " Crore ";
  if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertLessThanThousand(thousand) + " Thousand ";
  if (hundredAndLess > 0) result += convertLessThanThousand(hundredAndLess) + " ";
  
  return (result.trim() + " Rupees Only").replace(/\s+/g, ' ');
}
