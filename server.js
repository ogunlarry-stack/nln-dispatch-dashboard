const express = require("express");
const cors = require("cors");
const path = require("path");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = twilio(
process.env.TWILIO_SID,
process.env.TWILIO_TOKEN
);

let leads = [
{
id: 1,
name: "Customer",
phone: "443-555-0001",
service: "Locksmith",
location: "Edgewood",
status: "New",
technician: "Unassigned",
createdAt: new Date().toLocaleString()
}
];

const techs = ["Larry", "Eli", "Max"];
let techIndex = 0;

function getNextTech() {
const tech = techs[techIndex % techs.length];
techIndex++;
return tech;
}

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/dashboard.html", (req, res) => {
res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/api/leads", (req, res) => {
res.json(leads);
});

app.post("/api/new-lead", (req, res) => {
const { name, phone, service, location } = req.body;

const newLead = {
id: Date.now(),
name: name || "New Customer",
phone: phone || "N/A",
service: service || "Locksmith",
location: location || "Unknown",
status: "Assigned",
technician: getNextTech(),
createdAt: new Date().toLocaleString()
};

leads.unshift(newLead);

res.json({
success: true,
lead: newLead
});
});

app.post("/api/accept/:id", (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({
success: false,
message: "Lead not found"
});
}

lead.status = "Accepted";

res.json({
success: true,
lead
});
});

app.post("/api/assign/:id", (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({
success: false,
message: "Lead not found"
});
}

const { technician } = req.body;

lead.technician = technician || "Unassigned";
lead.status = "Assigned";

res.json({
success: true,
lead
});
});

app.post("/api/complete/:id", (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({
success: false,
message: "Lead not found"
});
}

lead.status = "Completed";

res.json({
success: true,
lead
});
});

app.post("/api/cancel/:id", (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({
success: false,
message: "Lead not found"
});
}

lead.status = "Cancelled";

res.json({
success: true,
lead
});
});

app.post("/api/sms/:id", async (req, res) => {
const lead = leads.find(l => String(l.id) === String(req.params.id));

if (!lead) {
return res.status(404).json({
success: false,
message: "Lead not found"
});
}

if (
!process.env.TWILIO_SID ||
!process.env.TWILIO_TOKEN ||
!process.env.TWILIO_FROM ||
!process.env.TECH_PHONE
) {
return res.status(500).json({
success: false,
message: "Twilio environment variables are missing"
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
from: process.env.TWILIO_FROM,
to: process.env.TECH_PHONE
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

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
