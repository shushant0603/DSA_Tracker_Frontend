import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';

const languageExtensions = { cpp, java, javascript, python, sql };

const CodeEditor = ({ value, language = 'cpp', onChange }) => {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const languageExtension = languageExtensions[language]?.() || cpp();
    const state = EditorState.create({
      doc: value || '',
      extensions: [
        lineNumbers(),
        keymap.of([...defaultKeymap, indentWithTab]),
        oneDark,
        languageExtension,
        EditorView.theme({
          '&': { backgroundColor: '#111827', color: '#e5e7eb', minHeight: '240px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        })
      ]
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => view.destroy();
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === view.state.doc.toString()) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value || '' } });
  }, [value]);

  return <div ref={containerRef} className="rounded-b-xl overflow-hidden" />;
};

export default CodeEditor;
