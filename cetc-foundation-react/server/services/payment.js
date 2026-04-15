'use strict';
/**
 * Razorpay Payment Service
 * Handles order creation and payment verification
 */
const crypto = require('crypto');

let Razorpay;
let razorpayInstance;

/**
 * Initialize Razorpay instance lazily
 */
function getRazorpay() {
  if (!razorpayInstance) {
    try {
      Razorpay = require('razorpay');
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
      });
    } catch (err) {
      console.warn('[Payment] Razorpay not configured. Using mock mode.');
      return null;
    }
  }
  return razorpayInstance;
}

/**
 * Create a Razorpay order
 * @param {number} amountInRupees - Amount in INR
 * @param {string} receiptId - Unique reference
 * @param {Object} notes - Additional notes stored with the order
 */
async function createOrder(amountInRupees, receiptId, notes = {}) {
  const rzp = getRazorpay();

  const orderData = {
    amount: amountInRupees * 100, // Razorpay expects paisa
    currency: 'INR',
    receipt: receiptId,
    notes,
  };

  if (!rzp || process.env.DEV_MODE === 'true') {
    // Mock order for development
    const mockOrderId = `order_dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('[DEV Payment] Mock order created:', mockOrderId);
    return {
      id: mockOrderId,
      amount: orderData.amount,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      mock: true,
    };
  }

  try {
    const order = await rzp.orders.create(orderData);
    return order;
  } catch (err) {
    console.error('[Payment] Razorpay order creation failed:', err);
    throw new Error(`Payment initialization failed: ${err.error?.description || err.message}`);
  }
}

/**
 * Verify Razorpay payment signature
 * This is CRITICAL for security — always verify before marking payment success
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  if (process.env.DEV_MODE === 'true' && orderId.startsWith('order_dev_')) {
    // Accept mock payments in dev mode
    console.log('[DEV Payment] Mock payment verified');
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature) {
  if (!signature) return false;

  const payload = Buffer.isBuffer(body)
    ? body
    : typeof body === 'string'
      ? body
      : JSON.stringify(body);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret')
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Get payment details from Razorpay
 */
async function fetchPayment(paymentId) {
  const rzp = getRazorpay();
  if (!rzp) return null;
  try {
    return await rzp.payments.fetch(paymentId);
  } catch (err) {
    console.error('[Payment] Fetch payment failed:', err.message);
    return null;
  }
}

module.exports = { createOrder, verifyPaymentSignature, verifyWebhookSignature, fetchPayment };
