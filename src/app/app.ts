import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MarkdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('valet.web');
  content = '```csharp\nConsole.WriteLine("Hello, World!");\n```';
}
