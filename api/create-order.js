import axios from 'axios';
import { z } from 'zod';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { inArray, eq, and, gte, sql } from 'drizzle-orm';
import { enqueueNotification } from './_utils/notifications.js';
import { getShipping } from '../src/utils/shipping.js';

// Zod schema for input validation
const orderSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  subtotal: z.number().min(0, "Invalid subtotal"),
  items: z.array(z.object({
    id: z.string().uuid(),
    qty: z.number().int().positive()
  })).min(1, "Cart is empty"),
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
  customerDetails: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email("Valid email is required"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    address1: z.string().min(5),
    address2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),
  })
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Validate Request Payload
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.errors });
    }
    const { items, customerDetails, idempotencyKey } = parsed.data;

    const db = getDb();

    // Check for idempotency to prevent duplicate orders
    const existingOrder = await db.select().from(schema.orders).where(eq(schema.orders.idempotencyKey, idempotencyKey)).limit(1);
    if (existingOrder.length > 0) {
      return res.status(200).json({
        success: true,
        orderData: {
          orderId: existingOrder[0].orderNumber,
          totalAmount: Number(existingOrder[0].totalAmount),
          customerName: existingOrder[0].customerName,
          email: existingOrder[0].email,
          items: items
        },
        message: 'Order already created'
      });
    }

    // 2. Fetch True Prices from DB (Never trust frontend price)
    const productIds = items.map(item => item.id);
    const dbProducts = await db.select().from(schema.products).where(inArray(schema.products.id, productIds));

    if (dbProducts.length !== items.length) {
      return res.status(400).json({ message: 'Invalid items in cart. Some products may be unavailable.' });
    }

    // 3. Calculate exact subtotal and verify stock
    let subtotal = 0; // Final subtotal inclusive of tax
    let totalTax = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let baseSubtotal = 0;

    // Check state for tax split
    const isDelhi = customerDetails.state.toLowerCase().includes('delhi');

    const enrichedItems = items.map(item => {
      const dbProd = dbProducts.find(p => p.id === item.id);

      if (!dbProd.isActive) {
        throw new Error(`Product ${dbProd.name} is no longer available.`);
      }

      if (dbProd.stock < item.qty) {
        throw new Error(`Insufficient stock for ${dbProd.name}. Only ${dbProd.stock} left.`);
      }

      const unitPrice = dbProd.salePrice ? Number(dbProd.salePrice) : Number(dbProd.price); // Final price
      const itemSubtotal = unitPrice * item.qty;

      const gstRate = dbProd.gstRate ? Number(dbProd.gstRate) : 18;
      const baseUnitPrice = unitPrice / (1 + (gstRate / 100));
      const basePriceTotal = baseUnitPrice * item.qty;
      const taxAmount = itemSubtotal - basePriceTotal;

      let cgst = 0, sgst = 0, igst = 0;
      if (isDelhi) {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
      } else {
        igst = taxAmount;
      }

      subtotal += itemSubtotal;
      baseSubtotal += basePriceTotal;
      totalTax += taxAmount;
      totalCgst += cgst;
      totalSgst += sgst;
      totalIgst += igst;

      return {
        ...item,
        unitPrice,
        subtotal: itemSubtotal,
        name: dbProd.name,
        gstRate,
        basePrice: baseUnitPrice,
        taxAmount,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst
      };
    });

    const discount = 0; // Promotional discounts not implemented yet

    // 4. Validate shipping securely on backend
    const shippingResult = await getShipping({ pincode: customerDetails.pincode, subtotal });
    if (!shippingResult.isValid) {
      return res.status(400).json({ message: shippingResult.error || 'Invalid pincode for shipping' });
    }
    const shippingFee = shippingResult.rate;
    const totalAmount = subtotal - discount + shippingFee;

    const orderNumber = `INZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = `${customerDetails.address1}${customerDetails.address2 ? ', ' + customerDetails.address2 : ''}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`;

    // 5. Create Cashfree Order Session
    const appId = process.env.CASHFREE_APP_ID || process.env.VITE_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';
    const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

    let paymentSessionId = null;
    if (appId && secretKey) {
      try {
        const cfResponse = await axios.post(
          `${baseUrl}/orders`,
          {
            order_amount: Number(totalAmount.toFixed(2)),
            order_currency: 'INR',
            order_id: orderNumber,
            customer_details: {
              customer_id: `CUST_${Date.now()}`,
              customer_name: customerDetails.name,
              customer_email: customerDetails.email || 'guest@inzfyer.com',
              customer_phone: customerDetails.phone,
            }
          },
          {
            headers: {
              'x-client-id': appId,
              'x-client-secret': secretKey,
              'x-api-version': '2023-08-01',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        paymentSessionId = cfResponse.data.payment_session_id;
      } catch (cfErr) {
        console.error('Cashfree API error:', cfErr.response?.data || cfErr.message);
        throw new Error('Failed to create payment session with payment gateway.');
      }
    }

    // 6. Database Transaction in Neon
    const newOrder = await db.transaction(async (tx) => {
      // Update stock for each product atomically
      for (const item of enrichedItems) {
        const result = await tx.update(schema.products)
          .set({ stock: sql`${schema.products.stock} - ${item.qty}` })
          .where(and(eq(schema.products.id, item.id), gte(schema.products.stock, item.qty)))
          .returning();
          
        if (result.length === 0) {
          throw new Error(`Insufficient stock for ${item.name}. Another customer may have just purchased the last unit.`);
        }
      }

      // Create Order in Neon
      const [order] = await tx.insert(schema.orders).values({
        orderNumber: orderNumber,
        customerName: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email,
        address: fullAddress,
        subtotal: subtotal.toFixed(2),
        shippingCharge: shippingFee.toFixed(2),
        discount: discount.toFixed(2),
        taxAmount: totalTax.toFixed(2),
        cgstAmount: totalCgst.toFixed(2),
        sgstAmount: totalSgst.toFixed(2),
        igstAmount: totalIgst.toFixed(2),
        baseSubtotal: baseSubtotal.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING_PAYMENT',
        gatewayOrderId: orderNumber,
        idempotencyKey: idempotencyKey
      }).returning();

      // Create Order Items
      const orderItemsToInsert = enrichedItems.map(item => ({
        orderId: order.id,
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: item.subtotal.toFixed(2),
        basePrice: item.basePrice.toFixed(2),
        taxAmount: item.taxAmount.toFixed(2),
        cgstAmount: item.cgstAmount.toFixed(2),
        sgstAmount: item.sgstAmount.toFixed(2),
        igstAmount: item.igstAmount.toFixed(2),
        gstRate: item.gstRate.toFixed(2)
      }));

      await tx.insert(schema.orderItems).values(orderItemsToInsert);

      // Insert inventory movements for sales
      const inventoryMovementsToInsert = enrichedItems.map(item => ({
        productId: item.id,
        movementType: 'SALE',
        quantity: -item.qty,
        referenceId: orderNumber,
        notes: 'Order checkout'
      }));
      await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);

      await enqueueNotification(tx, order.id, customerDetails.email, 'ORDER_CREATED');

      return order;
    });

    return res.status(200).json({
      success: true,
      paymentSessionId: paymentSessionId,
      orderData: {
        orderId: newOrder.orderNumber,
        totalAmount: Number(totalAmount.toFixed(2)),
        customerName: newOrder.customerName,
        email: newOrder.email,
        items: items
      }
    });

  } catch (error) {
    console.error('Error in checkout:', error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to complete checkout securely'
    });
  }
}