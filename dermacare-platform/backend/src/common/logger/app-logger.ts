import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { maskSensitiveInfo } from '../utils/mask.util';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  log(message: any, ...optionalParams: any[]) {
    super.log(maskSensitiveInfo(message), ...optionalParams.map(p => maskSensitiveInfo(p)));
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(maskSensitiveInfo(message), ...optionalParams.map(p => maskSensitiveInfo(p)));
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(maskSensitiveInfo(message), ...optionalParams.map(p => maskSensitiveInfo(p)));
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(maskSensitiveInfo(message), ...optionalParams.map(p => maskSensitiveInfo(p)));
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(maskSensitiveInfo(message), ...optionalParams.map(p => maskSensitiveInfo(p)));
  }
}
