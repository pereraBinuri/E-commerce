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

let products = [];

// VALIDATION FUNCTION
const validateProduct = (data) => {
    const errors = [];

    if (typeof data.id !== "number" || isNaN(data.id) || data.id <= 0)
        errors.push("id must be a valid number");

    if (typeof data.name !== "string")
        errors.push("name must be a string");

    if (typeof data.description !== "string")
        errors.push("description must be a string");

    if (typeof data.price !== "number" || data.price <= 0)
        errors.push("price must be a positive number");

    if (typeof data.category !== "string")
        errors.push("category must be a string");

    if (typeof data.brand !== "string")
        errors.push("brand must be a string");

    if (typeof data.stock !== "number" || data.stock < 0)
        errors.push("stock must be a non-negative number");

    return errors;
};

// GET all
app.get('/products', (req, res) => {
    res.status(200).json(products);
});

// GET by ID
app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
});

// POST
app.post('/products', (req, res) => {
    const data = req.body;

    if (
        data.id === undefined ||
        !data.name ||
        !data.description ||
        data.price === undefined ||
        !data.category ||
        !data.brand ||
        data.stock === undefined
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const errors = validateProduct(data);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    if (products.find(p => p.id === data.id)) {
        return res.status(400).json({ error: "Product already exists" });
    }

    const product = {
        ...data,
        createdAt: new Date().toISOString()
    };

    products.push(product);

    res.status(201).json(product);
});

// PUT (PARTIAL UPDATE)
app.put('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }

    const updatedData = {
        ...products[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    const errors = validateProduct(updatedData);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    products[index] = updatedData;

    res.json(products[index]);
});

// DELETE
app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }

    products.splice(index, 1);

    res.json({ message: "Product deleted successfully" });
});

// GLOBAL ERROR
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3002, () => console.log("Product Service running on 3002"));