import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAndDownloadInvoice = (invoiceData) => {
  const { order, items } = invoiceData;
  const doc = new jsPDF();
  
  // ==========================================
  // INVOICE HEADER
  // ==========================================
  
  // Left side: Logo & Business Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(31, 41, 55); // Dark Gray
  doc.text('INZFYER', 14, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99); // Medium Gray
  doc.text('Luxury Toys & Unique Gifts', 14, 25);
  doc.text('123 Retail Park, New Delhi, India 110001', 14, 30);
  doc.text('Phone: +91 98765 43210', 14, 35);
  doc.text('Email: support@inzfyer.in | Web: www.inzfyer.in', 14, 40);
  // doc.text('GSTIN: 07AABCU9603R1ZM', 14, 45); // Un-comment when GSTIN is configured
  
  // Right side: TAX INVOICE & Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text('TAX INVOICE', 196, 20, { align: 'right' });
  
  const invoiceNumber = `INV-${order.orderNumber.split('-')[1] || order.orderNumber}`;
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoiceNumber}`, 196, 28, { align: 'right' });
  doc.text(`Invoice Date: ${dateFormatted}`, 196, 33, { align: 'right' });
  doc.text(`Order ID: ${order.orderNumber}`, 196, 38, { align: 'right' });
  doc.text(`Payment Status: ${order.paymentStatus || 'PAID'}`, 196, 43, { align: 'right' });
  doc.text(`Payment Method: ${order.gatewayPaymentId ? 'Online' : 'Card / UPI'}`, 196, 48, { align: 'right' });
  
  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 52, 196, 52);
  
  // ==========================================
  // CUSTOMER / SHIPPING SECTION
  // ==========================================
  
  doc.setFontSize(10);
  
  // BILL TO
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('BILL TO:', 14, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || 'N/A', 14, 66);
  
  let billY = 72;
  if (order.address || order.shippingAddress) {
    const addressText = order.address || `${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`;
    const addressLines = doc.splitTextToSize(addressText, 80);
    doc.text(addressLines, 14, billY);
    billY += (addressLines.length * 5);
  }
  
  if (order.phone || order.customerPhone) {
    doc.text(`Phone: ${order.phone || order.customerPhone}`, 14, billY);
    billY += 6;
  }
  if (order.email || order.customerEmail) {
    doc.text(`Email: ${order.email || order.customerEmail}`, 14, billY);
  }
  
  // SHIP TO
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO:', 110, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || 'N/A', 110, 66);
  
  let shipY = 72;
  if (order.address || order.shippingAddress) {
    const addressText = order.address || `${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}`;
    const addressLines = doc.splitTextToSize(addressText, 80);
    doc.text(addressLines, 110, shipY);
    shipY += (addressLines.length * 5);
  }
  
  if (order.phone || order.customerPhone) {
    doc.text(`Phone: ${order.phone || order.customerPhone}`, 110, shipY);
    shipY += 6;
  }
  if (order.email || order.customerEmail) {
    doc.text(`Email: ${order.email || order.customerEmail}`, 110, shipY);
  }
  
  // ==========================================
  // ITEM TABLE
  // ==========================================
  
  const startY = Math.max(billY, shipY) + 12;
  
  const tableData = items.map((item, index) => {
    // Determine tax properties depending on if they came from backend
    const unitPrice = Number(item.unitPrice || 0);
    const qty = Number(item.quantity || item.qty || 1);
    const itemSubtotal = unitPrice * qty;
    const gstRate = item.gstRate ? Number(item.gstRate) : 18.0;
    const taxAmt = item.taxAmount ? Number(item.taxAmount) : (itemSubtotal * (gstRate / 100));
    const totalAmt = itemSubtotal + taxAmt;
    
    return [
      index + 1,
      item.productName || item.name,
      item.sku || `INZ-${(item.productId || item.id || '').substring(0,6).toUpperCase()}`,
      qty,
      `₹${unitPrice.toFixed(2)}`,
      `${gstRate.toFixed(2)}%`,
      `₹${taxAmt.toFixed(2)}`,
      `₹${totalAmt.toFixed(2)}`
    ];
  });
  
  autoTable(doc, {
    startY: startY,
    head: [['S.No', 'Product Description', 'SKU', 'Qty', 'Unit Price', 'Tax %', 'Tax Amount', 'Total Amount']],
    body: tableData,
    headStyles: { 
      fillColor: [243, 244, 246], // Light Gray
      textColor: [55, 65, 81],    // Dark Gray
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [229, 231, 235]
    },
    bodyStyles: {
      textColor: [75, 85, 99],
      lineWidth: 0.1,
      lineColor: [229, 231, 235]
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 12, halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'center' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
  });
  
  // ==========================================
  // FOOTER / SUMMARY
  // ==========================================
  
  let finalY = doc.lastAutoTable.finalY + 12;
  
  // Summary block aligned right
  const summaryX1 = 145; // Label column
  const summaryX2 = 196; // Amount column
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  
  doc.text('Subtotal:', summaryX1, finalY);
  doc.text(`₹${Number(order.subtotal || 0).toFixed(2)}`, summaryX2, finalY, { align: 'right' });
  finalY += 7;
  
  if (Number(order.discount) > 0) {
    doc.text('Total Discount:', summaryX1, finalY);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`- ₹${Number(order.discount).toFixed(2)}`, summaryX2, finalY, { align: 'right' });
    doc.setTextColor(55, 65, 81);
    finalY += 7;
  }
  
  doc.text('Shipping Charges:', summaryX1, finalY);
  doc.text(`₹${Number(order.shippingCharge || 0).toFixed(2)}`, summaryX2, finalY, { align: 'right' });
  finalY += 7;
  
  doc.text('Total Tax:', summaryX1, finalY);
  doc.text(`₹${Number(order.taxAmount || 0).toFixed(2)}`, summaryX2, finalY, { align: 'right' });
  finalY += 7;
  
  // Grand Total Line
  doc.setDrawColor(229, 231, 235);
  doc.line(summaryX1, finalY - 4, summaryX2, finalY - 4);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('Grand Total:', summaryX1, finalY + 2);
  doc.text(`₹${Number(order.finalTotal || order.totalAmount || 0).toFixed(2)}`, summaryX2, finalY + 2, { align: 'right' });
  
  // Authorized Signatory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text('For INZFYER', 196, finalY + 25, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorized Signatory', 196, finalY + 40, { align: 'right' });
  
  // Professional concluding note at bottom center
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // Light Gray
  doc.text('Thank you for shopping with INZFYER. This is a computer generated invoice and does not require a physical signature.', 105, 285, { align: 'center' });
  
  // Download
  doc.save(`INZFYER_Tax_Invoice_${invoiceNumber}.pdf`);
};
