import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import {
  Archive, Bold, ChevronDown, ChevronRight, Code2, Copy, Download, Heart, Italic, Redo2, Undo2,
  Link as LinkIcon, PanelRight, Strikethrough, Trash2, Underline as UnderlineIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import CodeEditor from './CodeEditor';
import Whiteboard from './Whiteboard';
import {
  ImageBlock, TableBlock, TableCell, TableHeader, TableRow,
  createTableContent, emptyDocument, lowlight, nodeMarkdown, slashCommands
} from './editorUtils';

const ToolbarButton = ({ label, onClick, active, children }) => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    className={'p-2 rounded-lg ' + (active ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}
  >
    {children}
  </button>
);

const NoteEditor = ({ note, folders, saving, onSave, onDelete, onArchive, onDuplicate, setRightOpen }) => {
  const [title, setTitle] = useState(note.title || '');
  const [selectionToolbar, setSelectionToolbar] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [slashMenu, setSlashMenu] = useState(null);
  const slashMenuRef = useRef(null);
  const applySlashCommandRef = useRef(null);
  const titleInputRef = useRef(null);
  slashMenuRef.current = slashMenu;

  const syncSlashMenu = (currentEditor) => {
    const { selection } = currentEditor.state;
    if (!selection.empty || !currentEditor.isFocused) {
      setSlashMenu(null);
      return;
    }

    const textBefore = selection.$from.parent.textBetween(0, selection.$from.parentOffset, '\n', '\ufffc');
    const match = textBefore.match(/(?:^|\s)\/([^\n/]*)$/);
    if (!match) {
      setSlashMenu(null);
      return;
    }

    const slashOffset = textBefore.lastIndexOf('/');
    const from = selection.from - (textBefore.length - slashOffset);
    const caret = currentEditor.view.coordsAtPos(selection.from);
    const menuHeight = 320;
    setSlashMenu({
      from,
      to: selection.to,
      query: match[1].trimStart(),
      x: Math.max(12, Math.min(caret.left, window.innerWidth - 340)),
      y: caret.bottom + menuHeight + 12 < window.innerHeight
        ? caret.bottom + 8
        : Math.max(8, caret.top - menuHeight - 8),
      activeIndex: 0
    });
  };

  const handleSlashKeyDown = (view, event) => {
    if (event.key === 'Tab' && !slashMenuRef.current) {
      const $from = view.state.selection.$from;
      let cellDepth = 0;
      let tableDepth = 0;
      for (let depth = $from.depth; depth > 0; depth -= 1) {
        const name = $from.node(depth).type.name;
        if (!cellDepth && (name === 'tableCell' || name === 'tableHeader')) cellDepth = depth;
        if (name === 'table') {
          tableDepth = depth;
          break;
        }
      }

      if (cellDepth && tableDepth) {
        const tableNode = $from.node(tableDepth);
        const tablePosition = $from.before(tableDepth);
        const cellPositions = [];
        tableNode.descendants((node, position) => {
          if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            cellPositions.push(tablePosition + 1 + position);
          }
        });
        const currentIndex = cellPositions.indexOf($from.before(cellDepth));
        const nextIndex = currentIndex + (event.shiftKey ? -1 : 1);
        if (currentIndex >= 0 && nextIndex < cellPositions.length && nextIndex >= 0) {
          event.preventDefault();
          const nextSelection = view.state.selection.constructor.near(
            view.state.doc.resolve(cellPositions[nextIndex] + 1)
          );
          view.dispatch(view.state.tr.setSelection(nextSelection).scrollIntoView());
          return true;
        }

        if (currentIndex === cellPositions.length - 1 && !event.shiftKey) {
          const rowType = view.state.schema.nodes.tableRow;
          const cellType = view.state.schema.nodes.tableCell;
          const firstRow = tableNode.firstChild;
          const newCells = Array.from({ length: firstRow?.childCount || 0 }, () => cellType.createAndFill());
          const newRow = newCells.length ? rowType.createAndFill(null, newCells) : null;
          if (newRow) {
            event.preventDefault();
            const insertPosition = tablePosition + tableNode.nodeSize - 1;
            const lastCellPosition = insertPosition + 1 + newCells.slice(0, -1).reduce((size, cell) => size + cell.nodeSize, 0);
            const transaction = view.state.tr.insert(insertPosition, newRow);
            const nextSelection = view.state.selection.constructor.near(transaction.doc.resolve(lastCellPosition + 1));
            view.dispatch(transaction.setSelection(nextSelection).scrollIntoView());
            return true;
          }
        }
      }
    }

    const menu = slashMenuRef.current;
    if (!menu || !view.hasFocus()) return false;

    const options = slashCommands.filter((command) => (
      `${command.label} ${command.keywords}`.toLowerCase().includes(menu.query.toLowerCase())
    ));
    if (event.key === 'ArrowDown' && options.length) {
      event.preventDefault();
      setSlashMenu((current) => current && ({ ...current, activeIndex: (current.activeIndex + 1) % options.length }));
      return true;
    }
    if (event.key === 'ArrowUp' && options.length) {
      event.preventDefault();
      setSlashMenu((current) => current && ({ ...current, activeIndex: (current.activeIndex - 1 + options.length) % options.length }));
      return true;
    }
    if (event.key === 'Enter' && options.length) {
      event.preventDefault();
      applySlashCommandRef.current?.(options[Math.min(menu.activeIndex, options.length - 1)]);
      return true;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setSlashMenu(null);
      return true;
    }
    return false;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4] }
      }),
      TableBlock,
      TableRow,
      TableCell,
      TableHeader,
      ImageBlock,
      Link.configure({ openOnClick: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Type something, or press / for commands...' }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight })
    ],
    content: note.content || emptyDocument,
    editorProps: {
      attributes: {
        spellcheck: 'true',
        class: 'focus:outline-none'
      },
      handleKeyDown: handleSlashKeyDown
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      syncSlashMenu(currentEditor);
      const { from, to, empty } = currentEditor.state.selection;
      if (empty || !currentEditor.isEditable) {
        setSelectionToolbar(null);
        return;
      }
      const start = currentEditor.view.coordsAtPos(from);
      const end = currentEditor.view.coordsAtPos(to);
      setSelectionToolbar({
        left: Math.max(160, Math.min(window.innerWidth - 160, (start.left + end.right) / 2)),
        top: Math.max(12, Math.min(start.top, end.top) - 14)
      });
    },
    onUpdate: ({ editor: currentEditor }) => {
      syncSlashMenu(currentEditor);
      onSave({ content: currentEditor.getJSON(), plainText: currentEditor.getText() });
    }
  });

  useEffect(() => {
    if (!editor) return undefined;

    const handleEditorContextMenu = (event) => {
      const editorRoot = editor.view.dom.closest('.notes-editor-root');
      if (!editorRoot?.contains(event.target)) return;

      event.preventDefault();
      event.returnValue = false;
      event.stopImmediatePropagation();
      // Right-clicks on the custom menu should keep that menu open without
      // showing the browser's native menu. Only editor content opens a menu.
      if (!editor.view.dom.contains(event.target)) return;

      const hit = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
      let blockPos = editor.state.selection.from;
      let blockSize = 1;
      if (hit) {
        const resolved = editor.state.doc.resolve(hit.pos);
        const depth = Math.max(1, resolved.depth);
        blockPos = resolved.before(depth);
        blockSize = resolved.node(depth).nodeSize;
        if (editor.state.selection.empty || editor.state.selection.from > hit.pos || editor.state.selection.to < hit.pos) {
          const selection = editor.state.selection.constructor.near(resolved);
          editor.view.dispatch(editor.state.tr.setSelection(selection));
        }
      }

      setContextMenu({
        x: Math.min(event.clientX, window.innerWidth - 300),
        y: Math.min(event.clientY, window.innerHeight - 540),
        blockPos,
        blockSize
      });
      setActiveSubmenu(null);
    };

    window.addEventListener('contextmenu', handleEditorContextMenu, true);
    return () => window.removeEventListener('contextmenu', handleEditorContextMenu, true);
  }, [editor]);

  useEffect(() => {
    setTitle(note.title || '');
    if ((note.title === 'Untitled note' || !note.title) && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(note.content || emptyDocument)) {
      editor.commands.setContent(note.content || emptyDocument);
    }
  }, [editor, note._id]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (event.key === 'Escape') {
        setContextMenu(null);
        setActiveSubmenu(null);
        setSelectionToolbar(null);
      }
    };
    window.addEventListener('keydown', closeMenus);
    return () => window.removeEventListener('keydown', closeMenus);
  }, []);

  const updateTitle = (value) => {
    setTitle(value);
    onSave({ title: value });
  };

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Paste link URL', previous);
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const exportMarkdown = () => {
    const markdown = `# ${title || 'Untitled note'}\n\n${nodeMarkdown(editor.getJSON())}\n`;
    const blobUrl = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${(title || 'untitled-note').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'untitled-note'}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const filteredSlashCommands = slashMenu
    ? slashCommands.filter((command) => `${command.label} ${command.keywords}`.toLowerCase().includes(slashMenu.query.toLowerCase()))
    : [];

  const applySlashCommand = (command) => {
    const menu = slashMenuRef.current;
    if (!editor || !menu) return;

    editor.chain().focus().deleteRange({ from: menu.from, to: menu.to }).run();
    if (command.id === 'paragraph') editor.chain().focus().setParagraph().run();
    if (command.id === 'heading1') editor.chain().focus().setNode('heading', { level: 1 }).run();
    if (command.id === 'heading2') editor.chain().focus().setNode('heading', { level: 2 }).run();
    if (command.id === 'heading3') editor.chain().focus().setNode('heading', { level: 3 }).run();
    if (command.id === 'heading4') editor.chain().focus().setNode('heading', { level: 4 }).run();
    if (command.id === 'bullet') editor.chain().focus().toggleBulletList().run();
    if (command.id === 'numbered') editor.chain().focus().toggleOrderedList().run();
    if (command.id === 'todo') editor.chain().focus().toggleTaskList().run();
    if (command.id === 'table') editor.chain().focus().insertContent(createTableContent()).run();
    if (command.id === 'quote') editor.chain().focus().toggleBlockquote().run();
    if (command.id === 'code') editor.chain().focus().toggleCodeBlock().run();
    if (command.id === 'divider') editor.chain().focus().setHorizontalRule().run();
    if (command.id === 'link') setLink();
    if (command.id === 'image') {
      const src = window.prompt('Paste an image URL');
      if (src?.trim()) editor.chain().focus().insertContent({ type: 'image', attrs: { src: src.trim(), alt: '' } }).run();
    }
    if (command.id === 'clear') editor.chain().focus().unsetAllMarks().clearNodes().run();
    setSlashMenu(null);
  };
  applySlashCommandRef.current = applySlashCommand;

  const applyBlockType = (type) => {
    if (!editor || !contextMenu) return;
    const node = editor.state.doc.nodeAt(contextMenu.blockPos);
    const from = contextMenu.blockPos + 1;
    const to = Math.max(from, contextMenu.blockPos + (node?.nodeSize || contextMenu.blockSize) - 1);
    editor.chain().focus().setTextSelection({ from, to }).run();
    const chain = editor.chain().focus();
    if (type === 'paragraph') chain.setParagraph().run();
    if (type === 'heading1') chain.setNode('heading', { level: 1 }).run();
    if (type === 'heading2') chain.setNode('heading', { level: 2 }).run();
    if (type === 'heading3') chain.setNode('heading', { level: 3 }).run();
    if (type === 'heading4') chain.setNode('heading', { level: 4 }).run();
    if (type === 'bullet') chain.toggleBulletList().run();
    if (type === 'numbered') chain.toggleOrderedList().run();
    if (type === 'todo') chain.toggleTaskList().run();
    if (type === 'quote') chain.toggleBlockquote().run();
    if (type === 'code') chain.toggleCodeBlock().run();
    setContextMenu(null);
    setActiveSubmenu(null);
  };

  const applyHighlight = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
    setContextMenu(null);
    setActiveSubmenu(null);
  };

  const duplicateBlock = () => {
    if (!contextMenu) return;
    const node = editor.state.doc.nodeAt(contextMenu.blockPos);
    if (node) {
      const transaction = editor.state.tr.insert(contextMenu.blockPos + node.nodeSize, node.copy(node.content));
      editor.view.dispatch(transaction);
    }
    setContextMenu(null);
  };

  const deleteBlock = () => {
    if (!contextMenu) return;
    const node = editor.state.doc.nodeAt(contextMenu.blockPos);
    if (node) editor.view.dispatch(editor.state.tr.delete(contextMenu.blockPos, contextMenu.blockPos + node.nodeSize));
    setContextMenu(null);
  };

  const contextStyle = contextMenu ? {
    left: Math.max(8, Math.min(contextMenu.x, window.innerWidth - 292)),
    top: Math.max(8, Math.min(contextMenu.y, window.innerHeight - 570))
  } : {};

  if (!editor) return <div className="p-8 text-slate-500">Loading editor...</div>;

  const menuButton = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] text-slate-200 hover:bg-slate-700/80 transition';
  const menuIcon = 'h-[17px] w-[17px] shrink-0 text-slate-400';

  return (
    <div className="notes-editor-root relative flex-1 flex flex-col min-w-0">
      <style>{`
        .notes-editor .tiptap { width:100%; max-width:none; min-height:55vh; outline:none; white-space:pre-wrap; overflow-wrap:anywhere; }
        .notes-editor .tiptap > * { max-width:none; }
        .notes-editor .tiptap p { margin:.55rem 0; }
        .notes-editor .tiptap > *:first-child { margin-top:0; }
        .notes-editor .tiptap:focus { outline:none; }
        .notes-editor .tiptap h1,.notes-editor .tiptap h2,.notes-editor .tiptap h3,.notes-editor .tiptap h4 { color:#f8fafc; font-weight:700; line-height:1.25; margin:1.35em 0 .45em; }
        .notes-editor .tiptap h1 { font-size:2rem; } .notes-editor .tiptap h2 { font-size:1.55rem; }
        .notes-editor .tiptap h3 { font-size:1.25rem; } .notes-editor .tiptap h4 { font-size:1.1rem; }
        .notes-editor .tiptap ul,.notes-editor .tiptap ol { padding-left:1.5rem; margin:.65rem 0; }
        .notes-editor .tiptap blockquote { border-left:3px solid #8b5cf6; padding-left:1rem; color:#cbd5e1; margin:1rem 0; }
        .notes-editor .tiptap pre { background:#111827; border:1px solid #334155; border-radius:12px; padding:1rem; overflow-x:auto; }
        .notes-editor .tiptap code { background:#1e293b; border-radius:4px; padding:.12rem .3rem; }
        .notes-editor .tiptap pre code { background:transparent; padding:0; }
        .notes-editor .notes-table { width:100%; border-collapse:collapse; margin:1rem 0; table-layout:fixed; }
        .notes-editor .notes-table td,.notes-editor .notes-table th { min-width:7rem; border:1px solid #475569; padding:.65rem .75rem; vertical-align:top; }
        .notes-editor .notes-table th { background:#1e293b; color:#f8fafc; font-weight:600; }
        .notes-editor .notes-table p { margin:.15rem 0; }
        .notes-editor .notes-image { display:block; max-width:100%; height:auto; border-radius:12px; margin:1rem 0; }
        .notes-context-menu { scrollbar-width:thin; scrollbar-color:#475569 transparent; }
      `}</style>

      <div className="notes-editor-header h-12 shrink-0 flex items-center justify-end gap-2 px-6 text-sm text-slate-400">
        <span className="mr-auto flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <select
            aria-label="Move page to folder"
            value={note.folder?._id || note.folder || ''}
            onChange={(event) => onSave({ folder: event.target.value || null })}
            className="max-w-36 truncate bg-transparent text-xs text-slate-400 outline-none hover:text-slate-200"
          >
            <option value="" className="bg-slate-900">My Notes</option>
            {folders.map((folder) => <option key={folder._id} value={folder._id} className="bg-slate-900">{folder.name}</option>)}
          </select>
          <span className="text-slate-700">·</span><span className="shrink-0">{saving ? 'Saving…' : 'Saved'}</span>
        </span>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30" title="Undo"><Undo2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30" title="Redo"><Redo2 className="h-4 w-4" /></button>
        <button onClick={() => setRightOpen(true)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100" title="Page properties"><PanelRight className="w-4 h-4" /></button>
        <button onClick={() => onSave({ isFavorite: !note.isFavorite })} className={`p-2 rounded-lg ${note.isFavorite ? 'text-rose-500' : 'text-slate-400'} hover:text-rose-500`} title="Favorite"><Heart className="w-4 h-4" /></button>
        <button onClick={exportMarkdown} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100" title="Export as Markdown"><Download className="w-4 h-4" /></button>
        <button onClick={onDuplicate} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100" title="Duplicate page"><Copy className="w-4 h-4" /></button>
        <button onClick={onArchive} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100" title={note.isArchived ? 'Restore page from archive' : 'Archive page'}><Archive className="w-4 h-4" /></button>
        <button onClick={onDelete} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-400" title="Move to trash"><Trash2 className="w-4 h-4" /></button>
      </div>

      <input ref={titleInputRef} value={title} onChange={(event) => updateTitle(event.target.value)} className="notes-title block w-full max-w-none mx-0 text-[40px] leading-tight font-bold tracking-tight bg-transparent outline-none px-8 sm:px-12 pt-10 pb-5 text-slate-100 placeholder-slate-600" placeholder="Untitled note" />

      <div className="notes-document-scroll flex-1 min-h-0 overflow-y-auto px-0 pb-20">
        <EditorContent
          editor={editor}
          className="notes-editor w-full max-w-none min-h-[55vh] text-slate-200 text-[16px] leading-8 px-8 sm:px-12"
        />

        {slashMenu && (
          <div
            role="listbox"
            aria-label="Insert a block"
            className="fixed z-[95] w-[320px] max-h-[min(62vh,360px)] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/50"
            style={{ left: slashMenu.x, top: slashMenu.y }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {slashMenu.query ? `Blocks matching “${slashMenu.query}”` : 'Add a block'}
            </p>
            {filteredSlashCommands.length ? filteredSlashCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                role="option"
                aria-selected={slashMenu.activeIndex === index}
                onMouseEnter={() => setSlashMenu((current) => current && ({ ...current, activeIndex: index }))}
                onClick={() => applySlashCommand(command)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${slashMenu.activeIndex === index ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70'}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-300">{command.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium">{command.label}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">{command.detail}</span>
                </span>
              </button>
            )) : (
              <p className="px-3 py-5 text-center text-xs text-slate-500">No matching blocks</p>
            )}
            <p className="border-t border-slate-800 px-2 pt-2 mt-1 text-[10px] text-slate-500">↑ ↓ to navigate · Enter to insert · Esc to close</p>
          </div>
        )}

        {selectionToolbar && (
          <div
            className="fixed z-[80] -translate-x-1/2 -translate-y-full flex items-center gap-1 rounded-xl border border-slate-700 bg-[#252525] p-1.5 shadow-2xl shadow-black/50"
            style={{ left: selectionToolbar.left, top: selectionToolbar.top }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <button type="button" onClick={() => setActiveSubmenu(activeSubmenu === 'textStyle' ? null : 'textStyle')} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-100 hover:bg-white/10">
              <span className="text-base">T</span><span>{editor.isActive('heading', { level: 1 }) ? 'Heading 1' : editor.isActive('heading', { level: 2 }) ? 'Heading 2' : editor.isActive('heading', { level: 3 }) ? 'Heading 3' : 'Normal text'}</span><ChevronDown className="h-3.5 w-3.5" />
            </button>
            <span className="mx-1 h-6 w-px bg-slate-600" />
            <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code2 className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton label="Highlight" active={editor.isActive('highlight')} onClick={() => applyHighlight('#FDE68A')}><span className="rounded bg-amber-300 px-1 text-xs font-bold text-slate-900">A</span></ToolbarButton>
            <ToolbarButton label="Add link" onClick={setLink}><LinkIcon className="h-4 w-4" /></ToolbarButton>
            {activeSubmenu === 'textStyle' && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-slate-700 bg-[#252525] p-1.5 shadow-2xl">
                {[
                  ['Normal text', () => editor.chain().focus().setParagraph().run()],
                  ['Heading 1', () => editor.chain().focus().setNode('heading', { level: 1 }).run()],
                  ['Heading 2', () => editor.chain().focus().setNode('heading', { level: 2 }).run()],
                  ['Heading 3', () => editor.chain().focus().setNode('heading', { level: 3 }).run()],
                  ['Heading 4', () => editor.chain().focus().setNode('heading', { level: 4 }).run()],
                  ['Quote', () => editor.chain().focus().toggleBlockquote().run()],
                  ['Code', () => editor.chain().focus().toggleCodeBlock().run()]
                ].map(([label, action]) => <button key={label} type="button" onClick={() => { action(); setActiveSubmenu(null); }} className={menuButton}>{label}</button>)}
              </div>
            )}
          </div>
        )}

        {contextMenu && (
          <>
            <button className="fixed inset-0 z-[89] cursor-default" aria-label="Close context menu" onClick={() => { setContextMenu(null); setActiveSubmenu(null); }} />
            <div className="notes-context-menu fixed z-[90] w-[276px] max-h-[min(72vh,620px)] overflow-y-auto rounded-xl border border-[#414141] bg-[#252525] p-1.5 shadow-2xl shadow-black/60" style={contextStyle} onMouseDown={(event) => event.preventDefault()}>
              <button type="button" onMouseEnter={() => setActiveSubmenu('turnInto')} onClick={() => setActiveSubmenu(activeSubmenu === 'turnInto' ? null : 'turnInto')} className={`${menuButton} justify-between bg-white/[0.06]`}>
                <span className="flex items-center gap-3"><span className="text-lg text-slate-300">T</span>Turn into</span><ChevronRight className={menuIcon} />
              </button>
              {activeSubmenu === 'turnInto' && (
                <div className="my-1 rounded-lg border border-slate-600 bg-[#303030] p-1">
                  {[
                    ['Text', 'paragraph'], ['Heading 1', 'heading1'], ['Heading 2', 'heading2'], ['Heading 3', 'heading3'], ['Heading 4', 'heading4'],
                    ['Bulleted list', 'bullet'], ['Numbered list', 'numbered'], ['To-do list', 'todo'], ['Quote', 'quote'], ['Code', 'code']
                  ].map(([label, type], index) => <button key={type} type="button" onClick={() => applyBlockType(type)} className={menuButton}><span className="w-6 text-center text-slate-400">{['T','H₁','H₂','H₃','H₄','•','1.','☑','❝','</>'][index]}</span>{label}</button>)}
                </div>
              )}

              <button type="button" onMouseEnter={() => setActiveSubmenu('color')} onClick={() => setActiveSubmenu(activeSubmenu === 'color' ? null : 'color')} className={`${menuButton} justify-between`}>
                <span className="flex items-center gap-3"><span className="flex h-[17px] w-[17px] items-center justify-center rounded border border-slate-500 text-[11px]">A</span>Color</span><ChevronRight className={menuIcon} />
              </button>
              {activeSubmenu === 'color' && (
                <div className="my-1 rounded-lg border border-slate-600 bg-[#303030] p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Highlight color</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      ['#FDE68A', 'Yellow'], ['#BBF7D0', 'Green'], ['#BFDBFE', 'Blue'], ['#FBCFE8', 'Pink'], ['#DDD6FE', 'Purple'],
                      ['#FED7AA', 'Orange'], ['#E5E7EB', 'Gray'], ['#FCA5A5', 'Red'], ['#A7F3D0', 'Mint'], ['#C4B5FD', 'Violet']
                    ].map(([color, label]) => <button key={color} type="button" title={label} onClick={() => applyHighlight(color)} className="h-7 w-7 rounded-md border border-white/20 hover:scale-110 transition" style={{ backgroundColor: color }} />)}
                  </div>
                  <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setContextMenu(null); setActiveSubmenu(null); }} className="mt-3 w-full rounded-md px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-700">Default / remove highlight</button>
                </div>
              )}

              <div className="my-1 border-t border-[#414141]" />
              <button type="button" onClick={duplicateBlock} className={menuButton}><span className={menuIcon}>▢</span>Duplicate</button>
              <button type="button" onClick={() => { const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n'); navigator.clipboard?.writeText(text); setContextMenu(null); toast.success('Page text copied'); }} className={menuButton}><span className={menuIcon}>↗</span>Copy page text</button>
              <button type="button" onClick={() => { editor.chain().focus().unsetAllMarks().clearNodes().run(); setContextMenu(null); }} className={menuButton}><span className={menuIcon}>Tx</span>Clear formatting</button>
              <div className="my-1 border-t border-[#414141]" />
              <button type="button" onClick={deleteBlock} className={`${menuButton} text-rose-300 hover:bg-rose-500/10`}><Trash2 className="h-[17px] w-[17px]" />Delete block</button>
            </div>
          </>
        )}

        <div className="w-full max-w-none mt-12 space-y-8 px-8 sm:px-12">
          <Whiteboard initialData={note.whiteboard} onChange={(whiteboard) => onSave({ whiteboard })} />
          {(note.codeBlocks || []).map((block, index) => (
            <div key={`${block.title}-${index}`} className="rounded-xl overflow-hidden border border-slate-700">
              <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
                <input value={block.title} onChange={(event) => { const codeBlocks = [...(note.codeBlocks || [])]; codeBlocks[index] = { ...codeBlocks[index], title: event.target.value }; onSave({ codeBlocks }); }} className="bg-transparent text-sm text-slate-200 outline-none" />
                <select value={block.language} onChange={(event) => { const codeBlocks = [...(note.codeBlocks || [])]; codeBlocks[index] = { ...codeBlocks[index], language: event.target.value }; onSave({ codeBlocks }); }} className="bg-slate-800 text-xs text-slate-200 rounded px-2 py-1">
                  {['cpp', 'python', 'java', 'javascript', 'sql'].map((language) => <option key={language}>{language}</option>)}
                </select>
              </div>
              <CodeEditor value={block.code} language={block.language} onChange={(code) => { const codeBlocks = [...(note.codeBlocks || [])]; codeBlocks[index] = { ...codeBlocks[index], code }; onSave({ codeBlocks }); }} />
            </div>
          ))}
          <button type="button" className="btn-secondary text-sm" onClick={() => onSave({ codeBlocks: [...(note.codeBlocks || []), { title: 'Code', language: 'cpp', code: '' }] })}>+ Add code block</button>
        </div>
      </div>
      <div className="px-8 py-2 text-xs text-slate-500/80">{editor.storage.characterCount.words()} words · {editor.storage.characterCount.characters()} characters</div>
    </div>
  );
};

export default NoteEditor;

