const twilio = require("twilio");

const client = twilio(
"YOUR_ACCOUNT_SID",
"YOUR_AUTH_TOKEN"
);

app.post("/api/sms/:id", async (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({ success: false });
}

try {
await client.messages.create({
body: `🚨 NEW JOB
Service: ${lead.service}
Location: ${lead.location}
Customer: ${lead.name}
Phone: ${lead.phone}`,
from: "+18336964193",
to: "+YOUR_VERIFIED_NUMBER"
});

console.log("REAL SMS SENT");

res.json({ success: true });

} catch (err) {
console.log(err);
res.json({ success: false });
}
});
