const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory lead storage
let leads = [];
let nextLeadId = 1;

// Demo techs/providers
const techs = [
{
name: "Larry",
phone: "443-578-1686",
services: ["Locksmith", "Car Lockout", "House Lockout", "Commercial Locksmith"],
locations: ["Edgewood", "Baltimore", "Bel Air", "Aberdeen"]
},
{
name: "Eli",
phone: "443-000-0002",
services: ["Locksmith", "Rekey", "Deadbolt Installation", "House Lockout"],
locations: ["Edgewood", "Joppa", "Belcamp", "Aberdeen"]
},
{
name: "Max",
phone: "443-000-0003",
services: ["Locksmith", "Commercial Locksmith", "Safe Service", "Car Lockout"],
locations: ["Baltimore", "Towson", "Bel Air", "Edgewood"]
},
{
name: "Tee",
phone: "443-000-0004",
services: ["Locksmith", "Car Lockout", "House Lockout"],
locations: ["Edgewood", "Baltimore", "Essex", "Rosedale"]
}
];

let routeIndex = -1;

function autoRoute(service, location) {
const matches = techs.filter((tech) => {
const serviceMatch =
tech.services.includes(service) || tech.services.includes("Locksmith");
const locationMatch =
tech.locations.includes(location) || tech.locations.includes("Baltimore");
return serviceMatch && locationMatch;
});

if (matches.length === 0) return null;

routeIndex = (routeIndex + 1) % matches.length;
return matches[routeIndex];
}

function getLeadById(id) {
return leads.find((lead) => lead.id === Number(id));
}

// Home
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Health check
app.get("/health", (req, res) => {
res.json({
ok: true,
app: "NLN Dispatch Dashboard",
leads: leads.length,
time: new Date().toISOString()
});
});

// Get all techs
app.get("/api/techs", (req, res) => {
res.json(techs);
});

// Get all leads
app.get("/api/leads", (req, res) => {
const sorted = [...leads].sort((a, b) => b.id - a.id);
res.json(sorted);
});

// Create new lead
app.post("/api/new-lead", (req, res) => {
const name = (req.body.name || "New Customer").trim();
const phone = (req.body.phone || "No phone").trim();
const service = (req.body.service || "Locksmith").trim();
const serviceType = (req.body.serviceType || "Emergency").trim();
const location = (req.body.location || "Edgewood").trim();
const notes = (req.body.notes || "").trim();

const routedTech = autoRoute(service, location);

const lead = {
id: nextLeadId++,
name,
phone,
service,
serviceType,
location,
notes,
assignedTo: routedTech ? routedTech.name : "",
assignedPhone: routedTech ? routedTech.phone : "",
status: routedTech ? "Routed" : "Pending",
createdAt: new Date().toISOString(),
acceptedAt: null,
completedAt: null,
canceledAt: null
};

leads.push(lead);

res.json({
success: true,
routedTo: routedTech ? routedTech.name : null,
message: routedTech
? `Lead routed to ${routedTech.name}`
: "Lead created with no matching tech",
lead
});
});

// Assign lead manually
app.post("/api/assign/:id", (req, res) => {
const lead = getLeadById(req.params.id);

if (!lead) {
return res.status(404).json({ success: false, message: "Lead not found" });
}

const techName = (req.body.techName || "").trim();

if (!techName) {
return res.status(400).json({ success: false, message: "techName required" });
}

const tech = techs.find((t) => t.name === techName);

if (!tech) {
return res.status(404).json({ success: false, message: "Tech not found" });
}

lead.assignedTo = tech.name;
lead.assignedPhone = tech.phone;
lead.status = "Assigned";

res.json({
success: true,
message: `Lead assigned to ${tech.name}`,
lead
});
});

// Accept lead
app.post("/api/accept/:id", (req, res) => {
const lead = getLeadById(req.params.id);

if (!lead) {
return res.status(404).json({ success: false, message: "Lead not found" });
}

lead.status = "Accepted";
lead.acceptedAt = new Date().toISOString();

res.json({
success: true,
message: "Lead accepted",
lead
});
});

// Complete lead
app.post("/api/complete/:id", (req, res) => {
const lead = getLeadById(req.params.id);

if (!lead) {
return res.status(404).json({ success: false, message: "Lead not found" });
}

lead.status = "Completed";
lead.completedAt = new Date().toISOString();

res.json({
success: true,
message: "Lead completed",
lead
});
});

// Cancel lead
app.post("/api/cancel/:id", (req, res) => {
const lead = getLeadById(req.params.id);

if (!lead) {
return res.status(404).json({ success: false, message: "Lead not found" });
}

lead.status = "Canceled";
lead.canceledAt = new Date().toISOString();

res.json({
success: true,
message: "Lead canceled",
lead
});
});

// Update notes
app.post("/api/note/:id", (req, res) => {
const lead = getLeadById(req.params.id);

if (!lead) {
return res.status(404).json({ success: false, message: "Lead not found" });
}

lead.notes = (req.body.notes || "").trim();

res.json({
success: true,
message: "Notes updated",
lead
});
});

app.listen(PORT, () => {
console.log(`Server running on ${PORT}`);
});