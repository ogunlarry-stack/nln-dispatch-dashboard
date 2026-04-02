const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory leads
let leads = [];
let idCounter = 1;

// Home (optional)
app.get("/", (req, res) => {
res.send("NLN Server Running");
});

// ✅ ADMIN DASHBOARD
app.get("/admin", (req, res) => {
res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ✅ PROVIDER DASHBOARD
app.get("/provider", (req, res) => {
res.sendFile(path.join(__dirname, "public", "provider.html"));
});

// GET ALL LEADS
app.get("/api/leads", (req, res) => {
res.json(leads);
});

// CREATE LEAD
app.post("/api/new-lead", (req, res) => {
const { name, phone, service, serviceType, location } = req.body;

const lead = {
id: idCounter++,
name: name || "Customer",
phone: phone || "",
service: service || "Locksmith",
serviceType: serviceType || "",
location: location || "",
status: "New",
assignedTo: ""
};

leads.push(lead);

res.json({
success: true,
lead
});
});

// ASSIGN LEAD
app.post("/api/assign/:id", (req, res) => {
const { techName } = req.body;
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.assignedTo = techName;
lead.status = "Assigned";

res.json({ success: true });
});

// ACCEPT LEAD
app.post("/api/accept/:id", (req, res) => {
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.status = "Accepted";

res.json({ success: true });
});

// COMPLETE LEAD
app.post("/api/complete/:id", (req, res) => {
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.status = "Completed";

res.json({ success: true });
});

// CANCEL LEAD
app.post("/api/cancel/:id", (req, res) => {
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.status = "Canceled";

res.json({ success: true });
});

app.listen(PORT, () => {
console.log("Server running on " + PORT);
});
