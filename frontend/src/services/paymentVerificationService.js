// backend/services/paymentVerificationService.js
import Order from '../models/orderModel.js'
import cron from 'node-cron'
import bankAPI from '../utils/bankAPI.js' // You would need to create this

// Function to check individual order payment
const verifyOrderPayment = async (order) => {
  try {
    // Get reference code from order
    const referenceCode = `HD${order._id.slice(-6)}`
    
    // Check with bank API if payment exists with this reference
    const paymentFound = await bankAPI.checkPayment({
      accountNumber: 'YOUR_ACCOUNT_NUMBER',
      referenceCode,
      amount: order.totalPrice,
      fromDate: new Date(order.createdAt),
      toDate: new Date()
    })
    
    if (paymentFound) {
      // Update order status
      order.isPaid = true
      order.paidAt = new Date()
      await order.save()
      
      // Could send email notification here
      console.log(`Order ${order._id} marked as paid automatically`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Payment verification error:', error)
    return false
  }
}

// Schedule verification job to run every hour
export const startPaymentVerificationScheduler = () => {
  console.log('Starting payment verification scheduler')
  
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled payment verification')
    
    // Find unpaid bank transfer orders from last 7 days
    const pendingOrders = await Order.find({
      isPaid: false, 
      paymentMethod: 'BankTransfer',
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    
    console.log(`Found ${pendingOrders.length} pending bank transfer orders`)
    
    // Check each order
    for (const order of pendingOrders) {
      await verifyOrderPayment(order)
    }
  })
}

// On-demand verification for a single order
export const verifyPaymentForOrder = async (orderId) => {
  const order = await Order.findById(orderId)
  if (!order || order.isPaid || order.paymentMethod !== 'BankTransfer') {
    return false
  }
  
  return await verifyOrderPayment(order)
}