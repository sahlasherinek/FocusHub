"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const todoRoutes_1 = __importDefault(require("./routes/todoRoutes"));
const http_1 = require("http");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes Setup
app.use('/api/auth', authRoutes_1.default); // public: unified login/register
app.use('/api/todos', auth_1.auth, todoRoutes_1.default);
console.log('Connecting to:', process.env.MONGO_URI ? 'URI found' : 'MONGO_URI is undefined!');
mongoose_1.default.connect(process.env.MONGO_URI || '')
    .then(() => {
    console.log('Successfully connected to MongoDB');
    // ... rest as before
})
    .catch(err => console.error('Database connection breakdown error:', err));
// MongoDB Connection
mongoose_1.default.connect(process.env.MONGO_URI || '')
    .then(() => {
    console.log('Successfully connected to MongoDB');
    //health check route
    app.get("/health", (req, res) => {
        res.status(200).json({
            success: true,
            message: "Server is running successfully",
            timestamp: new Date().toISOString(),
        });
    });
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("SIGTERM signal received: closing HTTP server");
        server.close(() => {
            console.log("HTTP server closed");
            process.exit(0);
        });
    });
})
    .catch(err => console.error('Database connection breakdown error:', err));
