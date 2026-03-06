"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
exports.mpesaPassword = mpesaPassword;
exports.stkPush = stkPush;
const axios_1 = __importDefault(require("axios"));
function baseUrl() {
    const env = (process.env.MPESA_ENV || "sandbox").toLowerCase();
    return env === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
}
async function getAccessToken() {
    const key = process.env.MPESA_CONSUMER_KEY || "";
    const secret = process.env.MPESA_CONSUMER_SECRET || "";
    if (!key || !secret)
        throw new Error("MPESA_CONSUMER_KEY/SECRET missing");
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const res = await axios_1.default.get(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` },
    });
    return res.data.access_token;
}
function mpesaPassword(timestamp) {
    const shortcode = process.env.MPESA_SHORTCODE || "";
    const passkey = process.env.MPESA_PASSKEY || "";
    const raw = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(raw).toString("base64");
}
async function stkPush(opts) {
    const token = await getAccessToken();
    const shortcode = process.env.MPESA_SHORTCODE || "";
    const callback = process.env.MPESA_CALLBACK_URL || "";
    if (!shortcode || !callback)
        throw new Error("MPESA_SHORTCODE or MPESA_CALLBACK_URL missing");
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const password = mpesaPassword(timestamp);
    const body = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: opts.amount,
        PartyA: opts.phone,
        PartyB: shortcode,
        PhoneNumber: opts.phone,
        CallBackURL: callback,
        AccountReference: opts.accountRef,
        TransactionDesc: opts.desc,
    };
    const res = await axios_1.default.post(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, body, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
