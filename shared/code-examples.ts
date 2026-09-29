import type { Framework } from './framework';

interface CodeLine {
  text: string;
  tone?: 'keyword' | 'template' | 'comment';
}

interface CodeExample {
  filename: string;
  label: string;
  language: string;
  lines: CodeLine[];
}

/** Equivalent tiny components, displayed as text rather than executed. */
export const codeExamples: Record<Framework, CodeExample> = {
  react: {
    filename: 'LikeButton.tsx',
    label: 'React · JSX + hooks',
    language: 'TSX',
    lines: [
      { text: "import { useState } from 'react';", tone: 'keyword' },
      { text: '' },
      { text: 'export function LikeButton() {', tone: 'keyword' },
      { text: '  const [likes, setLikes] = useState(0);' },
      { text: '' },
      { text: '  return (' },
      { text: '    <button', tone: 'template' },
      { text: '      onClick={() => setLikes(likes + 1)}' },
      { text: '    >', tone: 'template' },
      { text: '      {likes} likes' },
      { text: '    </button>', tone: 'template' },
      { text: '  );' },
      { text: '}' },
    ],
  },
  angular: {
    filename: 'like-button.ts',
    label: 'Angular · templates + signals',
    language: 'TypeScript',
    lines: [
      { text: 'import { Component, signal }', tone: 'keyword' },
      { text: "  from '@angular/core';", tone: 'keyword' },
      { text: '' },
      { text: '@Component({', tone: 'keyword' },
      { text: "  selector: 'like-button'," },
      { text: '  template: `' },
      { text: '    <button (click)="like()">', tone: 'template' },
      { text: '      {{ likes() }} likes' },
      { text: '    </button>`', tone: 'template' },
      { text: '})' },
      { text: 'export class LikeButton {', tone: 'keyword' },
      { text: '  likes = signal(0);' },
      { text: '  like() { this.likes.update(n => n + 1); }' },
      { text: '}' },
    ],
  },
};
