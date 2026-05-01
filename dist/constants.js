"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAction = exports.elephactorComposerPackage = exports.commandIds = exports.binaryPathConfigurationKey = exports.binaryPathConfigurationName = exports.extensionConfigurationSection = void 0;
exports.defaultElephactorBinaryName = defaultElephactorBinaryName;
exports.extensionConfigurationSection = "vscode-elephactor";
exports.binaryPathConfigurationName = "binaryPath";
exports.binaryPathConfigurationKey = `${exports.extensionConfigurationSection}.${exports.binaryPathConfigurationName}`;
exports.commandIds = {
    installElephactor: "vscode-elephactor.installElephactor",
};
exports.elephactorComposerPackage = "tim-lappe/elephactor";
exports.installAction = "Install Elephactor";
function defaultElephactorBinaryName() {
    return process.platform === "win32" ? "elephactor.bat" : "elephactor";
}
//# sourceMappingURL=constants.js.map