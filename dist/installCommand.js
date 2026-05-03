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
exports.composerInstallCommand = composerInstallCommand;
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const composerProject_1 = require("./composerProject");
const installPicks = [
    {
        label: "Install globally",
        description: composerInstallCommand("global"),
        detail: "Makes the elephactor command available without adding it to each project.",
        target: "global",
    },
    {
        label: "Install as project dev dependency",
        description: composerInstallCommand("project"),
        detail: "Adds Elephactor to require-dev in the nearest Composer project.",
        target: "project",
    },
];
function registerInstallCommand() {
    return vscode.commands.registerCommand(constants_1.commandIds.installElephactor, async (uri) => {
        await installElephactor(uri);
    });
}
async function installElephactor(uri) {
    const installTarget = await selectInstallTarget();
    if (installTarget === undefined) {
        return;
    }
    const terminalOptions = {
        name: installTarget === "global" ? "Elephactor Global Install" : "Elephactor Project Install",
    };
    if (installTarget === "project") {
        const composerRoot = await (0, composerProject_1.resolveComposerRootForInstall)(uri);
        if (composerRoot === undefined) {
            vscode.window.showErrorMessage("Could not find composer.json for project Elephactor installation.");
            return;
        }
        terminalOptions.cwd = composerRoot;
    }
    const terminal = vscode.window.createTerminal({
        ...terminalOptions,
    });
    terminal.show();
    terminal.sendText(composerInstallCommand(installTarget));
}
async function promptToInstallElephactor(uri) {
    const selectedAction = await vscode.window.showWarningMessage("Elephactor is not installed. Install it globally or as a project dev dependency to enable PHP refactorings.", constants_1.installAction);
    if (selectedAction === constants_1.installAction) {
        await vscode.commands.executeCommand(constants_1.commandIds.installElephactor, uri);
    }
}
function composerInstallCommand(target) {
    if (target === "global") {
        return `composer global require ${constants_1.elephactorComposerPackage}:@dev`;
    }
    return `composer require --dev ${constants_1.elephactorComposerPackage}`;
}
async function selectInstallTarget() {
    const selectedPick = await vscode.window.showQuickPick(installPicks, {
        placeHolder: "How do you want to install Elephactor?",
    });
    return selectedPick?.target;
}
//# sourceMappingURL=installCommand.js.map