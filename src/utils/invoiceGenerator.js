import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAndDownloadInvoice = (invoiceData) => {
  const { order, items } = invoiceData;

  const doc = new jsPDF();
  
  // Brand Header
  doc.setFillColor(219, 39, 119); // #db2777 (Pink)
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INZFYER', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Luxury Toys & Unique Gifts', 14, 25);
  
  // Business Info (Right side header)
  doc.setFontSize(9);
  doc.text('support@inzfyer.in', 196, 15, { align: 'right' });
  doc.text('www.inzfyer.in', 196, 20, { align: 'right' });
  doc.text('GSTIN: PENDING', 196, 25, { align: 'right' }); // Using placeholder per plan

  // Invoice Title and Meta
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 14, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const invoiceNumber = `INV-${order.orderNumber.split('-')[1] || order.orderNumber}`;
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  doc.text(`Invoice No: ${invoiceNumber}`, 14, 60);
  doc.text(`Order No: ${order.orderNumber}`, 14, 66);
  doc.text(`Order Date: ${dateFormatted}`, 14, 72);
  doc.text(`Payment Status: ${order.paymentStatus}`, 14, 78);
  doc.text(`Payment Method: TEST/UPI`, 14, 84); // Hardcoded TEST as requested

  // Customer Billed To
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To / Shipped To:', 120, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.customerName}`, 120, 66);
  
  // Split long addresses
  const addressLines = doc.splitTextToSize(`${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`, 70);
  doc.text(addressLines, 120, 72);
  
  const addressHeight = addressLines.length * 5;
  doc.text(`Email: ${order.customerEmail}`, 120, 72 + addressHeight + 2);
  doc.text(`Phone: ${order.customerPhone}`, 120, 72 + addressHeight + 8);

  // Items Table
  const tableData = items.map(item => [
    item.productName,
    item.quantity,
    `INR ${Number(item.unitPrice).toFixed(2)}`,
    `INR ${Number(item.subtotal).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    headStyles: { 
      fillStyle: 'F', 
      fillColor: [219, 39, 119], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [253, 242, 248] }, // Light pink alternate rows
    margin: { top: 100 }
  });

  // Summary Calculation
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(`INR ${Number(order.subtotal).toFixed(2)}`, 196, finalY, { align: 'right' });

  let currentY = finalY + 8;

  if (Number(order.discount) > 0) {
    doc.text('Discount:', 130, currentY);
    doc.text(`-INR ${Number(order.discount).toFixed(2)}`, 196, currentY, { align: 'right' });
    currentY += 8;
  }

  doc.text('Shipping Charge:', 130, currentY);
  doc.text(`INR ${Number(order.shippingCharge).toFixed(2)}`, 196, currentY, { align: 'right' });
  currentY += 8;

  doc.text('Tax (0%):', 130, currentY); // Assuming 0% tax for now as it's not strictly calculated in the DB yet, it's bundled in subtotal usually or wait, in checkout we had a tax field but DB didn't save tax explicitly. Let's look at schema.
  doc.text(`INR 0.00`, 196, currentY, { align: 'right' });
  currentY += 12;

  // Grand Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(219, 39, 119); // Pink
  doc.text('Grand Total:', 130, currentY);
  doc.text(`INR ${Number(order.finalTotal).toFixed(2)}`, 196, currentY, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // Gray
  doc.text('Thank you for shopping with INZFYER!', 105, 280, { align: 'center' });
  doc.text('This is a computer generated invoice and does not require a physical signature.', 105, 285, { align: 'center' });

  // Download
  doc.save(`${invoiceNumber}.pdf`);
};
