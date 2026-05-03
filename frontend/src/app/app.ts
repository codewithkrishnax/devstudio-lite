import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  WindowMinimise,
  WindowMaximise,
  WindowUnmaximise,
  WindowIsMaximised,
Quit,
WindowReload
} from "../../wailsjs/runtime/runtime";

export interface Tool {
  icon: string;
  title: string;
  tool: string;
}

const TOOLS_JSON_URL =
  'https://raw.githubusercontent.com/codewithkrishnax/template-store/main/tool.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  tools = signal<Tool[]>([]);
  loadingTools = signal(true);
  loadError = signal<string | null>(null);

  selectedTool = signal<Tool | null>(null);
  isDark = signal(true);
  collapsed = signal(false);
  iframeLoading = signal(false);
  safeUrl = signal<SafeResourceUrl | null>(null);
  isMax = signal(false);

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {}

  async ngOnInit() {
    this.http.get<Tool[]>(TOOLS_JSON_URL).subscribe({
      next: (data) => {
        this.tools.set(data);
        this.loadingTools.set(false);
      },
      error: (err) => {
        this.loadError.set('Failed to load tools. Check your connection.');
        this.loadingTools.set(false);
        console.error('Tools fetch error:', err);
      }
    });

    // this.isMax.set(await WindowIsMaximised());
  }

async selectTool(tool: Tool) {
  if (this.selectedTool()?.title === tool.title) return;

  this.iframeLoading.set(true);
  var errorFlag = false

  const url = `https://codewithkrishnax.github.io/${tool.tool}/`;

  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-cache"
    });

    if (!res.ok) {
      this.safeUrl.set(null);
      this.selectedTool.set(null);
      this.iframeLoading.set(false);
      return;
    }

    this.safeUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
    );
    this.selectedTool.set(tool);
    errorFlag = false;

  } catch {
    errorFlag = true;
    this.loadError.set('Failed to load tools. Check your connection.');
     this.safeUrl.set(null);
    this.selectedTool.set(null);
    this.iframeLoading.set(false);
  }
  finally {
   
    if (errorFlag) {
      this.loadError.set('Failed to load tools. Check your connection.');
    }
    else {
      this.loadError.set(null);
      errorFlag = false;
    }
  }
}

  // selectTool(tool: Tool) {
  //   if (this.selectedTool()?.title === tool.title) return;
  //   this.iframeLoading.set(true);
  //   // alert(JSON.stringify(tool));
  //   const url = `https://codewithkrishnax.github.io/${tool.tool}/`
  //   this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  //   this.selectedTool.set(tool);
  // }

  onIframeLoad() {
    this.iframeLoading.set(false);
  }

  toggleTheme() {
    this.isDark.update(v => !v);
  }

  toggleCollapse() {
    this.collapsed.update(v => !v);
  }

  async minimize() {
  await WindowMinimise();
  }
  
  async reload() { 
    await WindowReload();
  }

async maximize() {
  

  if (this.isMax()) {
    await WindowUnmaximise();
    this.isMax.set(false);
  } else {
    await WindowMaximise();
    this.isMax.set(true);
  }

  // this.isMax.set(await WindowIsMaximised());
}

async close() {
  await Quit();
}
}