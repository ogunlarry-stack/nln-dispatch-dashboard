const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

let leads = [];
let nextLeadId = 1;

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/admin", (req, res) => {
res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/provider", (req, res) => {
res.sendFile(path.join(__dirname, "public", "provider.html"));
});

app.get("/api/leads", (req, res) => {
res.json(leads);
});

app.post("/api/new-lead", (req, res) => {
const { name, phone, service, serviceType, location } = req.body;

const lead = {
id: nextLeadId++,
name: name || "Customer",
phone: phone || "",
service: service || "Locksmith",
serviceType: serviceType || "",
location: location || "",
status: "New",
assignedTo: ""
};

leads.push(lead);
res.json({ success: true, lead });
});

app.post("/api/assign/:id", (req, res) => {
const { techName } = req.body;
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.assignedTo = techName || "";
lead.status = "Assigned";
res.json({ success: true });
});

app.post("/api/accept/:id", (req, res) => {
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.status = "Accepted";
res.json({ success: true });
});

app.post("/api/complete/:id", (req, res) => {
const lead = leads.find(l => l.id == req.params.id);

if (!lead) {
return res.status(404).json({ error: "Lead not found" });
}

lead.status = "Completed";
res.json({ success: true });
});

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
