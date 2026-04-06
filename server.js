const twilio = require("twilio");

const client = twilio(
process.env.TWILIO_SID,
process.env.TWILIO_TOKEN
);

app.post("/api/sms/:id", async (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({
success: false,
message: "Lead not found"
});
}

try {
const message = await client.messages.create({
body: `🚨 NEW JOB
Service: ${lead.service}
Location: ${lead.location}
Customer: ${lead.name}
Phone: ${lead.phone}
Tech: ${lead.technician}`,
from: "+18336964193",
to: "+14435781686"
});

console.log("REAL SMS SENT:", message.sid);

res.json({
success: true,
message: "REAL SMS sent"
});
} catch (err) {
console.log("SMS ERROR:", err.message);

res.status(500).json({
success: false,
message: err.message
});
}
});
