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
exports.registerInstallCommand = registerInstallCommand;
exports.installElephactor = installElephactor;
exports.promptToInstallElephactor = promptToInstallElephactor;
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const composerProject_1 = require("./composerProject");
function registerInstallCommand() {
    return vscode.commands.registerCommand(constants_1.commandIds.installElephactor, async (uri) => {
        await installElephactor(uri);
    });
}
async function installElephactor(uri) {
    const composerRoot = await (0, composerProject_1.resolveComposerRootForInstall)(uri);
    if (composerRoot === undefined) {
        vscode.window.showErrorMessage("Could not find composer.json for Elephactor installation.");
        return;
    }
    const terminal = vscode.window.createTerminal({
        name: "Elephactor Install",
        cwd: composerRoot,
    });
    terminal.show();
    terminal.sendText("composer require --dev tim-lappe/elephactor");
}
async function promptToInstallElephactor(uri) {
    const selectedAction = await vscode.window.showWarningMessage("Elephactor is not installed in this Composer project.", constants_1.installAction);
    if (selectedAction === constants_1.installAction) {
        await vscode.commands.executeCommand(constants_1.commandIds.installElephactor, uri);
    }
}
//# sourceMappingURL=installCommand.js.map