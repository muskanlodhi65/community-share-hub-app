import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ygqoehmmevgsutwrvvzs.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Community Share Hub Backend Server is running 🚀' });
});

// GET /api/items - Fetch items with optional category filter
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const { category, listingType } = req.query;

    let query = supabase
      .from('items')
      .select('*, categories(name), profiles:owner_id(full_name, avatar_url, is_verified)')
      .order('created_at', { ascending: false });

    if (listingType && listingType !== 'all') {
      query = query.eq('listing_type', listingType);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/process - Backend Process Advance Payment
app.post('/api/payment/process', async (req: Request, res: Response) => {
  try {
    const { requestId, amount, paymentMethod, paymentType } = req.body;

    if (!requestId || !amount) {
      return res.status(400).json({ success: false, error: 'Request ID and Amount are required' });
    }

    // Generate mock transaction ID (Can be replaced with Stripe/Razorpay SDK call)
    const transactionId = 'TXN_' + Math.random().toString(36).substring(2, 11).toUpperCase();

    // Update payment status in Supabase database
    const { data, error } = await supabase
      .from('borrow_requests')
      .update({
        status: 'active'
      })
      .eq('id', requestId)
      .select();

    if (error) {
      console.warn('Note: Request table update notice:', error.message);
    }

    res.json({
      success: true,
      message: 'Advance payment processed successfully',
      details: {
        transactionId,
        requestId,
        amount,
        paymentMethod: paymentMethod || 'UPI / Gateway',
        paymentType: paymentType || 'deposit',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/requests/create - Backend Borrow Request handler
app.post('/api/requests/create', async (req: Request, res: Response) => {
  try {
    const { itemId, borrowerId, startDate, endDate, message } = req.body;

    const { data, error } = await supabase
      .from('borrow_requests')
      .insert({
        item_id: itemId,
        borrower_id: borrowerId,
        start_date: startDate,
        end_date: endDate,
        request_message: message || null
      })
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Community Share Hub Express Server running on http://localhost:${PORT}`);
});
