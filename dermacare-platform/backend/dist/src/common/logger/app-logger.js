"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const mask_util_1 = require("../utils/mask.util");
let AppLogger = class AppLogger extends common_1.ConsoleLogger {
    log(message, ...optionalParams) {
        super.log((0, mask_util_1.maskSensitiveInfo)(message), ...optionalParams.map(p => (0, mask_util_1.maskSensitiveInfo)(p)));
    }
    error(message, ...optionalParams) {
        super.error((0, mask_util_1.maskSensitiveInfo)(message), ...optionalParams.map(p => (0, mask_util_1.maskSensitiveInfo)(p)));
    }
    warn(message, ...optionalParams) {
        super.warn((0, mask_util_1.maskSensitiveInfo)(message), ...optionalParams.map(p => (0, mask_util_1.maskSensitiveInfo)(p)));
    }
    debug(message, ...optionalParams) {
        super.debug((0, mask_util_1.maskSensitiveInfo)(message), ...optionalParams.map(p => (0, mask_util_1.maskSensitiveInfo)(p)));
    }
    verbose(message, ...optionalParams) {
        super.verbose((0, mask_util_1.maskSensitiveInfo)(message), ...optionalParams.map(p => (0, mask_util_1.maskSensitiveInfo)(p)));
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], AppLogger);
//# sourceMappingURL=app-logger.js.map