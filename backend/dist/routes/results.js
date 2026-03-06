"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultsRouter = void 0;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const auth_1 = require("../utils/auth");
const client_1 = require("../db/client");
exports.resultsRouter = (0, express_1.Router)();
exports.resultsRouter.get("/:rid", auth_1.requireAuth, (req, res) => {
    const userId = req.user.id;
    const rid = req.params.rid;
    const row = client_1.db.prepare("SELECT id, result_json, pdf_path FROM results WHERE id = ? AND user_id = ?").get(rid, userId);
    if (!row)
        return res.status(404).json({ message: "Not found" });
    const base = process.env.PUBLIC_BASE_URL || "http://localhost:4000";
    let pdf_url = null;
    if (row.pdf_path) {
        const filename = path_1.default.basename(row.pdf_path);
        pdf_url = `${base}/uploads/${filename}`;
    }
    const result = JSON.parse(row.result_json);
    return res.json({ ...result, pdf_url });
});
