"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.id = id;
const crypto_1 = __importDefault(require("crypto"));
function id(prefix) {
    return prefix + "_" + crypto_1.default.randomBytes(12).toString("hex");
}
