import { Component, signal, computed, HostListener } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

const MOBILE_NAV_MAX_WIDTH_PX = 768;

// Estrutura de módulos e submódulos
type Submodule = {
  name: string;
  markdown: string;
};

type DocModule = {
  name: string;
  markdown: string;
  submodules?: Submodule[];
};
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  preserveWhitespaces: true
})
export class App {
  modules: DocModule[] = [
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
      name: 'Auth',
      markdown: '/docs/auth.md',
    },
    {
      name: 'API Reference',
      markdown: '/docs/api-reference.md',
    },
    {
      name: 'FAQ',
      markdown: '/docs/faq.md',
    },
  ];

  markdown = `
  # Titulo 1


  ## Titulo 2
  `


  selectedModule = signal<DocModule | null>(this.modules[0]);
  selectedSubmodule = signal<Submodule | null>(null);

  /** Sidebar drawer aberto (só relevante em viewport estreita). */
  navOpen = signal(false);

  currentMarkdown = computed(() => {
    if (this.selectedSubmodule()) {
      return this.selectedSubmodule()!.markdown;
    }
    if (this.selectedModule()) {
      return this.selectedModule()!.markdown;
    }
    return '';
  });

  selectModule(module: DocModule) {
    this.selectedModule.set(module);
    this.selectedSubmodule.set(null);
    this.closeNav();
  }

  selectSubmodule(sub: Submodule) {
    this.selectedSubmodule.set(sub);
    this.closeNav();
  }

  toggleNav() {
    this.navOpen.update((v) => !v);
  }

  closeNav() {
    this.navOpen.set(false);
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (typeof window !== 'undefined' && window.innerWidth > MOBILE_NAV_MAX_WIDTH_PX) {
      this.navOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.navOpen()) {
      this.closeNav();
    }
  }
}
