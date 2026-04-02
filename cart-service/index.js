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

let cart = [];

// VALIDATION FUNCTION
const validateCart = (data) => {
    const errors = [];

    if (typeof data.id !== "number" || isNaN(data.id) || data.id <= 0)
        errors.push("id must be a valid number");

    if (typeof data.userId !== "number" || isNaN(data.userId) || data.userId <= 0)
        errors.push("userId must be a valid number");

    if (typeof data.productId !== "number" || isNaN(data.productId) || data.productId <= 0)
        errors.push("productId must be a valid number");

    if (typeof data.productName !== "string")
        errors.push("productName must be a string");

    if (typeof data.quantity !== "number" || data.quantity <= 0)
        errors.push("quantity must be greater than 0");

    if (typeof data.price !== "number" || data.price <= 0)
        errors.push("price must be greater than 0");

    // if (typeof data.totalPrice !== "number" || data.totalPrice <= 0)
    //     errors.push("totalPrice must be greater than 0");

    return errors;
};

// GET all
app.get('/cart', (req, res) => {
    res.json(cart);
});

// GET by ID
app.get('/cart/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const item = cart.find(c => c.id === id);

    if (!item) {
        return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(item);
});

// POST
app.post('/cart', (req, res) => {
    const data = req.body;

    if (
        data.id === undefined ||
        data.userId === undefined ||
        data.productId === undefined ||
        data.productName === undefined ||
        data.quantity === undefined ||
        data.price === undefined
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // AUTO CALCULATE totalPrice
    data.totalPrice = data.quantity * data.price;

    const errors = validateCart(data);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    if (cart.find(c => c.id === data.id)) {
        return res.status(400).json({ error: "Cart item already exists" });
    }

    const item = {
        ...data,
        addedAt: new Date().toISOString()
    };

    cart.push(item);

    res.status(201).json(item);
});

// PUT (PARTIAL UPDATE)
app.put('/cart/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = cart.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Cart item not found" });
    }

    const updatedData = {
        ...cart[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    // Recalculate totalPrice if needed
    if (updatedData.quantity && updatedData.price) {
        updatedData.totalPrice = updatedData.quantity * updatedData.price;
    }

    const errors = validateCart(updatedData);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    cart[index] = updatedData;

    res.json(cart[index]);
});

// DELETE
app.delete('/cart/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = cart.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Cart item not found" });
    }

    cart.splice(index, 1);

    res.json({ message: "Cart item deleted successfully" });
});

// GLOBAL ERROR
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3005, () => console.log("Cart Service running on 3005"));