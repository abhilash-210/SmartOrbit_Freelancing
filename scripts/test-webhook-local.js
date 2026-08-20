/**
 * SMARTORBIT WHATSAPP AUTOMATION - LOCAL TEST SUITE
 * Tests all 9 test scenarios specified in the Master Implementation Specification.
 */

import handler, { matchService } from '../api/webhook.js';
import adminHandler from '../api/admin.js';
import { _resetMemoryStoreForTesting, getContactState } from '../api/lib/stateManager.js';
import { CONVERSATION_STATES, SERVICES } from '../api/lib/constants.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Mock HTTP Request/Response helper
function createMockReqRes({ method = 'POST', headers = {}, query = {}, body = {} }) {
  let statusCode = 200;
  let responseData = null;

  const req = {
    method,
    headers,
    query,
    body
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    send(data) {
      responseData = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData
  };

  return { req, res };
}

function buildWhatsAppMessagePayload({
  messageId,
  from = '919876543210',
  name = 'Test User',
  text = '',
  type = 'text',
  interactive = null
}) {
  const messageObj = {
    id: messageId,
    from,
    timestamp: String(Math.floor(Date.now() / 1000)),
    type
  };

  if (type === 'text') {
    messageObj.text = { body: text };
  } else if (type === 'interactive' && interactive) {
    messageObj.interactive = interactive;
  }

  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '918019677679', phone_number_id: '123456789' },
              contacts: [{ profile: { name }, wa_id: from }],
              messages: [messageObj]
            }
          }
        ]
      }
    ]
  };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 SMARTORBIT WHATSAPP AUTOMATION - TEST SUITE');
  console.log('======================================================\n');

  _resetMemoryStoreForTesting();

  // ----------------------------------------------------
  // TEST 1: Website Lead Flow
  // ----------------------------------------------------
  console.log('🔹 Test 1: Website Lead (Discuss Your Project button)');
  {
    const websitePhone = '919999000001';
    const msg1 = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.001',
      from: websitePhone,
      name: 'Alice Website',
      text: 'Hello SmartOrbit Freelancers, I am interested in your freelancing services. I would like to discuss about project.'
    });

    const { req: req1, res: res1 } = createMockReqRes({ body: msg1 });
    await handler(req1, res1);
    assert(res1.getStatusCode() === 200, 'Webhook returns 200');
    assert(res1.getData()?.status === 'greeting_sent', 'Status is greeting_sent');

    const state1 = await getContactState(websitePhone);
    assert(state1.state === CONVERSATION_STATES.WAITING_FOR_SERVICE, 'State is WAITING_FOR_SERVICE');
    assert(state1.source === 'website', 'Source tagged as website');
    assert(state1.entryPoint === 'discuss_project_button', 'Entry point tagged as discuss_project_button');

    // Alice selects option 1 (Brand Design)
    const msg2 = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.002',
      from: websitePhone,
      name: 'Alice Website',
      text: '1'
    });

    const { req: req2, res: res2 } = createMockReqRes({ body: msg2 });
    await handler(req2, res2);
    assert(res2.getStatusCode() === 200, 'Selection webhook returns 200');
    assert(res2.getData()?.status === 'lead_captured', 'Lead status is lead_captured');
    assert(res2.getData()?.service === 'Brand Design', 'Selected service is Brand Design');
    assert(res2.getData()?.leadId?.startsWith('SO-'), 'Lead ID format valid');

    const state2 = await getContactState(websitePhone);
    assert(state2.state === CONVERSATION_STATES.HUMAN_HANDOFF, 'State is now HUMAN_HANDOFF');
  }

  // ----------------------------------------------------
  // TEST 2: Direct WhatsApp Lead ("Hi" / "Web Design")
  // ----------------------------------------------------
  console.log('\n🔹 Test 2: Direct WhatsApp Lead (Unrecognized contact sends "Hi")');
  {
    const directPhone = '919999000002';
    const msg1 = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.003',
      from: directPhone,
      name: 'Bob Direct',
      text: 'Hi'
    });

    const { req: req1, res: res1 } = createMockReqRes({ body: msg1 });
    await handler(req1, res1);
    assert(res1.getData()?.status === 'greeting_sent', 'Direct client receives greeting');

    const state1 = await getContactState(directPhone);
    assert(state1.source === 'direct_whatsapp', 'Source is direct_whatsapp');
    assert(state1.entryPoint === 'direct_message', 'Entry point is direct_message');

    // Bob replies with text "Web Design"
    const msg2 = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.004',
      from: directPhone,
      name: 'Bob Direct',
      text: 'Web Design'
    });

    const { req: req2, res: res2 } = createMockReqRes({ body: msg2 });
    await handler(req2, res2);
    assert(res2.getData()?.service === 'Web Design', 'Selected service is Web Design');
    assert(res2.getData()?.state === CONVERSATION_STATES.HUMAN_HANDOFF, 'Transitioned to HUMAN_HANDOFF');
  }

  // ----------------------------------------------------
  // TEST 3: Content Creation Selection
  // ----------------------------------------------------
  console.log('\n🔹 Test 3: Content Creation & Editing Service');
  {
    const phone = '919999000003';
    // Start intake
    await handler(createMockReqRes({ body: buildWhatsAppMessagePayload({ messageId: 'wamid.test.005', from: phone, text: 'Hello' }) }).req, createMockReqRes({}).res);
    // Select option 3
    const { req, res } = createMockReqRes({ body: buildWhatsAppMessagePayload({ messageId: 'wamid.test.006', from: phone, text: '3' }) });
    await handler(req, res);
    assert(res.getData()?.service === 'Content Creation & Editing', 'Service accurately matched Content Creation & Editing');
  }

  // ----------------------------------------------------
  // TEST 4: Data Entry & Customer Support Selection
  // ----------------------------------------------------
  console.log('\n🔹 Test 4: Data Entry & Customer Support Service');
  {
    const phone = '919999000004';
    // Start intake
    await handler(createMockReqRes({ body: buildWhatsAppMessagePayload({ messageId: 'wamid.test.007', from: phone, text: 'Hey there' }) }).req, createMockReqRes({}).res);
    // Select option 4 (interactive list click)
    const interactiveMsg = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.008',
      from: phone,
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: '4', title: 'Data Entry & Customer Support' }
      }
    });
    const { req, res } = createMockReqRes({ body: interactiveMsg });
    await handler(req, res);
    assert(res.getData()?.service === 'Data Entry & Customer Support', 'Interactive list selection matched Data Entry & Customer Support');
  }

  // ----------------------------------------------------
  // TEST 5 & 6: Existing Client in HUMAN_HANDOFF (Automation Silent)
  // ----------------------------------------------------
  console.log('\n🔹 Test 5 & 6: Existing Client Protection (Automation Remains Silent)');
  {
    const existingPhone = '919999000001'; // Alice from Test 1 (already in HUMAN_HANDOFF)
    
    // Alice sends another message immediately
    const msg1 = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.009',
      from: existingPhone,
      text: 'Hi, I wanted to discuss the website again.'
    });
    const { req: req1, res: res1 } = createMockReqRes({ body: msg1 });
    await handler(req1, res1);

    assert(res1.getStatusCode() === 200, 'Webhook returns 200 for existing client');
    assert(res1.getData()?.status === 'human_handoff_silent', 'Automation stays completely silent');

    // Alice sends another message days later
    const msg2 = buildWhatsAppMessagePayload({
      messageId: 'wamid.test.010',
      from: existingPhone,
      text: 'Can we schedule a call next week?'
    });
    const { req: req2, res: res2 } = createMockReqRes({ body: msg2 });
    await handler(req2, res2);
    assert(res2.getData()?.status === 'human_handoff_silent', 'Automation stays silent on future days');
  }

  // ----------------------------------------------------
  // TEST 7: Duplicate Webhook Event Idempotency
  // ----------------------------------------------------
  console.log('\n🔹 Test 7: Duplicate Webhook Event (Idempotency Protection)');
  {
    const duplicatePhone = '919999000005';
    const msgPayload = buildWhatsAppMessagePayload({
      messageId: 'wamid.duplicate.unique.123',
      from: duplicatePhone,
      text: 'First time message'
    });

    // 1st delivery
    const { req: req1, res: res1 } = createMockReqRes({ body: msgPayload });
    await handler(req1, res1);
    assert(res1.getData()?.status === 'greeting_sent', 'First event processes normally');

    // 2nd delivery of same message ID (e.g. Meta webhook retry)
    const { req: req2, res: res2 } = createMockReqRes({ body: msgPayload });
    await handler(req2, res2);
    assert(res2.getData()?.status === 'already_processed', 'Second event correctly skipped via idempotency');
  }

  // ----------------------------------------------------
  // TEST 8: Invalid Service Response
  // ----------------------------------------------------
  console.log('\n🔹 Test 8: Invalid Service Choice (Fallback & Re-prompt)');
  {
    const invalidPhone = '919999000006';
    // Start intake
    await handler(createMockReqRes({ body: buildWhatsAppMessagePayload({ messageId: 'wamid.test.011', from: invalidPhone, text: 'Hello' }) }).req, createMockReqRes({}).res);
    
    // Send invalid option "9"
    const { req: req1, res: res1 } = createMockReqRes({ body: buildWhatsAppMessagePayload({ messageId: 'wamid.test.012', from: invalidPhone, text: '9' }) });
    await handler(req1, res1);
    assert(res1.getData()?.status === 'invalid_choice_prompted', 'Prompted with invalid choice retry message');
    
    const stateAfterInvalid = await getContactState(invalidPhone);
    assert(stateAfterInvalid.state === CONVERSATION_STATES.WAITING_FOR_SERVICE, 'State stays WAITING_FOR_SERVICE');

    // Now send valid option "2"
    const { req: req2, res: res2 } = createMockReqRes({ body: buildWhatsAppMessagePayload({ messageId: 'wamid.test.013', from: invalidPhone, text: '2' }) });
    await handler(req2, res2);
    assert(res2.getData()?.status === 'lead_captured', 'Successfully captures lead upon sending valid choice');
  }

  // ----------------------------------------------------
  // TEST 9: Admin Reset Endpoint Verification
  // ----------------------------------------------------
  console.log('\n🔹 Test 9: Admin Reset API');
  {
    const adminPhone = '919999000001'; // Alice was in HUMAN_HANDOFF
    const { req, res } = createMockReqRes({
      method: 'POST',
      headers: { 'x-admin-key': 'smartorbit_admin_secret_2026' },
      body: { action: 'reset', phone: adminPhone }
    });

    await adminHandler(req, res);
    assert(res.getStatusCode() === 200, 'Admin reset returns 200');
    assert(res.getData()?.success === true, 'Admin reset success is true');

    const stateAfterReset = await getContactState(adminPhone);
    assert(!stateAfterReset, 'Contact state successfully reset from state store');
  }

  console.log('\n======================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
