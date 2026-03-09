let initialized = false;

function normalizeError(errorLike) {
  if (errorLike instanceof Error) {
    return {
      message: errorLike.message,
      stack: errorLike.stack,
    };
  }

  if (typeof errorLike === 'string') {
    return {
      message: errorLike,
      stack: undefined,
    };
  }

  try {
    return {
      message: JSON.stringify(errorLike),
      stack: undefined,
    };
  } catch {
    return {
      message: String(errorLike),
      stack: undefined,
    };
  }
}

export const initGlobalErrorLogger = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  const nativeConsoleError = console.error.bind(console);
  const nativeConsoleWarn = console.warn.bind(console);

  console.error = (...args) => {
    nativeConsoleError('[AppError]', ...args);
  };

  console.warn = (...args) => {
    nativeConsoleWarn('[AppWarn]', ...args);
  };

  const errorUtils = globalThis?.ErrorUtils;
  if (errorUtils?.getGlobalHandler && errorUtils?.setGlobalHandler) {
    const previousHandler = errorUtils.getGlobalHandler();

    errorUtils.setGlobalHandler((error, isFatal) => {
      const normalized = normalizeError(error);
      nativeConsoleError(
        `[GlobalError][${isFatal ? 'Fatal' : 'NonFatal'}] ${normalized.message}`
      );

      if (normalized.stack) {
        nativeConsoleError(normalized.stack);
      }

      if (typeof previousHandler === 'function') {
        previousHandler(error, isFatal);
      }
    });
  }

  const target =
    typeof window !== 'undefined'
      ? window
      : typeof globalThis !== 'undefined'
        ? globalThis
        : undefined;

  if (target && typeof target.addEventListener === 'function') {
    target.addEventListener('unhandledrejection', (event) => {
      const normalized = normalizeError(event?.reason);
      nativeConsoleError(`[UnhandledPromiseRejection] ${normalized.message}`);

      if (normalized.stack) {
        nativeConsoleError(normalized.stack);
      }
    });
  }

  console.log('[ErrorLogger] Initialized');
};

export const logError = (error, context = {}) => {
  const normalized = normalizeError(error);

  const errorLog = {
    timestamp: new Date().toISOString(),
    error: normalized.message,
    stack: normalized.stack,
    context,
  };

  console.error('[ErrorLog]', errorLog);
  return errorLog;
};

export const logInfo = (message, data = {}) => {
  console.log('[Info]', message, data);
};

export const logWarning = (message, data = {}) => {
  console.warn('[Warning]', message, data);
};
