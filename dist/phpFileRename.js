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
exports.registerPhpFileRenameHandler = registerPhpFileRenameHandler;
exports.handleRenamedFile = handleRenamedFile;
exports.buildRenameCommandSets = buildRenameCommandSets;
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const composerProject_1 = require("./composerProject");
const elephactorCli_1 = require("./elephactorCli");
const installCommand_1 = require("./installCommand");
function registerPhpFileRenameHandler(outputChannel) {
    return vscode.workspace.onDidRenameFiles(async (event) => {
        for (const file of event.files) {
            await handleRenamedFile(file, outputChannel);
        }
    });
}
async function handleRenamedFile(file, outputChannel) {
    if (!isPhpFile(file.oldUri) && !isPhpFile(file.newUri)) {
        return;
    }
    const composerRoot = await (0, composerProject_1.findComposerRoot)(file.newUri);
    if (composerRoot === undefined) {
        vscode.window.showWarningMessage("Could not find composer.json for renamed PHP file.");
        return;
    }
    const binary = await (0, elephactorCli_1.resolveElephactorBinary)(composerRoot);
    if (!binary.installed) {
        await handleMissingBinary(file.newUri, binary);
        return;
    }
    const commandSets = buildRenameCommandSets(file.oldUri.fsPath, file.newUri.fsPath);
    for (const args of commandSets) {
        const exitCode = await (0, elephactorCli_1.runElephactor)(binary.binaryPath, composerRoot, args, outputChannel);
        if (exitCode !== 0) {
            vscode.window.showErrorMessage(`Elephactor failed while running ${args[0]}. See the Elephactor output for details.`);
            outputChannel.show(true);
            return;
        }
    }
}
function buildRenameCommandSets(oldFilePath, newFilePath) {
    const oldDirectory = path.dirname(oldFilePath);
    const newDirectory = path.dirname(newFilePath);
    const oldClassName = path.basename(oldFilePath, path.extname(oldFilePath));
    const newClassName = path.basename(newFilePath, path.extname(newFilePath));
    const directoryChanged = oldDirectory !== newDirectory;
    const classNameChanged = oldClassName !== newClassName;
    const commandSets = [];
    if (directoryChanged) {
        commandSets.push(["class:move", newFilePath, newDirectory, "--skip-file-move"]);
    }
    if (classNameChanged) {
        commandSets.push(["class:rename", oldClassName, newClassName, "--skip-file-rename"]);
    }
    return commandSets;
}
async function handleMissingBinary(uri, binary) {
    if (binary.configured) {
        vscode.window.showErrorMessage(`Configured Elephactor binary does not exist: ${binary.binaryPath}`);
        return;
    }
    await (0, installCommand_1.promptToInstallElephactor)(uri);
}
function isPhpFile(uri) {
    return uri.scheme === "file" && path.extname(uri.fsPath).toLowerCase() === ".php";
}
//# sourceMappingURL=phpFileRename.js.map