# 🛒 E-Commerce Microservices Architecture with API Gateway

🚀 Scalable Microservices-Based E-Commerce Backend using Node.js, Express, and Swagger API Gateway

---

## 📌 Overview

This project implements a **Microservices-based backend** for an E-Commerce system.  
The application is divided into multiple independent services, each responsible for a specific business function, and an **API Gateway** is used to handle all client requests.

This architecture improves **scalability, flexibility, and maintainability** compared to traditional monolithic systems.

---

## 🧩 Architecture

Client → API Gateway → Microservices

### 🔹 Services Included

- 👤 **User Service**
- 📦 **Product Service**
- 📑 **Order Service**
- 🛒 **Cart Service**
- 💳 **Payment Service**
- ⭐ **Review Service**

Each service runs independently and communicates via REST APIs.

---

## 🚪 API Gateway

- 📍 Base URL: `http://localhost:8080`
- 📄 Swagger UI: `http://localhost:8080/api-docs`

### 🔹 Gateway Endpoints

- `/gateway/users`
- `/gateway/products`
- `/gateway/orders`
- `/gateway/cart`
- `/gateway/payments`
- `/gateway/reviews`

### ✅ Responsibilities

- Routes requests to appropriate services  
- Provides centralized API documentation  
- Simplifies client interaction  
- Handles unified access point  

---

## ⚙️ Technologies Used

- Node.js  
- Express.js  
- Swagger (OpenAPI 3.0)  
- YAML  
- Postman  

---

## 📂 Project Structure
- project-root/
- │
- ├── api-gateway/
- │ ├── index.js
- │ └── swagger.yaml
- │
- ├── user-service/
- │ ├── index.js
- │ └── swagger.yaml
- │
- ├── product-service/
- │ ├── index.js
- │ └── swagger.yaml
- │
- ├── order-service/
- │ ├── index.js
- │ └── swagger.yaml
- │
- ├── cart-service/
- │ ├── index.js
- │ └── swagger.yaml
- │
- ├── payment-service/
- │ ├── index.js
- │ └── swagger.yaml
- │
- ├── review-service/
- │ ├── index.js
- │ └── swagger.yaml
- │
- └── README.md

## 🚀 How to Run the Project

### 1️⃣ Install Dependencies

Run inside each service folder:

```bash
npm install
```

### 2️⃣ Start Services

Run each service in separate terminals:

```bash
node index.js
```

## 📍 Ports Used
Service	Port
User Service	3001
Product Service	3002
Order Service	3003
Payment Service	3004
Cart Service	3005
Review Service	3006
API Gateway	8080

### 3️⃣ Access Swagger

👉 Open in browser:

http://localhost:8080/api-docs

## 🔍 Features
- ✅ Microservices architecture
- ✅ API Gateway routing
- ✅ Swagger API documentation
- ✅ Full CRUD operations
- ✅ Partial updates (PUT)
- ✅ Independent services
- ✅ Centralized API access

## ✅ Validations Implemented
- Required field validation
- Data type validation
- Positive number validation (IDs, price, quantity)
- Enum validation (role, status)
- Nested validation (address, order items)
- Proper error handling with meaningful messages

## 🧪 Testing

The system was tested using:

- Swagger UI
- Postman

## ✔ Tested Scenarios
- Successful CRUD operations
- Missing required fields
- Invalid data types
- Negative values
- Invalid enum values
- Invalid JSON format

## 🎯 Key Highlights
- Scalable and modular architecture
- Clean separation of services
- Centralized API Gateway
- Strong validation and error handling
- Easy testing via Swagger

## 📚 Conclusion

This project demonstrates how Microservices Architecture improves system scalability, flexibility, and maintainability.
The use of an API Gateway provides a unified entry point and simplifies communication between clients and services.
