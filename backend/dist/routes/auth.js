"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const client_1 = require("../db/client");
const id_1 = require("../utils/id");
const time_1 = require("../utils/time");
const auth_1 = require("../utils/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    const { name, email, password } = parsed.data;
    const exists = client_1.db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists)
        return res.status(409).json({ message: "Email already registered" });
    const userId = (0, id_1.id)("usr");
    const hash = bcryptjs_1.default.hashSync(password, 10);
    client_1.db.prepare("INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)").run(userId, name, email, hash, (0, time_1.nowIso)());
    return res.json({ ok: true });
});
exports.authRouter.post("/login", (req, res) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid input" });
    const { email, password } = parsed.data;
    const user = client_1.db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email);
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = bcryptjs_1.default.compareSync(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = (0, auth_1.signToken)({ id: user.id, email: user.email });
    return res.json({ token });
});
