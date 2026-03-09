import { registerRootComponent } from 'expo';
import { initGlobalErrorLogger } from './src/utils/errorLogger';

initGlobalErrorLogger();

let App;
try {
  App = require('./App').default;
} catch (error) {
  console.error('[StartupImportError] Failed to load App module:', error);
  throw error;
}

registerRootComponent(App);
