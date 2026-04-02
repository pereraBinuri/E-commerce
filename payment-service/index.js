const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(express.json());

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({ error: "Invalid JSON format" });
    }
    next();
});

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let payments = [];

// VALIDATION FUNCTION
const validatePayment = (data) => {
    const errors = [];

    if (typeof data.id !== "number" || isNaN(data.id) || data.id <= 0)
        errors.push("id must be a valid number");

    if (typeof data.orderId !== "number" || isNaN(data.orderId) || data.orderId <= 0)
        errors.push("orderId must be a valid number");

    if (typeof data.userId !== "number" || isNaN(data.userId) || data.userId <= 0)
        errors.push("userId must be a valid number");

    if (typeof data.amount !== "number" || data.amount <= 0)
        errors.push("amount must be a positive number");

    if (typeof data.currency !== "string")
        errors.push("currency must be a string");

    const validMethods = ["card", "cash", "paypal"];
    if (!validMethods.includes(data.paymentMethod))
        errors.push("paymentMethod must be card, cash, or paypal");

    const validStatus = ["pending", "completed", "failed"];
    if (!validStatus.includes(data.paymentStatus))
        errors.push("paymentStatus must be pending, completed, or failed");

    return errors;
};

// GET all
app.get('/payments', (req, res) => {
    res.status(200).json(payments);
});

// GET by ID
app.get('/payments/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const payment = payments.find(p => p.id === id);

    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payment);
});

// POST
app.post('/payments', (req, res) => {
    const data = req.body;

    if (
        data.id === undefined ||
        data.orderId === undefined ||
        data.userId === undefined ||
        data.amount === undefined ||
        !data.currency ||
        !data.paymentMethod ||
        !data.paymentStatus
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const errors = validatePayment(data);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    if (payments.find(p => p.id === data.id)) {
        return res.status(400).json({ error: "Payment already exists" });
    }

    const payment = {
        ...data,
        createdAt: new Date().toISOString()
    };

    payments.push(payment);

    res.status(201).json(payment);
});

// PUT (PARTIAL UPDATE)
app.put('/payments/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = payments.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Payment not found" });
    }

    const updatedData = {
        ...payments[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    const errors = validatePayment(updatedData);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    payments[index] = updatedData;

    res.json(payments[index]);
});

// DELETE
app.delete('/payments/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = payments.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Payment not found" });
    }

    payments.splice(index, 1);

    res.json({ message: "Payment deleted successfully" });
});

// GLOBAL ERROR
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3004, () => console.log("Payment Service running on 3004"));