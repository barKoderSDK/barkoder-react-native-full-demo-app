/**
 * @format
 */

import { AppRegistry } from 'react-native';
import * as Sentry from '@sentry/react-native';
import App from './App';
import { name as appName } from './app.json';

Sentry.init({
  dsn: 'https://52dc0644a6c8beeebd304b02e41c71a5@o4510596069982208.ingest.de.sentry.io/4510596082368592',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

AppRegistry.registerComponent(appName, () => App);
