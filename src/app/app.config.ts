import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideMarkdown, MARKED_OPTIONS } from 'ngx-markdown';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideMarkdown(),
    {
      provide: MARKED_OPTIONS,
      useValue: {
        gfm: true,
        breaks: true
      }
    }
  ]
};
