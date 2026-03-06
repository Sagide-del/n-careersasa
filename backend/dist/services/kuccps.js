"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProgrammeNotes = exports.loadKuccpsProgrammes = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FILE = path_1.default.resolve(__dirname, "../../data/kuccps_programmes.json");
function loadKuccpsProgrammes() {
    try {
        const raw = fs_1.default.readFileSync(FILE, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
exports.loadKuccpsProgrammes = loadKuccpsProgrammes;
function findProgrammeNotes(programmeName) {
    const all = loadKuccpsProgrammes();
    const hit = all.find(p => p.programme.toLowerCase() === programmeName.toLowerCase());
    return hit
        ? (hit.notes + (hit.sample_cutoff ? ` (Sample cutoff: ${hit.sample_cutoff})` : ""))
        : "KUCCPS info: not found in local dataset.";
}
exports.findProgrammeNotes = findProgrammeNotes;
