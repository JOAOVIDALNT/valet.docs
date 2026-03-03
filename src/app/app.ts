
import { Component, signal, computed } from '@angular/core';
import { MarkdownComponent } from "ngx-markdown";


// Estrutura de módulos e submódulos
type Submodule = {
  name: string;
  markdown: string;
};

type Module = {
  name: string;
  markdown: string;
  submodules?: Submodule[];
};
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  modules: Module[] = [
    {
      name: 'Getting Started',
      markdown: '/docs/getting-started.md',
      submodules: [
        { name: 'Installation', markdown: '/docs/installation.md' },
        { name: 'Configuration', markdown: '/docs/configuration.md' },
      ],
    },
    {
      name: 'Core',
      markdown: '/docs/core.md',
    },
    {
      name: 'FAQ',
      markdown: '/docs/faq.md',
    },
  ];

  selectedModule = signal<Module | null>(this.modules[0]);
  selectedSubmodule = signal<Submodule | null>(null);

  currentMarkdown = computed(() => {
    if (this.selectedSubmodule()) {
      return this.selectedSubmodule()!.markdown;
    }
    if (this.selectedModule()) {
      return this.selectedModule()!.markdown;
    }
    return '';
  });

  selectModule(module: Module) {
    this.selectedModule.set(module);
    this.selectedSubmodule.set(null);
  }

  selectSubmodule(sub: Submodule) {
    this.selectedSubmodule.set(sub);
  }
}
