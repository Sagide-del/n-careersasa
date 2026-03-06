"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const init_1 = require("./db/init");
const auth_1 = require("./routes/auth");
const payments_1 = require("./routes/payments");
const assessment_1 = require("./routes/assessment");
const results_1 = require("./routes/results");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
(0, init_1.initDb)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: FRONTEND_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, morgan_1.default)("dev"));
const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
app.use("/uploads", express_1.default.static(path_1.default.resolve(uploadsDir)));
app.get("/health", (_req, res) => res.json({ ok: true, service: "careersasa-backend" }));
app.use("/auth", auth_1.authRouter);
app.use("/payments", payments_1.paymentsRouter);
app.use("/assessment", assessment_1.assessmentRouter);
app.use("/results", results_1.resultsRouter);
app.listen(PORT, () => {
    console.log(`CareerSasa backend running on http://localhost:${PORT}`);
});
