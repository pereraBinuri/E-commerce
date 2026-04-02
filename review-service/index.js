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

let reviews = [];

// VALIDATION FUNCTION
const validateReview = (data) => {
    const errors = [];

    if (typeof data.id !== "number" || isNaN(data.id) || data.id <= 0)
        errors.push("id must be a valid number");

    if (typeof data.userId !== "number" || isNaN(data.userId) || data.userId <= 0)
        errors.push("userId must be a valid number");

    if (typeof data.productId !== "number" || isNaN(data.productId) || data.productId <= 0)
        errors.push("productId must be a valid number");

    if (typeof data.userName !== "string")
        errors.push("userName must be a string");

    if (typeof data.rating !== "number" || isNaN(data.rating)) {
        errors.push("rating must be a valid number");
    } else if (data.rating < 1 || data.rating > 5) {
        errors.push("rating must be between 1 and 5");
    }

    if (data.comment && typeof data.comment !== "string")
        errors.push("comment must be a string");

    if (typeof data.verifiedPurchase !== "boolean")
        errors.push("verifiedPurchase must be true or false");

    return errors;
};

// GET all
app.get('/reviews', (req, res) => {
    res.json(reviews);
});

// GET by ID
app.get('/reviews/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const review = reviews.find(r => r.id === id);

    if (!review) {
        return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
});

// POST
app.post('/reviews', (req, res) => {
    const data = req.body;

    if (
        data.id === undefined ||
        data.userId === undefined ||
        data.productId === undefined ||
        data.userName === undefined ||
        data.rating === undefined ||
        data.verifiedPurchase === undefined
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const errors = validateReview(data);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    if (reviews.find(r => r.id === data.id)) {
        return res.status(400).json({ error: "Review already exists" });
    }

    const review = {
        ...data,
        createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString()
    };

    reviews.push(review);

    res.status(201).json(review);
});

// PUT (PARTIAL UPDATE)
app.put('/reviews/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = reviews.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Review not found" });
    }

    const updatedData = {
        ...reviews[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    const errors = validateReview(updatedData);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    reviews[index] = updatedData;

    res.json(reviews[index]);
});

// DELETE
app.delete('/reviews/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = reviews.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Review not found" });
    }

    reviews.splice(index, 1);

    res.json({ message: "Review deleted successfully" });
});

// GLOBAL ERROR
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3006, () => console.log("Review Service running on 3006"));