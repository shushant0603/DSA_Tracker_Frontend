import React, { useState } from 'react';
import {
  Archive, ChevronDown, ChevronRight, FilePlus2, FileText, Folder, FolderOpen, FolderPlus,
  Heart, PanelLeft, Pencil, Plus, Search, Trash2, X, Check
} from 'lucide-react';
import { noteTemplates } from './editorUtils';

const NotesSidebar = ({
  leftOpen, setLeftOpen, view, selectView, notes, folders, visibleNotes, loading,
  search, setSearch, createNewNote, selectedFolderId, startCreateFolder,
  isCreatingFolder, setIsCreatingFolder, createNewFolder, folderInputRef,
  newFolderName, setNewFolderName, folderSaving, expandedFolders, toggleFolder,
  selectFolder, renameFolder, removeFolder, activeNote, handleRestore,
  openNote, handleArchiveNote, handleDeleteNote
}) => {
  const [showNewPageMenu, setShowNewPageMenu] = useState(false);

  return (
      <aside
        className="notes-nav shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col overflow-hidden transition-[width,flex-basis] duration-200 ease-out"
        style={{
          width: leftOpen ? '260px' : '64px',
          minWidth: leftOpen ? '260px' : '64px',
          maxWidth: leftOpen ? '260px' : '64px',
          flex: leftOpen ? '0 0 260px' : '0 0 64px'
        }}
      >
        {leftOpen ? (
          <>
          <div className="px-4 pt-5 pb-4 border-b border-slate-800/90">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Workspace</p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-100">My Notes</h1>
              </div>
              <button onClick={() => setLeftOpen(false)} className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition" title="Collapse sidebar"><PanelLeft className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <button onClick={() => { setShowNewPageMenu(false); createNewNote(selectedFolderId); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 pr-10 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500">
                  <FilePlus2 className="w-4 h-4" /><span>New page</span>
                </button>
                <button type="button" onClick={() => setShowNewPageMenu((open) => !open)} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-violet-100 hover:bg-violet-500" title="New page from template" aria-label="New page from template"><ChevronDown className="h-4 w-4" /></button>
                {showNewPageMenu && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[min(280px,82vw)] rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl shadow-black/40">
                    <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Start with a template</p>
                    {noteTemplates.map((template) => (
                      <button key={template.id} type="button" onClick={() => { setShowNewPageMenu(false); createNewNote(selectedFolderId, template.id); }} className="w-full rounded-lg px-2.5 py-2 text-left hover:bg-slate-800">
                        <span className="block text-xs font-medium text-slate-200">{template.label}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">{template.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={startCreateFolder} className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition" title="Create folder"><FolderPlus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="px-3 pt-4 pb-2 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pages..." className="w-full rounded-xl border border-slate-700/80 bg-slate-800/70 pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/10" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-200" aria-label="Clear search"><X className="w-4 h-4" /></button>}
            </div>
            <div className="space-y-1">
              {[
                ['all', 'All pages', FileText],
                ['favorites', 'Favorites', Heart],
                ['archive', 'Archived', Archive],
                ['trash', 'Trash', Trash2]
              ].map(([key, label, Icon]) => (
                <button key={key} onClick={() => selectView(key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition ${view === key && !selectedFolderId ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'}`}>
                  <Icon className="w-4 h-4" /><span>{label}</span>
                  {key === 'all' && <span className="ml-auto text-[10px] text-slate-500">{notes.length}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Folders</span>
            <button onClick={startCreateFolder} className="p-1.5 rounded-md text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition" title="New folder"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3 custom-scrollbar">
            {isCreatingFolder && (
              <form onSubmit={createNewFolder} className="mx-1 mb-2 flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-slate-800/90 p-1.5">
                <Folder className="ml-1 h-4 w-4 shrink-0 text-violet-300" />
                <input ref={folderInputRef} value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { setIsCreatingFolder(false); setNewFolderName(''); } }} placeholder="Folder name" className="min-w-0 flex-1 bg-transparent px-1 py-1 text-xs text-slate-100 outline-none placeholder:text-slate-500" />
                <button type="submit" disabled={!newFolderName.trim() || folderSaving} className="rounded-md p-1 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40" title="Create folder"><Check className="h-4 w-4" /></button>
                <button type="button" onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }} className="rounded-md p-1 text-slate-500 hover:bg-slate-700 hover:text-white" title="Cancel"><X className="h-4 w-4" /></button>
              </form>
            )}

            {folders.length === 0 && !isCreatingFolder && (
              <div className="mx-2 rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center">
                <Folder className="mx-auto mb-2 h-5 w-5 text-slate-600" />
                <p className="text-xs text-slate-500">No folders yet</p>
                <button onClick={startCreateFolder} className="mt-1 text-xs font-medium text-violet-300 hover:text-violet-200">Create your first folder</button>
              </div>
            )}

            {folders.map((folder) => {
              const folderId = String(folder._id);
              const isExpanded = expandedFolders.has(folderId) || Boolean(search);
              const isSelected = String(selectedFolderId) === folderId;
              const folderNotes = visibleNotes.filter((note) => String(note.folder?._id || note.folder || '') === folderId);
              return (
                <div key={folderId} className="mb-1">
                  <div className={`group flex items-center gap-1 rounded-lg px-1 py-1 transition ${isSelected ? 'bg-slate-800/90' : 'hover:bg-slate-800/60'}`}>
                    <button onClick={() => toggleFolder(folder._id)} className="p-1 rounded text-slate-600 hover:text-slate-300" aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}>
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => selectFolder(folder._id)} className={`flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 text-left text-[13px] ${isSelected ? 'text-slate-100' : 'text-slate-300 hover:text-white'}`}>
                      {isExpanded ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-300" /> : <Folder className="h-4 w-4 shrink-0 text-amber-300" />}
                      <span className="truncate font-medium">{folder.name}</span>
                      <span className="ml-auto text-[10px] text-slate-600">{folderNotes.length}</span>
                    </button>
                    <button onClick={() => { setShowNewPageMenu(false); createNewNote(folder._id); }} className="mr-1 rounded p-1 text-slate-600 opacity-0 transition hover:bg-slate-700 hover:text-slate-100 group-hover:opacity-100" title={`New page in ${folder.name}`}><Plus className="h-3.5 w-3.5" /></button>
                    <button onClick={() => renameFolder(folder)} className="mr-1 rounded p-1 text-slate-600 opacity-0 transition hover:bg-slate-700 hover:text-slate-100 group-hover:opacity-100" title={`Rename ${folder.name}`}><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => removeFolder(folder)} className="mr-1 rounded p-1 text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100" title={`Delete ${folder.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {isExpanded && (
                    <div className="ml-[17px] mt-1 border-l border-slate-800 pl-2 space-y-0.5">
                      {folderNotes.map((note) => (
                        <div key={note._id} className={`group/note flex w-full items-center gap-1 rounded-md transition ${activeNote?._id === note._id ? 'bg-violet-500/15 text-violet-100' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}`}>
                          <button onClick={() => view === 'trash' ? handleRestore(note._id) : openNote(note._id)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-[12px]">
                            <FileText className={`h-3.5 w-3.5 shrink-0 ${activeNote?._id === note._id ? 'text-violet-300' : 'text-slate-600'}`} />
                            <span className="min-w-0 flex-1 truncate">{note.title || 'Untitled'}</span>
                            {note.isFavorite && <Heart className="h-3 w-3 shrink-0 text-rose-400" />}
                          </button>
                          {view === 'archive'
                            ? <button onClick={() => handleArchiveNote(note._id, false)} className="mr-1 rounded p-1.5 text-slate-600 opacity-0 transition hover:bg-emerald-500/10 hover:text-emerald-300 group-hover/note:opacity-100" title="Restore page from archive"><Archive className="h-3.5 w-3.5" /></button>
                            : view !== 'trash' && <button onClick={() => handleDeleteNote(note._id)} className="mr-1 rounded p-1.5 text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover/note:opacity-100" title="Move page to trash"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                      ))}
                      {folderNotes.length === 0 && <p className="px-2.5 py-2 text-[11px] text-slate-600">No pages in this folder</p>}
                    </div>
                  )}
                </div>
              );
            })}

           
            <div className="space-y-0.5">
              {visibleNotes.filter((note) => !note.folder).map((note) => (
                <div key={note._id} className={`group/note flex w-full items-center gap-1 rounded-lg transition ${activeNote?._id === note._id ? 'bg-violet-500/15 text-violet-100' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}`}>
                  <button onClick={() => view === 'trash' ? handleRestore(note._id) : openNote(note._id)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2.5 text-left text-[12px]">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    <span className="min-w-0 flex-1 truncate">{note.title || 'Untitled'}</span>
                    {note.isFavorite && <Heart className="h-3 w-3 shrink-0 text-rose-400" />}
                  </button>
                  {view === 'archive'
                    ? <button onClick={() => handleArchiveNote(note._id, false)} className="mr-1 rounded p-1.5 text-slate-600 opacity-0 transition hover:bg-emerald-500/10 hover:text-emerald-300 group-hover/note:opacity-100" title="Restore page from archive"><Archive className="h-3.5 w-3.5" /></button>
                    : view !== 'trash' && <button onClick={() => handleDeleteNote(note._id)} className="mr-1 rounded p-1.5 text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover/note:opacity-100" title="Move page to trash"><Trash2 className="h-3.5 w-3.5" /></button>}
                </div>
              ))}
            </div>
            {loading && <p className="px-3 py-4 text-xs text-slate-500">Loading pages...</p>}
            {!loading && visibleNotes.length === 0 && <p className="px-3 py-4 text-xs text-slate-500">No pages found.</p>}
          </div>
          <div className="border-t border-slate-800/90 px-4 py-3 text-[11px] text-slate-600">{notes.length} pages in workspace</div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center gap-2 py-3">
            <button
              type="button"
              onClick={() => setLeftOpen(true)}
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="h-px w-8 bg-slate-800" />
            <button onClick={() => { selectView('all'); setLeftOpen(true); }} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${view === 'all' ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title="All pages">
              <FileText className="h-4 w-4" />
            </button>
            <button onClick={() => { selectView('favorites'); setLeftOpen(true); }} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${view === 'favorites' ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title="Favorites">
              <Heart className="h-4 w-4" />
            </button>
            <button onClick={() => { selectView('archive'); setLeftOpen(true); }} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${view === 'archive' ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title="Archived">
              <Archive className="h-4 w-4" />
            </button>
            <button onClick={() => { selectView('trash'); setLeftOpen(true); }} className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${view === 'trash' ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title="Trash">
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="my-1 h-px w-8 bg-slate-800" />
            <button onClick={() => { setLeftOpen(true); startCreateFolder(); }} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition" title="New folder">
              <FolderPlus className="h-4 w-4" />
            </button>
            <button onClick={() => { setShowNewPageMenu(false); createNewNote(selectedFolderId); }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-950/30 hover:bg-violet-500 transition" title="New page">
              <FilePlus2 className="h-4 w-4" />
            </button>
            <div className="mt-auto pb-2 text-[10px] text-slate-600" title={`${notes.length} pages`}>{notes.length}</div>
          </div>
        )}
      </aside>
  );
};

export default NotesSidebar;
