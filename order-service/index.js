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

let orders = [];

// VALIDATION FUNCTION (UPDATED)
const validateOrder = (data) => {
    const errors = [];

    if (typeof data.id !== "number" || isNaN(data.id) || data.id <= 0)
        errors.push("id must be a valid number");

    if (typeof data.userId !== "number" || isNaN(data.userId) || data.userId <= 0)
        errors.push("userId must be a valid number");

    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push("items must be a non-empty array");
    } else {
        data.items.forEach((item, index) => {

            // REQUIRED FIELD CHECKS
            if (item.productId === undefined)
                errors.push(`items[${index}].productId is required`);

            if (item.quantity === undefined)
                errors.push(`items[${index}].quantity is required`);

            if (item.price === undefined)
                errors.push(`items[${index}].price is required`);

            // TYPE VALIDATION
            if (item.productId !== undefined && typeof item.productId !== "number" || isNaN(item.productId) || item.productId <= 0)
                errors.push(`items[${index}].productId must be a number`);

            if (item.quantity !== undefined && (typeof item.quantity !== "number" || item.quantity <= 0))
                errors.push(`items[${index}].quantity must be > 0`);

            if (item.price !== undefined && (typeof item.price !== "number" || item.price <= 0))
                errors.push(`items[${index}].price must be > 0`);
        });
    }

    if (typeof data.totalAmount !== "number" || data.totalAmount <= 0)
        errors.push("totalAmount must be a positive number");

    const validOrderStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validOrderStatus.includes(data.orderStatus))
        errors.push("orderStatus invalid");

    if (typeof data.shippingAddress !== "string")
        errors.push("shippingAddress must be a string");

    return errors;
};

// GET all
app.get('/orders', (req, res) => {
    res.json(orders);
});

// GET by ID
app.get('/orders/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const order = orders.find(o => o.id === id);

    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
});

// POST
app.post('/orders', (req, res) => {
    const data = req.body;

    if (
        data.id === undefined ||
        data.userId === undefined ||
        data.items === undefined ||
        data.totalAmount === undefined ||
        data.orderStatus === undefined ||
        data.shippingAddress === undefined
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const errors = validateOrder(data);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    if (orders.find(o => o.id === data.id)) {
        return res.status(400).json({ error: "Order already exists" });
    }

    const order = {
        ...data,
        createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json(order);
});

// PUT (PARTIAL UPDATE)
app.put('/orders/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Order not found" });
    }

    const updatedData = {
        ...orders[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    const errors = validateOrder(updatedData);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    orders[index] = updatedData;

    res.json(orders[index]);
});

// DELETE
app.delete('/orders/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Order not found" });
    }

    orders.splice(index, 1);

    res.json({ message: "Order deleted successfully" });
});

// GLOBAL ERROR
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3003, () => console.log("Order Service running on 3003"));