# Advance Payment & Payment Gateway Integration Guide

Community Share Hub me **Advance Payment** (Deposit Amount / Purchase Price) handle karne ke **3 Tarike** hain. Niche Stripe aur Razorpay integration ke backend & frontend code steps aur alternative instant methods samjhaaye gaye hain.

---

## 🚀 Option 1: Stripe Integration (Recommended for Card Payments)

### 1. Database Schema Update (Supabase)
SQL Editor me `borrow_requests` table me payment tracking columns add karein:

```sql
ALTER TABLE borrow_requests 
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
ADD COLUMN payment_intent_id VARCHAR(255),
ADD COLUMN advance_amount DECIMAL(10, 2) DEFAULT 0.00;
```

---

### 2. Backend Server Endpoint (Node.js / Express / Supabase Edge Functions)
Jab user borrow request bhejega ya item purchase karega, backend me Stripe PaymentIntent create karein:

```javascript
// npm install stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, requestId, currency = 'usd' } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Amount in cents
      currency: currency,
      metadata: { requestId: requestId },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 3. Frontend Integration (React Component)
Install `@stripe/stripe-js` & `@stripe/react-stripe-js`:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Payment Modal Component (`PaymentModal.tsx`):**

```tsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! }
    });

    setLoading(false);

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border rounded-md">
        <CardElement />
      </div>
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Processing Advance Payment...' : 'Pay Advance Now'}
      </Button>
    </form>
  );
};
```

---

## 🇮🇳 Option 2: Razorpay Integration (Best for Indian UPI / NetBanking)

### 1. Include Razorpay SDK Script in `index.html`
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 2. Frontend Checkout Handler
```tsx
const handleRazorpayPayment = async (amount: number, requestId: string) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100, // Amount in paise
    currency: "INR",
    name: "Community Share Hub",
    description: "Advance Security Deposit / Item Advance",
    handler: async function (response: any) {
      console.log("Payment ID:", response.razorpay_payment_id);
      
      // Update Supabase request payment status to 'paid'
      await supabase
        .from('borrow_requests')
        .update({ payment_status: 'paid', payment_id: response.razorpay_payment_id })
        .eq('id', requestId);
        
      alert("Advance payment successful!");
    },
    prefill: {
      name: user?.email,
    },
    theme: {
      color: "#0f766e"
    }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
```

---

## 📲 Option 3: Owner UPI QR Code / Direct Advance Option (Simple Setup)

Agar aap third-party payment gateways ke transaction fees aur verification se bachna chahte hain:

1. **Owner Profile Upgrade**: Owner Profile page me `upi_id` (e.g. `user@upi`) aur UPI QR Code URL store karein.
2. **Item Checkout Box**: Requests tab me jab item Approve hoga, tab Borrower ko **"Pay Advance to Owner via UPI"** ka button aur UPI ID / QR code dikhaya ja sakta hai.

---

## Summary Table

| Payment Method | Recommended For | Setup Time | Transaction Fee |
| :--- | :--- | :--- | :--- |
| **Stripe** | Global Credit/Debit Cards | ~30 mins | ~2.9% + 30¢ |
| **Razorpay** | Indian UPI, GPay, PhonePe | ~20 mins | ~2% |
| **Owner UPI/QR** | Zero Fees Instant Peer-to-Peer | ~5 mins | **0% Free** |
