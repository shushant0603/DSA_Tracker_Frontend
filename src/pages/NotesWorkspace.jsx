import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Archive, ChevronDown, ChevronRight, FilePlus2, FileText, Folder, FolderOpen, FolderPlus,
  Heart, PanelLeft, PanelRight, Pencil, Plus, Search, Trash2, X, ArrowLeft, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createFolder, createNote, deleteFolder, deleteNote, getNote, listFolders, listNotes,
  restoreNote, updateFolder, updateNote
} from '../services/notes';
import { useAppStore } from '../store/appStore';
import NoteEditor from '../components/notes/NoteEditor';
import NoteProperties from '../components/notes/NoteProperties';
import NotesSidebar from '../components/notes/NotesSidebar';
import { emptyDocument, nodeMarkdown, noteTemplates } from '../components/notes/editorUtils';

const NotesWorkspace = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const {
    userCache, setNotesData, selectedNoteId, setSelectedNote
  } = useAppStore();
  const [notes, setNotes] = useState(userCache.notes || []);
  const [folders, setFolders] = useState(userCache.folders || []);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(() => new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderSaving, setFolderSaving] = useState(false);
  const folderInputRef = useRef(null);
  const [loading, setLoading] = useState(!userCache.notes?.length);
  const [saving, setSaving] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);
  const saveTimer = useRef(null);
  const pendingSaveRef = useRef(null);
  const saveNoteRef = useRef(null);
  const saveQueueRef = useRef(Promise.resolve());
  const noteRequestId = useRef(0);
  const activeNoteRef = useRef(null);

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  const flushPendingSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    const pending = pendingSaveRef.current;
    pendingSaveRef.current = null;
    if (pending) return saveNoteRef.current?.(pending.patch, pending.noteId);
    return saveQueueRef.current;
  }, []);

  useEffect(() => () => flushPendingSave(), [flushPendingSave]);

  const loadWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      const [notesResponse, foldersResponse] = await Promise.all([
        listNotes({ trash: view === 'trash', favorite: view === 'favorites', archived: view === 'archive' }),
        listFolders()
      ]);
      const nextNotes = notesResponse.data.notes || [];
      const nextFolders = foldersResponse.data.folders || [];
      setNotes(nextNotes);
      setFolders(nextFolders);
      setNotesData(nextNotes, nextFolders);
    } catch (error) {
      console.error('Unable to load notes workspace:', error);
      toast.error(error.response?.data?.message || 'Unable to load notes');
    } finally {
      setLoading(false);
    }
  }, [setNotesData, view]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      const title = (note.title || '').toLowerCase();
      const matchesSearch = !query || title.includes(query) || (note.plainText || '').toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [notes, search]);

  const openNote = useCallback(async (id) => {
    const requestId = ++noteRequestId.current;
    await flushPendingSave();
    setSaving(false);
    setActiveNote(null);
    try {
      const response = await getNote(id);
      if (requestId !== noteRequestId.current) return;
      setActiveNote(response.data.note);
      setSelectedNote(id);
      navigate(`/app/notes/${id}`, { replace: true });
    } catch (error) {
      toast.error('Unable to open note');
    }
  }, [flushPendingSave, navigate, setSelectedNote]);

  useEffect(() => {
    const id = noteId || selectedNoteId;
    if (id && activeNoteRef.current?._id !== id) openNote(id);
  }, [noteId, openNote, selectedNoteId]);

  const createNewNote = async (folderId = selectedFolderId, templateId = null) => {
    try {
      ++noteRequestId.current;
      await flushPendingSave();
      const template = noteTemplates.find((item) => item.id === templateId);
      const content = template?.content || emptyDocument;
      const plainText = nodeMarkdown(content).replace(/[#*`|\[\]()_~>-]/g, ' ').replace(/\s+/g, ' ').trim();
      const payload = { title: template?.title || 'Untitled note', content, plainText };
      if (folderId) payload.folder = folderId;
      const response = await createNote(payload);
      setActiveNote(response.data.note);
      setNotes((current) => [response.data.note, ...current]);
      setSelectedNote(response.data.note._id);
      if (folderId) {
        setSelectedFolderId(folderId);
        setExpandedFolders((current) => new Set([...current, String(folderId)]));
      }
      navigate(`/app/notes/${response.data.note._id}`);
      toast.success('Note created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create note');
    }
  };

  const startCreateFolder = () => {
    setIsCreatingFolder(true);
    requestAnimationFrame(() => folderInputRef.current?.focus());
  };

  const createNewFolder = async (event) => {
    event?.preventDefault();
    const name = newFolderName.trim();
    if (!name || folderSaving) return;
    try {
      setFolderSaving(true);
      const response = await createFolder({ name });
      const createdFolder = response.data.folder;
      const nextFolders = [createdFolder, ...folders];
      setFolders(nextFolders);
      setNotesData(notes, nextFolders);
      setExpandedFolders((current) => new Set([...current, String(createdFolder._id)]));
      setSelectedFolderId(createdFolder._id);
      setView('all');
      setNewFolderName('');
      setIsCreatingFolder(false);
      toast.success('Folder created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create folder');
    } finally {
      setFolderSaving(false);
    }
  };

  const toggleFolder = (folderId) => {
    const key = String(folderId);
    setExpandedFolders((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectView = (nextView) => {
    flushPendingSave();
    setView(nextView);
    setSelectedFolderId(null);
    setActiveNote(null);
    setSelectedNote(null);
    navigate('/app/notes');
  };

  const selectFolder = (folderId) => {
    flushPendingSave();
    setSelectedFolderId(folderId);
    setView('all');
    setActiveNote(null);
    setSelectedNote(null);
    setExpandedFolders((current) => new Set([...current, String(folderId)]));
    navigate('/app/notes');
  };

  const renameFolder = async (folder) => {
    const name = window.prompt('Rename folder', folder.name)?.trim();
    if (!name || name === folder.name) return;
    try {
      const response = await updateFolder(folder._id, { name });
      const nextFolders = folders.map((item) => String(item._id) === String(folder._id) ? response.data.folder : item);
      setFolders(nextFolders);
      setNotesData(notes, nextFolders);
      toast.success('Folder renamed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to rename folder');
    }
  };

  const removeFolder = async (folder) => {
    if (!window.confirm(`Delete “${folder.name}”? The folder must be empty.`)) return;
    try {
      await deleteFolder(folder._id);
      const nextFolders = folders.filter((item) => item._id !== folder._id);
      setFolders(nextFolders);
      setNotesData(notes, nextFolders);
      if (String(selectedFolderId) === String(folder._id)) setSelectedFolderId(null);
      toast.success('Folder deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete folder');
    }
  };

  const saveNote = useCallback((patch, targetNoteId) => {
    const noteId = targetNoteId || activeNote?._id;
    if (!noteId) return Promise.resolve();

    const operation = async () => {
      setSaving(true);
      try {
        const response = await updateNote(noteId, patch);
        setActiveNote((current) => current?._id === noteId
          ? {
            ...current,
            ...response.data.note,
            ...(patch.content ? { content: patch.content } : {}),
            ...(patch.plainText !== undefined ? { plainText: patch.plainText } : {})
          }
          : current);
        setNotes((current) => current.map((note) => (
          note._id === noteId
            ? {
              ...note,
              ...response.data.note,
              ...(patch.content ? { content: patch.content } : {}),
              ...(patch.plainText !== undefined ? { plainText: patch.plainText } : {})
            }
            : note
        )));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to save note');
      } finally {
        setSaving(false);
      }
    };

    saveQueueRef.current = saveQueueRef.current.catch(() => {}).then(operation);
    return saveQueueRef.current;
  }, [activeNote]);
  saveNoteRef.current = saveNote;

  const scheduleSave = useCallback((patch) => {
    const noteId = activeNoteRef.current?._id || activeNote?._id;
    if (!noteId) return;

    if (pendingSaveRef.current && pendingSaveRef.current.noteId !== noteId) flushPendingSave();
    pendingSaveRef.current = {
      noteId,
      patch: { ...(pendingSaveRef.current?.patch || {}), ...patch }
    };
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const pending = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (pending) saveNote(pending.patch, pending.noteId);
    }, 900);
  }, [activeNote, flushPendingSave, saveNote]);

  const handleDelete = async () => {
    if (!activeNote) return;
    await handleDeleteNote(activeNote._id);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Move this note to trash?')) return;
    try {
      if (activeNoteRef.current?._id === noteId) await flushPendingSave();
      await deleteNote(noteId);
      if (activeNoteRef.current?._id === noteId) {
        setActiveNote(null);
        setSelectedNote(null);
        navigate('/app/notes');
      }
      await loadWorkspace();
      toast.success('Page moved to trash');
    } catch (error) {
      console.error('Unable to delete note:', error);
      toast.error(error.response?.data?.message || 'Unable to delete page');
    }
  };

  const handleRestore = async (id) => {
    await restoreNote(id);
    loadWorkspace();
  };

  const handleArchiveNote = async (id, isArchived = true) => {
    try {
      if (activeNoteRef.current?._id === id) await flushPendingSave();
      await updateNote(id, { isArchived });
      if (isArchived && activeNoteRef.current?._id === id) {
        setActiveNote(null);
        setSelectedNote(null);
        navigate('/app/notes');
      } else if (!isArchived && activeNoteRef.current?._id === id) setView('all');
      await loadWorkspace();
      toast.success(isArchived ? 'Page archived' : 'Page restored from archive');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update page');
    }
  };

  const duplicateNote = async (sourceNote) => {
    try {
      let source = sourceNote;
      if (activeNoteRef.current?._id === sourceNote._id) {
        await flushPendingSave();
        const latest = await getNote(sourceNote._id);
        source = latest.data.note;
      }
      const folderId = source.folder?._id || source.folder || null;
      const created = await createNote({
        title: `${(source.title || 'Untitled note').slice(0, 193)} (copy)`,
        folder: folderId,
        content: source.content || emptyDocument,
        plainText: source.plainText || ''
      });
      let copy = created.data.note;
      const extraFields = ['tags', 'linkedQuestions', 'relatedNotes', 'whiteboard', 'codeBlocks'];
      const extraData = Object.fromEntries(extraFields
        .filter((field) => source[field] !== undefined)
        .map((field) => [field, source[field]]));
      if (Object.keys(extraData).length) {
        const updated = await updateNote(copy._id, extraData);
        copy = updated.data.note;
      }
      setNotes((current) => [copy, ...current]);
      setView('all');
      setActiveNote(copy);
      setSelectedNote(copy._id);
      navigate(`/app/notes/${copy._id}`);
      toast.success('Page duplicated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to duplicate page');
    }
  };

  return (
    <div className="notes-workspace h-screen min-h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="notes-topbar h-14 shrink-0 border-b border-slate-800 bg-slate-950 flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold tracking-tight text-slate-100">Notes Workspace</span>
        <button
          type="button"
          onClick={() => setLeftOpen((open) => !open)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          title={leftOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={leftOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </header>
      <div className="relative flex-1 min-h-0 flex overflow-hidden">
        <NotesSidebar
          leftOpen={leftOpen}
          setLeftOpen={setLeftOpen}
          view={view}
          selectView={selectView}
          notes={notes}
          folders={folders}
          visibleNotes={visibleNotes}
          loading={loading}
          search={search}
          setSearch={setSearch}
          createNewNote={createNewNote}
          selectedFolderId={selectedFolderId}
          startCreateFolder={startCreateFolder}
          isCreatingFolder={isCreatingFolder}
          setIsCreatingFolder={setIsCreatingFolder}
          createNewFolder={createNewFolder}
          folderInputRef={folderInputRef}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          folderSaving={folderSaving}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          selectFolder={selectFolder}
          renameFolder={renameFolder}
          removeFolder={removeFolder}
          activeNote={activeNote}
          handleRestore={handleRestore}
          openNote={openNote}
          handleArchiveNote={handleArchiveNote}
          handleDeleteNote={handleDeleteNote}
        />
      <main className="notes-canvas relative flex-1 min-w-0 flex flex-col bg-slate-950">
        {activeNote && view !== 'trash' ? (
          <NoteEditor key={activeNote._id} note={activeNote} folders={folders} saving={saving} onSave={scheduleSave} onDelete={handleDelete} onArchive={() => handleArchiveNote(activeNote._id, !activeNote.isArchived)} onDuplicate={() => duplicateNote(activeNote)} setRightOpen={setRightOpen} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500"><div><FilePlus2 className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Select a note or create a new one</p></div></div>
        )}
      </main>

      {activeNote && rightOpen && view !== 'trash' && (
        <>
          <button aria-label="Close properties" onClick={() => setRightOpen(false)} style={{ left: leftOpen ? 260 : 0 }} className="absolute inset-y-0 right-0 z-30 bg-black/35 backdrop-blur-[1px]" />
          <aside className="notes-properties absolute right-0 top-0 bottom-0 z-40 w-[min(360px,92vw)] border-l border-slate-700 bg-slate-900 shadow-2xl p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="font-semibold text-slate-100">Page properties</h2><p className="text-xs text-slate-500 mt-1">Organize and revise this note</p></div>
              <button onClick={() => setRightOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800" aria-label="Close properties"><X className="w-4 h-4" /></button>
            </div>
            <NoteProperties note={activeNote} notes={notes} onSave={scheduleSave} onOpenNote={openNote} />
          </aside>
        </>
      )}
      </div>
    </div>
  );
};


export default NotesWorkspace;
