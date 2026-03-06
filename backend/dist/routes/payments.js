"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../utils/auth");
const client_1 = require("../db/client");
const id_1 = require("../utils/id");
const time_1 = require("../utils/time");
const mpesa_1 = require("../services/mpesa");
exports.paymentsRouter = (0, express_1.Router)();
exports.paymentsRouter.post("/mpesa/stkpush", auth_1.requireAuth, async (req, res) => {
    const schema = zod_1.z.object({
        phone: zod_1.z.string().min(10),
        amount: zod_1.z.number().int().positive(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid input" });
    const userId = req.user.id;
    const amount = parsed.data.amount;
    const payAmount = Number(process.env.PAY_AMOUNT_KES || 100);
    if (amount !== payAmount)
        return res.status(400).json({ message: `Amount must be ${payAmount}` });
    const paymentId = (0, id_1.id)("pay");
    const created = (0, time_1.nowIso)();
    client_1.db.prepare(`
    INSERT INTO payments (id, user_id, amount, status, method, phone, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(paymentId, userId, amount, "PENDING", "STK_PUSH", parsed.data.phone, created, created);
    const accountRef = "CareerSasa";
    const desc = "CareerSasa Assessment Payment";
    try {
        const mpesaRes = await (0, mpesa_1.stkPush)({ phone: parsed.data.phone, amount, accountRef, desc });
        const checkoutRequestId = mpesaRes?.CheckoutRequestID || null;
        client_1.db.prepare("UPDATE payments SET mpesa_checkout_request_id = ?, updated_at = ? WHERE id = ?")
            .run(checkoutRequestId, (0, time_1.nowIso)(), paymentId);
        return res.json({ ok: true, paymentId, checkoutRequestId });
    }
    catch (e) {
        client_1.db.prepare("UPDATE payments SET status = ?, updated_at = ? WHERE id = ?")
            .run("FAILED", (0, time_1.nowIso)(), paymentId);
        return res.status(500).json({ message: e?.message || "STK Push failed" });
    }
});
exports.paymentsRouter.post("/mpesa/callback", (req, res) => {
    const body = req.body;
    try {
        const stkCallback = body?.Body?.stkCallback;
        const checkoutId = stkCallback?.CheckoutRequestID;
        const resultCode = stkCallback?.ResultCode;
        const metadata = stkCallback?.CallbackMetadata?.Item || [];
        const receipt = metadata.find((x) => x.Name === "MpesaReceiptNumber")?.Value;
        const phone = metadata.find((x) => x.Name === "PhoneNumber")?.Value;
        if (checkoutId) {
            const status = resultCode === 0 ? "PAID" : "FAILED";
            client_1.db.prepare(`
        UPDATE payments
        SET status = ?, mpesa_receipt = ?, raw_callback = ?, updated_at = ?, phone = COALESCE(phone, ?)
        WHERE mpesa_checkout_request_id = ?
      `).run(status, receipt || null, JSON.stringify(body), (0, time_1.nowIso)(), phone ? String(phone) : null, checkoutId);
        }
    }
    catch {
    }
    return res.json({ ok: true });
});
exports.paymentsRouter.get("/me", auth_1.requireAuth, (req, res) => {
    const userId = req.user.id;
    const paid = client_1.db.prepare("SELECT id FROM payments WHERE user_id = ? AND status = 'PAID' ORDER BY created_at DESC LIMIT 1").get(userId);
    return res.json({ paid: Boolean(paid) });
});
