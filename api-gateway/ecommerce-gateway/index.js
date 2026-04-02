const express = require('express');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(express.json());

// Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// SERVICE URLs
const SERVICES = {
    users: "http://localhost:3001",
    products: "http://localhost:3002",
    orders: "http://localhost:3003",
    payments: "http://localhost:3004",
    cart: "http://localhost:3005",
    reviews: "http://localhost:3006"
};

// GENERIC FORWARD FUNCTION
const forwardRequest = async (service, path, method, body = null) => {
    try {
        const url = `${SERVICES[service]}${path}`;

        const response = await axios({
            method,
            url,
            data: body
        });

        return response.data;
    } catch (err) {
        throw {
            status: err.response?.status || 500,
            message: err.response?.data?.error || "Service error"
        };
    }
};

// ---------------- GENERIC ROUTE CREATOR ----------------
const createRoutes = (serviceName) => {
    const base = `/gateway/${serviceName}`;

    app.get(base, async (req, res) => {
        try {
            const data = await forwardRequest(serviceName, `/${serviceName}`, "GET");
            res.json(data);
        } catch (e) {
            res.status(e.status).json({ error: e.message });
        }
    });

    app.get(`${base}/:id`, async (req, res) => {
        try {
            const data = await forwardRequest(serviceName, `/${serviceName}/${req.params.id}`, "GET");
            res.json(data);
        } catch (e) {
            res.status(e.status).json({ error: e.message });
        }
    });

    app.post(base, async (req, res) => {
        try {
            const data = await forwardRequest(serviceName, `/${serviceName}`, "POST", req.body);
            res.status(201).json(data);
        } catch (e) {
            res.status(e.status).json({ error: e.message });
        }
    });

    app.put(`${base}/:id`, async (req, res) => {
        try {
            const data = await forwardRequest(serviceName, `/${serviceName}/${req.params.id}`, "PUT", req.body);
            res.json(data);
        } catch (e) {
            res.status(e.status).json({ error: e.message });
        }
    });

    app.delete(`${base}/:id`, async (req, res) => {
        try {
            const data = await forwardRequest(serviceName, `/${serviceName}/${req.params.id}`, "DELETE");
            res.json(data);
        } catch (e) {
            res.status(e.status).json({ error: e.message });
        }
    });
};

// CREATE ROUTES FOR ALL SERVICES
Object.keys(SERVICES).forEach(service => createRoutes(service));

app.listen(8080, () => {
    console.log("🚀 Gateway running at http://localhost:8080");
    console.log("📄 Swagger: http://localhost:8080/api-docs");
});