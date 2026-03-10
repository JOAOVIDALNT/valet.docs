import { ApplicationConfig, provideBrowserGlobalErrorListeners, SecurityContext } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideMarkdown, MARKED_OPTIONS } from 'ngx-markdown';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideMarkdown({
      loader: HttpClient, 
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: {
          breaks: true,
          gfm: true
        },
      }
    })
  ]
};
