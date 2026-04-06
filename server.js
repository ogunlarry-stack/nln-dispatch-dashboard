app.post("/api/sms/:id", async (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) return res.json({ success: false });

try {
await client.messages.create({
body: `🚨 NEW JOB
Service: ${lead.service}
Location: ${lead.location}
Customer: ${lead.name}
Phone: ${lead.phone}`,
from: "+18336964193",
to: "+14435781686"
});

console.log("REAL SMS SENT");

res.json({ success: true });

} catch (err) {
console.log("SMS ERROR:", err);
res.json({ success: false });
}
});
