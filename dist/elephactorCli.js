"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveElephactorBinary = resolveElephactorBinary;
exports.runElephactor = runElephactor;
exports.composerRequiresElephactor = composerRequiresElephactor;
exports.resolveGlobalElephactorBinary = resolveGlobalElephactorBinary;
exports.parseComposerGlobalBinDirectoryOutput = parseComposerGlobalBinDirectoryOutput;
const node_child_process_1 = require("node:child_process");
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const composerProject_1 = require("./composerProject");
async function resolveElephactorBinary(composerRoot, configuredPath = configuredElephactorBinaryPath(), resolveGlobalBinary = resolveGlobalElephactorBinary) {
    const normalizedConfiguredPath = configuredPath.trim();
    if (normalizedConfiguredPath !== "") {
        const binaryPath = path.isAbsolute(normalizedConfiguredPath)
            ? normalizedConfiguredPath
            : path.join(composerRoot, normalizedConfiguredPath);
        return {
            binaryPath,
            configured: true,
            installed: await (0, composerProject_1.fileExists)(binaryPath),
        };
    }
    const localBinaryPath = path.join(composerRoot, "vendor", "bin", (0, constants_1.defaultElephactorBinaryName)());
    const localBinaryInstalled = (await composerRequiresElephactor(composerRoot)) && (await (0, composerProject_1.fileExists)(localBinaryPath));
    if (localBinaryInstalled) {
        return {
            binaryPath: localBinaryPath,
            configured: false,
            installed: true,
        };
    }
    const globalBinaryName = (0, constants_1.defaultElephactorBinaryName)();
    const globalBinaryPath = await resolveGlobalBinary(globalBinaryName, composerRoot);
    return {
        binaryPath: globalBinaryPath ?? globalBinaryName,
        configured: false,
        installed: globalBinaryPath !== undefined,
    };
}
async function runElephactor(binaryPath, cwd, args, outputChannel) {
    outputChannel.appendLine(`$ ${binaryPath} ${args.join(" ")}`);
    return new Promise((resolve) => {
        const childProcess = (0, node_child_process_1.spawn)(binaryPath, args, { cwd });
        childProcess.stdout.on("data", (data) => {
            outputChannel.append(data.toString());
        });
        childProcess.stderr.on("data", (data) => {
            outputChannel.append(data.toString());
        });
        childProcess.on("error", (error) => {
            outputChannel.appendLine(error.message);
            resolve(1);
        });
        childProcess.on("close", (code) => {
            resolve(code ?? 1);
        });
    });
}
async function composerRequiresElephactor(composerRoot) {
    const composerJsonPath = path.join(composerRoot, "composer.json");
    const composerJson = JSON.parse(await fs.readFile(composerJsonPath, "utf8"));
    return composerJson.require?.[constants_1.elephactorComposerPackage] !== undefined
        || composerJson["require-dev"]?.[constants_1.elephactorComposerPackage] !== undefined;
}
async function resolveGlobalElephactorBinary(binaryName, cwd, binaryAvailableOnPath = elephactorBinaryAvailableOnPath, resolveComposerGlobalBinDirectory = composerGlobalBinDirectory) {
    if (await binaryAvailableOnPath(binaryName, cwd)) {
        return binaryName;
    }
    const binDirectory = await resolveComposerGlobalBinDirectory();
    if (binDirectory === undefined) {
        return undefined;
    }
    const binaryPath = path.join(binDirectory, binaryName);
    return await (0, composerProject_1.fileExists)(binaryPath) ? binaryPath : undefined;
}
async function elephactorBinaryAvailableOnPath(binaryName, cwd) {
    return new Promise((resolve) => {
        const childProcess = (0, node_child_process_1.spawn)(binaryName, ["--version"], {
            cwd,
            shell: process.platform === "win32",
            stdio: "ignore",
        });
        childProcess.on("error", () => {
            resolve(false);
        });
        childProcess.on("close", (code) => {
            resolve(code === 0);
        });
    });
}
async function composerGlobalBinDirectory() {
    return new Promise((resolve) => {
        let stdout = "";
        const childProcess = (0, node_child_process_1.spawn)("composer", ["global", "config", "bin-dir", "--absolute"], {
            shell: process.platform === "win32",
        });
        childProcess.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        childProcess.on("error", () => {
            resolve(undefined);
        });
        childProcess.on("close", (code) => {
            const binDirectory = parseComposerGlobalBinDirectoryOutput(stdout);
            resolve(code === 0 && binDirectory !== undefined ? binDirectory : undefined);
        });
    });
}
function parseComposerGlobalBinDirectoryOutput(stdout) {
    const outputLines = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== "");
    return outputLines[outputLines.length - 1];
}
function configuredElephactorBinaryPath() {
    return vscode.workspace
        .getConfiguration(constants_1.extensionConfigurationSection)
        .get(constants_1.binaryPathConfigurationName, "");
}
//# sourceMappingURL=elephactorCli.js.map