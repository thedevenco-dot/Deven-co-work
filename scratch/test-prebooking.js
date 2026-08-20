const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('--- 1. Testing GET /api/seats (Initial) ---');
  const seatsRes = await fetch(`${BASE_URL}/seats`);
  const seatsData = await seatsRes.json();
  console.log(`Successfully fetched ${seatsData.count} seats.`);
  const availableCount = seatsData.data.filter(s => s.status === 'available' && !s.isStaff).length;
  const staffCount = seatsData.data.filter(s => s.isStaff).length;
  console.log(`Available seats count: ${availableCount} (Should be 50)`);
  console.log(`Staff seats count: ${staffCount} (Should be 6)`);

  console.log('\n--- 2. Submitting Pre-booking (Desks T4-R2 & T4-R3) ---');
  const payload = {
    name: 'Jane Smith',
    phone: '+91 99999 77777',
    seatNumbers: ['T4-R2', 'T4-R3'],
    plan: 'Dedicated Desk',
  };
  const submitRes = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const submitData = await submitRes.json();
  console.log('Submission Response Status:', submitRes.status);
  console.log('Order generated:', submitData.razorpayOrder);

  if (!submitData.success) {
    console.error('Reservation creation failed!', submitData);
    return;
  }

  const reservationId = submitData.reservation._id;

  console.log('\n--- 3. Verifying Seat Status is still Available (Unpaid Order) ---');
  const checkSeatsRes1 = await fetch(`${BASE_URL}/seats`);
  const checkSeatsData1 = await checkSeatsRes1.json();
  const seatT4R2_state1 = checkSeatsData1.data.find(s => s.zone === 'T4' && s.label === 'R2');
  console.log(`Desk T4-R2 status (Unpaid): ${seatT4R2_state1.status}`);

  console.log('\n--- 4. Confirming Payment (Verify Razorpay Checkout Signature) ---');
  const confirmRes = await fetch(`${BASE_URL}/reservations/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reservationId,
      razorpayPaymentId: 'pay_test_payment_1234',
      razorpaySignature: 'sig_test_signature_1234',
    }),
  });
  const confirmData = await confirmRes.json();
  console.log('Confirmation Response:', confirmData);

  console.log('\n--- 5. Checking Seat Status (After Payment Confirmed) ---');
  const checkSeatsRes2 = await fetch(`${BASE_URL}/seats`);
  const checkSeatsData2 = await checkSeatsRes2.json();
  const seatT4R2_state2 = checkSeatsData2.data.find(s => s.zone === 'T4' && s.label === 'R2');
  const seatT4R3_state2 = checkSeatsData2.data.find(s => s.zone === 'T4' && s.label === 'R3');
  console.log(`Desk T4-R2 status (Paid): ${seatT4R2_state2.status} (Reserved by ${seatT4R2_state2.reservationId})`);
  console.log(`Desk T4-R3 status (Paid): ${seatT4R3_state2.status} (Reserved by ${seatT4R3_state2.reservationId})`);

  console.log('\n--- 6. Verifying Collision Prevention (Trying to double-book Desk T4-R2) ---');
  const doubleBookPayload = {
    name: 'Conflict Buyer',
    phone: '+91 88888 77777',
    seatNumbers: ['T4-R2', 'T4-R4'],
    plan: 'Dedicated Desk',
  };
  const conflictRes = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doubleBookPayload),
  });
  const conflictData = await conflictRes.json();
  console.log('Conflict Submission Status:', conflictRes.status);
  console.log('Conflict Submission Response:', conflictData);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
});
