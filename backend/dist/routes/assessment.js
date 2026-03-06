"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../utils/auth");
const client_1 = require("../db/client");
const id_1 = require("../utils/id");
const time_1 = require("../utils/time");
const ai_1 = require("../services/ai");
const pdf_1 = require("../services/pdf");
exports.assessmentRouter = (0, express_1.Router)();
exports.assessmentRouter.post("/submit", auth_1.requireAuth, async (req, res) => {
    const paid = client_1.db.prepare("SELECT id FROM payments WHERE user_id = ? AND status = 'PAID' ORDER BY created_at DESC LIMIT 1").get(req.user.id);
    if (!paid)
        return res.status(402).json({ message: "Payment required" });
    const schema = zod_1.z.object({ student_profile: zod_1.z.any() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid input" });
    const userId = req.user.id;
    const assessmentId = (0, id_1.id)("asm");
    client_1.db.prepare("INSERT INTO assessments (id, user_id, student_profile_json, created_at) VALUES (?, ?, ?, ?)")
        .run(assessmentId, userId, JSON.stringify(parsed.data.student_profile), (0, time_1.nowIso)());
    const ai = await (0, ai_1.runAiCareerPrediction)(parsed.data.student_profile);
    const resultId = (0, id_1.id)("res");
    const created = (0, time_1.nowIso)();
    client_1.db.prepare("INSERT INTO results (id, user_id, assessment_id, result_json, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(resultId, userId, assessmentId, JSON.stringify(ai), created);
    const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
    const pdfFilename = `careersasa-report-${resultId}.pdf`;
    const pdfPath = await (0, pdf_1.generatePdfReport)({
        outDir: uploadsDir,
        filename: pdfFilename,
        studentProfile: parsed.data.student_profile,
        aiResult: ai,
    });
    client_1.db.prepare("UPDATE results SET pdf_path = ? WHERE id = ?").run(pdfPath, resultId);
    return res.json({ ok: true, resultId });
});
