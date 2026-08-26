import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '../assets/logo.png';

const getBase64ImageFromUrl = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = imageUrl;
  });
};

export const generateAndDownloadInvoice = async (invoiceData, isPos = false) => {
  const { order, items } = invoiceData;
  const doc = new jsPDF();
  
  // A4 size is 210 x 297 mm
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;
  
  // 1. Header
  try {
    const logoBase64 = await getBase64ImageFromUrl(logoImg);
    doc.addImage(logoBase64, 'PNG', margin, currentY, 40, 15);
  } catch (error) {
    console.error('Failed to load logo for PDF', error);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('INZFYER', margin, currentY + 10);
  }
  
  // Determine if it's paid
  const isPaid = isPos || order.paymentStatus === 'PAID' || order.paymentStatus === 'SUCCESS';
  
  // Right side header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(isPaid ? 'TAX INVOICE' : 'ORDER SUMMARY', pageWidth - margin, currentY + 6, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('(Original for Recipient)', pageWidth - margin, currentY + 12, { align: 'right' });
  
  currentY += 25;
  
  // Business Info (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Sold By:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('INZFYER Luxury Boutique', margin, currentY + 5);
  doc.text('123 Retail Park, New Delhi, 110001, IN', margin, currentY + 10);
  doc.text('Phone: +91 98765 43210', margin, currentY + 15);
  doc.text('Email: support@inzfyer.in', margin, currentY + 20);
  doc.text('Web: www.inzfyer.in', margin, currentY + 25);
  // doc.text('GST Registration No: 07AABCU9603R1ZM', margin, currentY + 30);
  
  currentY += 40;
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  // Order & Invoice Details
  const invoiceNumber = `INV-${order.orderNumber?.split('-')[1] || order.orderNumber || order.id || 'N/A'}`;
  const dateFormatted = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Order Number:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(String(order.orderNumber || order.id || 'N/A'), margin + 30, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice Number:`, pageWidth / 2, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceNumber, (pageWidth / 2) + 30, currentY);
  
  currentY += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Order Date:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(dateFormatted, margin + 30, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice Date:`, pageWidth / 2, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(dateFormatted, (pageWidth / 2) + 30, currentY);
  
  currentY += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Status:`, margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(order.paymentStatus || 'PAID', margin + 30, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Method:`, pageWidth / 2, currentY);
  doc.setFont('helvetica', 'normal');
  let payMethod = order.gatewayPaymentId ? 'Online (Card/UPI)' : (order.paymentMethod || 'Cash on Delivery');
  if (isPos) payMethod = 'In-Store POS';
  doc.text(payMethod, (pageWidth / 2) + 30, currentY);
  
  if (isPos && order.adminId) {
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Cashier / Admin:`, margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(order.adminId, margin + 30, currentY);
  }
  
  currentY += 8;
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  // Billing and Shipping Addresses
  doc.setFont('helvetica', 'bold');
  doc.text('Billing Address:', margin, currentY);
  doc.text('Shipping Address:', pageWidth / 2, currentY);
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  
  // Safe helper to build address block
  const customerName = order.customerName || order.customer_name || 'Customer';
  const customerPhone = order.customerPhone || order.customer_phone || order.phone || '';
  const customerEmail = order.customerEmail || order.customer_email || order.email || '';
  const billingAddr = order.billingAddress || order.billing_address || order.address || order.shippingAddress || '';
  const shippingAddr = order.shippingAddress || order.shipping_address || order.address || '';
  
  const bLines = [customerName];
  if (billingAddr) bLines.push(billingAddr);
  if (order.city) bLines.push(`${order.city}, ${order.state || ''} ${order.pincode || ''}`);
  if (customerPhone) bLines.push(`Phone: ${customerPhone}`);
  if (customerEmail) bLines.push(`Email: ${customerEmail}`);
  
  const sLines = [customerName];
  if (shippingAddr) {
    if (shippingAddr === billingAddr) {
      sLines.push('Same as billing address');
    } else {
      sLines.push(shippingAddr);
      if (order.city) sLines.push(`${order.city}, ${order.state || ''} ${order.pincode || ''}`);
    }
  }
  if (customerPhone && shippingAddr !== billingAddr) sLines.push(`Phone: ${customerPhone}`);
  
  doc.text(bLines.filter(Boolean), margin, currentY);
  doc.text(sLines.filter(Boolean), pageWidth / 2, currentY);
  
  currentY += Math.max(bLines.length, sLines.length) * 5 + 8;
  
  // Table
  const tableData = items.map((item, index) => {
    const qty = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(item.unitPrice || item.price || item.unit_price || 0);
    const gstRate = item.gstRate || item.gst_rate ? Number(item.gstRate || item.gst_rate) : 18.0;
    
    // Exact DB calculations
    const basePrice = (item.basePrice || item.base_price) ? Number(item.basePrice || item.base_price) : unitPrice / (1 + gstRate / 100);
    const taxAmt = (item.taxAmount || item.tax_amount) ? Number(item.taxAmount || item.tax_amount) : (unitPrice - basePrice) * qty;
    const itemSubtotal = unitPrice * qty;
    
    let taxStr = '';
    const cgstAmt = item.cgstAmount || item.cgst_amount;
    const sgstAmt = item.sgstAmount || item.sgst_amount;
    const igstAmt = item.igstAmount || item.igst_amount;
    
    if (cgstAmt && Number(cgstAmt) > 0) {
      taxStr = `CGST: ₹${Number(cgstAmt).toFixed(2)}\nSGST: ₹${Number(sgstAmt).toFixed(2)}`;
    } else if (igstAmt && Number(igstAmt) > 0) {
      taxStr = `IGST: ₹${Number(igstAmt).toFixed(2)}`;
    } else {
      if ((order.address || order.state || '').toLowerCase().includes('delhi')) {
        taxStr = `CGST: ₹${(taxAmt/2).toFixed(2)}\nSGST: ₹${(taxAmt/2).toFixed(2)}`;
      } else {
        taxStr = `IGST: ₹${taxAmt.toFixed(2)}`;
      }
    }
    
    const desc = item.productName || item.product_name || item.name;
    const hsn = item.hsn ? `\nHSN: ${item.hsn}` : '';
    const fullDesc = `${desc}${hsn}`;
    const sku = item.sku || `INZ-${(item.productId || item.product_id || item.id || '').substring(0,6).toUpperCase()}`;
    
    if (isPaid) {
      return [
        index + 1,
        fullDesc,
        sku,
        qty,
        `₹${basePrice.toFixed(2)}`,
        `₹0.00`,
        `₹${(basePrice * qty).toFixed(2)}`,
        taxStr,
        `₹${itemSubtotal.toFixed(2)}`
      ];
    } else {
      return [
        index + 1,
        fullDesc,
        sku,
        qty,
        `₹${unitPrice.toFixed(2)}`,
        `₹${itemSubtotal.toFixed(2)}`
      ];
    }
  });
  
  const headCells = isPaid 
    ? [['Sl. No', 'Product Description', 'SKU', 'Qty', 'Unit Price\n(Base)', 'Discount', 'Taxable\nAmount', 'Tax', 'Total Amount']]
    : [['Sl. No', 'Product Description', 'SKU', 'Qty', 'Unit Price\n(Inc. GST)', 'Total Amount']];
    
  autoTable(doc, {
    startY: currentY,
    head: headCells,
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineColor: [150, 150, 150],
      lineWidth: 0.1
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle'
    },
    columnStyles: isPaid ? {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 20 },
      3: { cellWidth: 10, halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'left' },
      8: { halign: 'right', fontStyle: 'bold' }
    } : {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15, halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      // Re-calculate currentY based on table height
      currentY = data.cursor.y;
    }
  });
  
  // Totals Section
  currentY = doc.lastAutoTable.finalY + 10;
  
  const orderSubtotal = Number(order.subtotal || 0);
  const orderDiscount = Number(order.discount || 0);
  const orderShipping = Number(order.shippingCharge || order.shipping_charge || 0);
  const orderTax = Number(order.taxAmount || order.tax_amount || 0);
  const orderTotal = Number(order.finalTotal || order.final_total || order.totalAmount || order.total || 0);
  
  const sumX1 = 140;
  const sumX2 = 196;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  if (isPaid) {
    const taxableAmt = orderSubtotal - orderTax;
    
    doc.text('Item Subtotal (Base):', sumX1, currentY);
    doc.text(`₹${taxableAmt.toFixed(2)}`, sumX2, currentY, { align: 'right' });
    currentY += 6;
    
    if (orderDiscount > 0) {
      doc.text('Discount:', sumX1, currentY);
      doc.text(`-₹${orderDiscount.toFixed(2)}`, sumX2, currentY, { align: 'right' });
      currentY += 6;
    }
    
    doc.text('Taxable Amount:', sumX1, currentY);
    doc.text(`₹${(taxableAmt - orderDiscount).toFixed(2)}`, sumX2, currentY, { align: 'right' });
    currentY += 6;
    
    doc.text('Shipping:', sumX1, currentY);
    doc.text(`₹${orderShipping.toFixed(2)}`, sumX2, currentY, { align: 'right' });
    currentY += 6;
    
    doc.text('GST / Tax:', sumX1, currentY);
    doc.text(`₹${orderTax.toFixed(2)}`, sumX2, currentY, { align: 'right' });
    currentY += 8;
  } else {
    // Unpaid/Customer view
    doc.text('Subtotal (Inc. GST):', sumX1, currentY);
    doc.text(`₹${orderSubtotal.toFixed(2)}`, sumX2, currentY, { align: 'right' });
    currentY += 6;
    
    if (orderDiscount > 0) {
      doc.text('Discount:', sumX1, currentY);
      doc.text(`-₹${orderDiscount.toFixed(2)}`, sumX2, currentY, { align: 'right' });
      currentY += 6;
    }
    
    doc.text('Shipping:', sumX1, currentY);
    doc.text(`₹${orderShipping.toFixed(2)}`, sumX2, currentY, { align: 'right' });
    currentY += 8;
  }
  
  // Grand Total Box
  doc.setFillColor(240, 240, 240);
  doc.rect(sumX1 - 2, currentY - 5, (sumX2 - sumX1) + 4, 8, 'F');
  
  doc.setFontSize(10);
  doc.text('TOTAL AMOUNT:', sumX1, currentY);
  doc.text(`₹${orderTotal.toFixed(2)}`, sumX2, currentY, { align: 'right' });
  
  // Footer
  const pageHeightLimit = doc.internal.pageSize.height;
  if (currentY > pageHeightLimit - 30) {
    doc.addPage();
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('For INZFYER Luxury Boutique', pageWidth - margin, pageHeightLimit - 25, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorized Signatory', pageWidth - margin, pageHeightLimit - 15, { align: 'right' });
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for shopping with INZFYER Luxury Boutique.', pageWidth / 2, pageHeightLimit - 10, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, pageHeightLimit - 5, { align: 'center' });
  
  doc.save(`INZFYER_TAX_INVOICE_${invoiceNumber}.pdf`);
};
