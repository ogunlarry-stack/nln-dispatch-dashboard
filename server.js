require('dotenv').config();

const express = require('express');
const twilio = require('twilio');

const app = express();

// Twilio helpers
const VoiceResponse = twilio.twiml.VoiceResponse;
const MessagingResponse = twilio.twiml.MessagingResponse;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 🔥 HEALTH CHECK (important for Render)
app.get('/', (req, res) => {
res.send('NLN Dispatch Server Running 🚀');
});

// 🔥 TEST ROUTES (so browser doesn't error)
app.get('/call', (req, res) => {
res.send('Call endpoint is working');
});

app.get('/sms', (req, res) => {
res.send('SMS endpoint is working');
});

// 🔥 INCOMING CALL HANDLER
app.post('/call', (req, res) => {
console.log('📞 Incoming call from:', req.body.From);

const twiml = new VoiceResponse();

twiml.say(
{ voice: 'alice' },
'Thank you for calling. Connecting you to a technician now.'
);

twiml.dial(process.env.TECH_PHONE);

res.type('text/xml');
res.send(twiml.toString());
});

// 🔥 INCOMING SMS HANDLER
app.post('/sms', (req, res) => {
console.log('📩 SMS from:', req.body.From, 'Message:', req.body.Body);

const twiml = new MessagingResponse();

twiml.message(
'Citywide Dispatch: We received your request. A technician will contact you shortly.'
);

res.type('text/xml');
res.send(twiml.toString());
});

// 🔥 OPTIONAL: SEND SMS FROM SERVER (for future dashboard)
app.get('/send-test', async (req, res) => {
try {
const client = twilio(
process.env.TWILIO_SID,
process.env.TWILIO_TOKEN
);

await client.messages.create({
body: 'Test message from NLN system',
from: process.env.TWILIO_FROM,
to: process.env.TECH_PHONE
});

res.send('SMS sent ✅');
} catch (err) {
console.error(err);
res.status(500).send('Error sending SMS');
}
});

// 🔥 PORT FIX FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});
