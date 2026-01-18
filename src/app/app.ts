import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  menu = [
    { title: 'Introduction', path: '/docs/introduction.md' },
    { title: 'Getting Started', path: '/docs/getting-started.md' },
    { title: 'Configuration', path: '/docs/configuration.md' },
    { title: 'Core', path: '/docs/core.md' },
    { title: 'Auth', path: '/docs/auth.md' },
    { title: 'FAQ', path: '/docs/faq.md' },
  ];

  currentDoc = signal(this.menu[0].path);

  select(item: any) {
    this.currentDoc.set(item.path);
  }

}
