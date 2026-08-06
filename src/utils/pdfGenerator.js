import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (cart, subtotal, tax, total) => {
  const doc = new jsPDF();

  // Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(236, 72, 153); // Pinkish branding color
  doc.text("Inzfyer", 14, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Premium Point of Sale System", 14, 32);
  
  // Invoice Details
  const invoiceID = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  doc.text(`Invoice Number: ${invoiceID}`, 14, 45);
  doc.text(`Date: ${dateStr}`, 14, 52);

  // Table Data Preparation
  const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
  const tableRows = [];

  cart.forEach(item => {
    const itemData = [
      item.name,
      `INR ${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      item.qty.toString(),
      `INR ${(item.price * item.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ];
    tableRows.push(itemData);
  });

  // Draw Table
  doc.autoTable({
    startY: 60,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [76, 29, 149] }, // Deep Purple
    styles: { fontSize: 11, cellPadding: 4 },
  });

  // Summary logic
  const finalY = doc.lastAutoTable.finalY || 60;
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Subtotal : `, 120, finalY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(`INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 150, finalY + 15);

  doc.setFont("helvetica", "bold");
  doc.text(`Tax (8%) : `, 120, finalY + 23);
  doc.setFont("helvetica", "normal");
  doc.text(`INR ${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 150, finalY + 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(236, 72, 153);
  doc.text(`Total :`, 120, finalY + 34);
  doc.text(`INR ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 150, finalY + 34);

  // Footer Message
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for shopping at Inzfyer!", 14, finalY + 50);

  return doc;
};
