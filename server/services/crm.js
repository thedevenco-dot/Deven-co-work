/**
 * Dispatch reservation details to Zoho Bigin CRM.
 * Maps to CRM pipeline stages: New Lead -> Contacted -> Reservation Confirmed.
 */
export async function pushToCRM(doc, stage = 'New Lead') {
  const webhookUrl = process.env.ZOHO_WEBHOOK_URL;

  // Determine if it is a Lead vs. Reservation
  const isLead = !!doc.type;

  const payload = {
    name: doc.name,
    phone: doc.phone,
    email: doc.email || '',
    company: doc.company || '',
    leadType: isLead ? doc.type : 'PAID_RESERVATION',
    seatNumbers: isLead ? [] : (doc.seatNumbers || []),
    seatCount: isLead ? 0 : (doc.seatNumbers || []).length,
    plan: isLead ? (doc.type === 'FREE_TRIAL' ? 'Free Trial' : 'WhatsApp Inquiry') : (doc.plan || ''),
    amount: isLead ? 0 : (doc.amount || 0),
    paymentStatus: isLead ? 'none' : (doc.paymentStatus || 'pending'),
    razorpayOrderId: isLead ? '' : (doc.razorpayOrderId || ''),
    razorpayPaymentId: isLead ? '' : (doc.razorpayPaymentId || ''),
    crmStage: stage,
    reservationId: isLead ? '' : doc._id,
    joiningDate: isLead ? 'n/a' : (doc.joiningDate || ''),
    trialStartDate: isLead && doc.trialStartDate ? doc.trialStartDate.toISOString() : '',
    trialEndDate: isLead && doc.trialEndDate ? doc.trialEndDate.toISOString() : '',
    notes: doc.notes || '',
    utmSource: doc.utmSource || '',
    utmMedium: doc.utmMedium || '',
    utmCampaign: doc.utmCampaign || '',
    timestamp: new Date().toISOString(),
    source: doc.utmSource ? `Campaign: ${doc.utmSource}` : 'Pre-launch Landing Page',
  };

  if (!webhookUrl) {
    console.log('\n--- [MOCK CRM WEBHOOK DISPATCH] ---');
    console.log('ZOHO_WEBHOOK_URL is not set. Simulating CRM delivery:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('-----------------------------------\n');
    return { success: true, mock: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`CRM Webhook successfully delivered for reservation ${reservation._id}`);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`CRM Webhook returned status ${response.status}: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error(`CRM Webhook dispatch failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}
