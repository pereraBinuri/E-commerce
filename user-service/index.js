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

let users = [];

// VALIDATION FUNCTION
const validateUser = (data) => {
    const errors = [];

    if (!Number.isInteger(data.id) || data.id <= 0)
        errors.push("id must be a positive integer");

    if (typeof data.firstName !== "string")
        errors.push("firstName must be a string");

    if (typeof data.lastName !== "string")
        errors.push("lastName must be a string");

    if (typeof data.email !== "string")
        errors.push("email must be a string");

    if (typeof data.password !== "string")
        errors.push("password must be a string");

    if (typeof data.phone !== "string")
        errors.push("phone must be a string");

    if (typeof data.address !== "object" || data.address === null)
        errors.push("address must be an object");

    if (data.role !== undefined) {
        if (typeof data.role !== "string") {
            errors.push("role must be a string");
        } else {
            const role = data.role.toLowerCase();
            if (!["customer", "admin"].includes(role)) {
                errors.push("role must be either 'customer' or 'admin'");
            }
        }
    }

    return errors;
};

// GET all users
app.get('/users', (req, res) => {
    res.json(users);
});

// GET user by ID
app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
});

// POST create user
app.post('/users', (req, res) => {
    const data = req.body;

    if (
    data.id === undefined ||
    data.firstName === undefined ||
    data.lastName === undefined ||
    data.email === undefined ||
    data.password === undefined ||
    data.phone === undefined ||
    !data.address
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const { street, city, country, zipCode } = data.address;

    if (!street || !city || !country || !zipCode) {
        return res.status(400).json({
            error: "Address fields (street, city, country, zipCode) are required"
        });
    }

    const errors = validateUser(data);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    if (users.find(u => u.id === data.id)) {
        return res.status(400).json({ error: "User already exists" });
    }

    const role = data.role ? data.role.toLowerCase() : "customer";

    const user = {
        ...data,
        role,
        createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString()
    };

    users.push(user);

    res.status(201).json(user);
});

// PUT (PARTIAL UPDATE)
app.put('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    const updatedData = {
        ...users[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    const errors = validateUser(updatedData);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(", ") });
    }

    users[index] = updatedData;

    res.json(users[index]);
});

// DELETE
app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users.splice(index, 1);

    res.json({ message: "User deleted successfully" });
});

// GLOBAL ERROR
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});

app.listen(3001, () => console.log("User Service running on 3001"));