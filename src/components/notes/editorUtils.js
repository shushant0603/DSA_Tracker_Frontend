import { mergeAttributes, Node } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';

export const lowlight = createLowlight(common);
export const emptyDocument = { type: 'doc', content: [{ type: 'paragraph' }] };
export const TableBlock = Node.create({
  name: 'table',
  group: 'block',
  content: 'tableRow+',
  isolating: true,
  parseHTML: () => [{ tag: 'table' }],
  renderHTML: ({ HTMLAttributes }) => ['table', mergeAttributes(HTMLAttributes, { class: 'notes-table' }), ['tbody', 0]]
});

export const TableRow = Node.create({
  name: 'tableRow',
  content: '(tableCell | tableHeader)+',
  parseHTML: () => [{ tag: 'tr' }],
  renderHTML: ({ HTMLAttributes }) => ['tr', HTMLAttributes, 0]
});

export const TableCell = Node.create({
  name: 'tableCell',
  content: 'paragraph+',
  isolating: true,
  parseHTML: () => [{ tag: 'td' }],
  renderHTML: ({ HTMLAttributes }) => ['td', HTMLAttributes, 0]
});

export const TableHeader = Node.create({
  name: 'tableHeader',
  content: 'paragraph+',
  isolating: true,
  parseHTML: () => [{ tag: 'th' }],
  renderHTML: ({ HTMLAttributes }) => ['th', HTMLAttributes, 0]
});

export const ImageBlock = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes: () => ({
    src: { default: null },
    alt: { default: '' },
    title: { default: null }
  }),
  parseHTML: () => [{ tag: 'img[src]' }],
  renderHTML: ({ HTMLAttributes }) => ['img', mergeAttributes(HTMLAttributes, { class: 'notes-image' })]
});

export const slashCommands = [
  { id: 'paragraph', label: 'Text', detail: 'Start writing with plain text', icon: 'T', keywords: 'paragraph plain text' },
  { id: 'heading1', label: 'Heading 1', detail: 'Large section heading', icon: 'H₁', keywords: 'title heading' },
  { id: 'heading2', label: 'Heading 2', detail: 'Medium section heading', icon: 'H₂', keywords: 'heading' },
  { id: 'heading3', label: 'Heading 3', detail: 'Small section heading', icon: 'H₃', keywords: 'heading' },
  { id: 'heading4', label: 'Heading 4', detail: 'Smallest section heading', icon: 'H₄', keywords: 'heading' },
  { id: 'bullet', label: 'Bulleted list', detail: 'Create a simple list', icon: '•', keywords: 'unordered list' },
  { id: 'numbered', label: 'Numbered list', detail: 'Create a numbered list', icon: '1.', keywords: 'ordered list' },
  { id: 'todo', label: 'To-do list', detail: 'Track tasks with checkboxes', icon: '☑', keywords: 'task checklist checkbox' },
  { id: 'table', label: 'Table', detail: 'Insert a simple editable table', icon: '▦', keywords: 'grid rows columns database' },
  { id: 'image', label: 'Image', detail: 'Embed an image from a URL', icon: '▧', keywords: 'picture photo media' },
  { id: 'quote', label: 'Quote', detail: 'Capture a quotation', icon: '❝', keywords: 'blockquote' },
  { id: 'code', label: 'Code block', detail: 'Write and format code', icon: '</>', keywords: 'programming snippet' },
  { id: 'divider', label: 'Divider', detail: 'Add a horizontal separator', icon: '—', keywords: 'horizontal rule separator' },
  { id: 'link', label: 'Link', detail: 'Add a link to selected text', icon: '↗', keywords: 'url hyperlink' },
  { id: 'clear', label: 'Clear formatting', detail: 'Reset this block to plain text', icon: 'Tx', keywords: 'reset formatting' }
];
export const noteTemplates = [
  {
    id: 'concept',
    label: 'DSA concept',
    description: 'Organize an algorithm or data structure',
    title: 'DSA Concept',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Core idea' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'How it works' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Complexity' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Time:  ·  Space: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Example and edge cases' }] },
        { type: 'paragraph' }
      ]
    }
  },
  {
    id: 'problem',
    label: 'Problem solution',
    description: 'Capture an approach and complexity',
    title: 'Problem Solution',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Problem' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Approach' }] },
        { type: 'paragraph' },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Complexity' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Time:  ·  Space: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Code and notes' }] },
        { type: 'paragraph' }
      ]
    }
  }
];

export const createTableContent = (rows = 3, columns = 3) => ({
  type: 'table',
  content: Array.from({ length: rows }, (_, rowIndex) => ({
    type: 'tableRow',
    content: Array.from({ length: columns }, () => ({
      type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
      content: [{ type: 'paragraph' }]
    }))
  }))
});

const inlineMarkdown = (node) => {
  if (node.type === 'hardBreak') return '\n';
  if (node.type !== 'text') return '';
  let value = node.text || '';
  (node.marks || []).forEach((mark) => {
    if (mark.type === 'bold') value = `**${value}**`;
    if (mark.type === 'italic') value = `*${value}*`;
    if (mark.type === 'strike') value = `~~${value}~~`;
    if (mark.type === 'code') value = `\`${value}\``;
    if (mark.type === 'link') value = `[${value}](${mark.attrs?.href || ''})`;
  });
  return value;
};

export const nodeMarkdown = (node) => {
  const children = node.content || [];
  const inline = children.map(inlineMarkdown).join('');
  const blocks = () => children.map(nodeMarkdown).filter(Boolean).join('\n\n');
  if (node.type === 'doc') return blocks();
  if (node.type === 'paragraph') return inline;
  if (node.type === 'heading') return `${'#'.repeat(node.attrs?.level || 1)} ${inline}`;
  if (node.type === 'blockquote') return blocks().split('\n').map((line) => `> ${line}`).join('\n');
  if (node.type === 'bulletList') return children.map((item) => `- ${nodeMarkdown(item).replace(/\n/g, '\n  ')}`).join('\n');
  if (node.type === 'orderedList') {
    const start = node.attrs?.start || 1;
    return children.map((item, index) => `${start + index}. ${nodeMarkdown(item).replace(/\n/g, '\n   ')}`).join('\n');
  }
  if (node.type === 'taskList') return children.map((item) => `- [${item.attrs?.checked ? 'x' : ' '}] ${nodeMarkdown(item).replace(/\n/g, '\n  ')}`).join('\n');
  if (node.type === 'table') {
    const rows = children.map((row) => (row.content || []).map(nodeMarkdown));
    const columnCount = Math.max(0, ...rows.map((row) => row.length));
    if (!columnCount) return '';
    const formatRow = (row) => `| ${Array.from({ length: columnCount }, (_, index) => (row[index] || '').replace(/\|/g, '\\|').replace(/\n/g, '<br>')).join(' | ')} |`;
    return [formatRow(rows[0]), `| ${Array(columnCount).fill('---').join(' | ')} |`, ...rows.slice(1).map(formatRow)].join('\n');
  }
  if (node.type === 'image') return `![${node.attrs?.alt || ''}](${node.attrs?.src || ''})`;
  if (node.type === 'listItem' || node.type === 'taskItem') return blocks();
  if (node.type === 'codeBlock') return `\`\`\`\n${children.map((child) => child.text || '').join('')}\n\`\`\``;
  if (node.type === 'horizontalRule') return '---';
  return blocks() || inline;
};
