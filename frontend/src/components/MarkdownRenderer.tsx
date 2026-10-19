'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function autoBoldDefinitionsAndHeadings(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const processedLines = lines.map((line) => {
    // 1. If line is a markdown heading (e.g. ### Heading), bold the heading title
    const headingMatch = line.match(/^(#{1,6}\s+)(.*)$/);
    if (headingMatch) {
      const prefix = headingMatch[1];
      const headingText = headingMatch[2].trim();
      if (!headingText.startsWith('**') && !headingText.endsWith('**')) {
        return `${prefix}**${headingText}**`;
      }
      return line;
    }

    // 2. Bold explicit definition/concept prefixes: e.g. "Definition:", "Key Term:", "Overview:", etc.
    const defPrefixRegex = /^(\s*(?:[-*•]|\d+\.)?\s*)(Definition(?:\s+of\s+[^:]+)?|Key Concept|Key Principle|Key Term|Core Principle|Core Concept|Overview|Summary|Takeaway|Core Takeaway|Conclusion|Explanation|Note|Important|Background|Mechanics|Analysis|Application|Recommendation|Limitation|Hypothesis|Finding|Result):\s*(.*)$/i;
    const defMatch = line.match(defPrefixRegex);
    if (defMatch) {
      const bullet = defMatch[1];
      const term = defMatch[2];
      const rest = defMatch[3];
      if (!term.startsWith('**')) {
        return `${bullet}**${term}:** ${rest}`;
      }
    }

    // 3. Bold general definitions format: "Term Name: definition..." (2-35 characters title/capitalized)
    const genericTermMatch = line.match(/^(\s*(?:[-*•]|\d+\.)?\s*)([A-Z][A-Za-z0-9_\s/-]{1,35}):\s+(.*)$/);
    if (genericTermMatch) {
      const bullet = genericTermMatch[1];
      const term = genericTermMatch[2].trim();
      const rest = genericTermMatch[3];
      if (!term.startsWith('**') && !term.toLowerCase().startsWith('http') && !term.includes('://')) {
        return `${bullet}**${term}:** ${rest}`;
      }
    }

    return line;
  });

  return processedLines.join('\n');
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const formattedContent = autoBoldDefinitionsAndHeadings(content || '');

  return (
    <div className={`markdown-content text-slate-800 leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-6 mb-3 pb-2 border-b border-slate-200/90 leading-snug">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-5 mb-2.5 pb-1 border-b border-slate-100 leading-snug">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 leading-snug">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-bold text-indigo-950 mt-3.5 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm text-slate-800 leading-relaxed my-2.5">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-slate-950 font-bold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-800">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-3 space-y-1.5 text-sm text-slate-800 marker:text-indigo-600">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-3 space-y-1.5 text-sm text-slate-800 marker:font-bold marker:text-indigo-600">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 text-slate-800">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/60 pl-4 pr-3 py-2 my-3.5 rounded-r-xl italic text-slate-700 text-sm">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-5 border-slate-200/90" />
          ),
          code: ({ children }) => {
            const isMultiline = String(children).includes('\n');
            if (isMultiline) {
              return (
                <pre className="p-4 my-3 rounded-2xl bg-slate-900 text-slate-100 overflow-x-auto text-xs font-mono border border-slate-800 shadow-xs">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-xs font-semibold">
                {children}
              </code>
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
