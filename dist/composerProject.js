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
exports.findComposerRoot = findComposerRoot;
exports.resolveComposerRootForInstall = resolveComposerRootForInstall;
exports.findComposerRootFromDirectory = findComposerRootFromDirectory;
exports.fileExists = fileExists;
exports.isInsideOrEqual = isInsideOrEqual;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
async function findComposerRoot(uri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder === undefined) {
        return undefined;
    }
    return findComposerRootFromDirectory(path.dirname(uri.fsPath), workspaceFolder.uri.fsPath);
}
async function resolveComposerRootForInstall(uri) {
    if (uri !== undefined) {
        const composerRoot = await findComposerRoot(uri);
        if (composerRoot !== undefined) {
            return composerRoot;
        }
    }
    const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
    if (activeEditorUri !== undefined) {
        const composerRoot = await findComposerRoot(activeEditorUri);
        if (composerRoot !== undefined) {
            return composerRoot;
        }
    }
    for (const workspaceFolder of vscode.workspace.workspaceFolders ?? []) {
        const composerRoot = await findComposerRootFromDirectory(workspaceFolder.uri.fsPath, workspaceFolder.uri.fsPath);
        if (composerRoot !== undefined) {
            return composerRoot;
        }
    }
    return undefined;
}
async function findComposerRootFromDirectory(startDirectory, workspaceRoot) {
    let currentDirectory = path.resolve(startDirectory);
    const resolvedWorkspaceRoot = path.resolve(workspaceRoot);
    while (isInsideOrEqual(currentDirectory, resolvedWorkspaceRoot)) {
        if (await fileExists(path.join(currentDirectory, "composer.json"))) {
            return currentDirectory;
        }
        const parentDirectory = path.dirname(currentDirectory);
        if (parentDirectory === currentDirectory) {
            return undefined;
        }
        currentDirectory = parentDirectory;
    }
    return undefined;
}
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
function isInsideOrEqual(candidate, parent) {
    const relativePath = path.relative(parent, candidate);
    return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}
//# sourceMappingURL=composerProject.js.map