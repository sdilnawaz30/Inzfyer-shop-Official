import { z } from 'zod';
import { getDb } from '../src/db/index.js';
import * as schema from '../src/db/schema.js';
import { inArray, eq, and, gte, sql } from 'drizzle-orm';
import { enqueueNotification } from './utils/notifications.js';

// Zod schema for input validation
const orderSchema = z.object({
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
    const productIds = items.map(item => item.id);
    const dbProducts = await db.select().from(schema.products).where(inArray(schema.products.id, productIds));
    
    if (dbProducts.length !== items.length) {
       return res.status(400).json({ message: 'Invalid items in cart. Some products may be unavailable.' });
    }

    // 3. Calculate exact subtotal and verify stock
    let subtotal = 0;
    const enrichedItems = items.map(item => {
      const dbProd = dbProducts.find(p => p.id === item.id);
      
      if (!dbProd.isActive) {
        throw new Error(`Product ${dbProd.name} is no longer available.`);
      }
      
      if (dbProd.stock < item.qty) {
        throw new Error(`Insufficient stock for ${dbProd.name}. Only ${dbProd.stock} left.`);
      }
      
      const unitPrice = dbProd.salePrice ? Number(dbProd.salePrice) : Number(dbProd.price);
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;
      
      const gstRate = dbProd.gstRate ? Number(dbProd.gstRate) : 18;
      
      return { 
        ...item, 
        unitPrice,
        subtotal: itemSubtotal,
        name: dbProd.name,
        gstRate
      };
    });

    const discount = 0; // Promotional discounts not implemented yet
    const freeShipping = subtotal >= 1999;
    const shippingFee = freeShipping ? 0 : 149;
    
    // Proportional discount ratio
    const discountRatio = subtotal > 0 ? discount / subtotal : 0;
    
    // Calculate exact tax per item and add to enriched item
    let tax = 0;
    const enrichedItemsWithTax = enrichedItems.map(item => {
      const discountedItemSubtotal = item.subtotal * (1 - discountRatio);
      const itemTax = discountedItemSubtotal * (item.gstRate / 100);
      tax += itemTax;
      return { ...item, taxAmount: itemTax };
    });
    
    // Total Amount includes tax
    const totalAmount = subtotal - discount + tax + shippingFee;

    const orderNumber = `INZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = `${customerDetails.address1}${customerDetails.address2 ? ', ' + customerDetails.address2 : ''}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`;

    // 4. Database Transaction
    const newOrder = await db.transaction(async (tx) => {
      
      // Update stock for each product atomically
      for (const item of enrichedItemsWithTax) {
        const result = await tx.update(schema.products)
          .set({ stock: sql`${schema.products.stock} - ${item.qty}` })
          .where(and(eq(schema.products.id, item.id), gte(schema.products.stock, item.qty)))
          .returning();
          
        if (result.length === 0) {
          throw new Error(`Insufficient stock for ${item.name}. Another customer may have just purchased the last unit.`);
        }
      }

      // Create Order
      const [order] = await tx.insert(schema.orders).values({
        orderNumber: orderNumber,
        customerName: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email,
        address: fullAddress,
        subtotal: subtotal.toFixed(2),
        shippingCharge: shippingFee.toFixed(2),
        discount: discount.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING_PAYMENT',
        idempotencyKey: idempotencyKey
      }).returning();

      // Create Order Items
      const orderItemsToInsert = enrichedItemsWithTax.map(item => ({
        orderId: order.id,
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        gstRate: item.gstRate.toFixed(2),
        taxAmount: item.taxAmount.toFixed(2)
      }));

      await tx.insert(schema.orderItems).values(orderItemsToInsert);

      // Insert inventory movements for sales
      const inventoryMovementsToInsert = enrichedItemsWithTax.map(item => ({
        productId: item.id,
        movementType: 'SALE',
        quantity: -item.qty,
        referenceId: orderNumber,
        notes: `Order checkout`
      }));
      await tx.insert(schema.inventoryMovements).values(inventoryMovementsToInsert);

      await enqueueNotification(tx, order.id, customerDetails.email, 'ORDER_CREATED');

      return order;
    });

    return res.status(200).json({
      success: true,
      orderData: {
        orderId: newOrder.orderNumber,
        totalAmount,
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
