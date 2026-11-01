import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { reviewNote, searchQuestions } from '../../services/notes';

const NoteProperties = ({ note, notes, onSave, onOpenNote }) => {
  const [tag, setTag] = useState('');
  const [questionQuery, setQuestionQuery] = useState('');
  const [questionResults, setQuestionResults] = useState([]);
  const [relatedQuery, setRelatedQuery] = useState('');
  const tags = note.tags || [];
  const linkedQuestions = note.linkedQuestions || [];
  const relatedNotes = note.relatedNotes || [];
  const relatedIds = relatedNotes.map((item) => String(item._id || item));
  const backlinks = notes.filter((item) => (
    item._id !== note._id && (item.relatedNotes || []).some((related) => String(related._id || related) === String(note._id))
  ));
  const relatedCandidates = notes.filter((item) => (
    item._id !== note._id && !relatedIds.includes(String(item._id)) &&
    (item.title || '').toLowerCase().includes(relatedQuery.trim().toLowerCase())
  )).slice(0, 6);

  const addTag = () => {
    const value = tag.trim();
    if (!value || tags.includes(value)) return;
    onSave({ tags: [...tags, value] });
    setTag('');
  };

  const findQuestions = async (value) => {
    setQuestionQuery(value);
    if (value.trim().length < 2) {
      setQuestionResults([]);
      return;
    }
    try {
      const response = await searchQuestions(value);
      setQuestionResults(response.data.questions || []);
    } catch (error) {
      console.error('Unable to search questions:', error);
    }
  };

  const linkQuestion = (question) => {
    if (linkedQuestions.some((item) => item.questionKey === question.questionKey)) return;
    onSave({ linkedQuestions: [...linkedQuestions, question] });
    setQuestionQuery('');
    setQuestionResults([]);
  };

  const review = async (result) => {
    try {
      const response = await reviewNote(note._id, result);
      onSave({ revision: response.data.note.revision });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save review');
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div>
        <p className="text-xs text-gray-400 uppercase mb-2">Tags</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full bg-primary-900/40 px-2 py-1 text-xs text-primary-300">
              #{item}
              <button type="button" aria-label={`Remove tag ${item}`} onClick={() => onSave({ tags: tags.filter((tagValue) => tagValue !== item) })} className="text-primary-400 hover:text-white">×</button>
            </span>
          ))}
        </div>
        <input value={tag} onChange={(event) => setTag(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTag()} placeholder="Add tag" className="input-field text-xs py-2" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase mb-2">Linked Questions</p>
        <div className="space-y-2 mb-2">
          {linkedQuestions.map((question) => (
            <div key={question.questionKey} className="flex items-center justify-between gap-2 text-gray-300">
              <span className="truncate">{question.title}</span>
              <button type="button" onClick={() => onSave({ linkedQuestions: linkedQuestions.filter((item) => item.questionKey !== question.questionKey) })} className="text-gray-500 hover:text-rose-400">×</button>
            </div>
          ))}
        </div>
        <input value={questionQuery} onChange={(event) => findQuestions(event.target.value)} placeholder="Link a DSA question" className="input-field text-xs py-2" />
        {questionResults.length > 0 && <div className="mt-1 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">{questionResults.map((question) => <button type="button" key={question.questionKey} onClick={() => linkQuestion(question)} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800">{question.title}</button>)}</div>}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase mb-2">Related pages</p>
        <div className="mb-2 space-y-1">
          {relatedNotes.map((item) => {
            const relatedId = item._id || item;
            const relatedNote = notes.find((candidate) => String(candidate._id) === String(relatedId));
            return (
              <div key={String(relatedId)} className="flex items-center gap-2 rounded-lg bg-slate-800/70 px-2.5 py-2">
                <button type="button" onClick={() => onOpenNote(relatedId)} className="min-w-0 flex-1 truncate text-left text-xs text-slate-300 hover:text-white">{relatedNote?.title || item.title || 'Linked page'}</button>
                <button type="button" aria-label="Remove related page" onClick={() => onSave({ relatedNotes: relatedNotes.filter((value) => String(value._id || value) !== String(relatedId)) })} className="text-slate-500 hover:text-rose-300">×</button>
              </div>
            );
          })}
        </div>
        <input value={relatedQuery} onChange={(event) => setRelatedQuery(event.target.value)} placeholder="Link another page" className="input-field text-xs py-2" />
        {relatedQuery && relatedCandidates.length > 0 && (
          <div className="mt-1 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
            {relatedCandidates.map((candidate) => <button key={candidate._id} type="button" onClick={() => { onSave({ relatedNotes: [...relatedNotes.map((item) => item._id || item), candidate._id] }); setRelatedQuery(''); }} className="w-full truncate px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-800">{candidate.title || 'Untitled page'}</button>)}
          </div>
        )}
        {backlinks.length > 0 && (
          <div className="mt-3 border-t border-slate-800 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Backlinks</p>
            <div className="space-y-1">
              {backlinks.map((item) => <button key={item._id} type="button" onClick={() => onOpenNote(item._id)} className="block w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-800 hover:text-white">↗ {item.title || 'Untitled page'}</button>)}
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase mb-2">Revision</p>
        <button type="button" onClick={() => onSave({ revision: { ...(note.revision || {}), enabled: !note.revision?.enabled, nextReviewAt: new Date(Date.now() + 3 * 86400000).toISOString(), intervalDays: 3 } })} className={`w-full px-3 py-2 rounded-lg text-left ${note.revision?.enabled ? 'bg-emerald-900/40 text-emerald-300' : 'bg-gray-800 text-gray-300'}`}>
          {note.revision?.enabled ? 'Revision enabled' : 'Add to revision'}
        </button>

        {note.revision?.enabled && <p className="text-xs text-gray-500 mt-2">Next review: {new Date(note.revision.nextReviewAt).toLocaleDateString()}</p>}
        {note.revision?.enabled && <div className="grid grid-cols-2 gap-1 mt-2">{['again', 'hard', 'good', 'easy'].map((result) => <button key={result} type="button" onClick={() => review(result)} className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-300 hover:bg-gray-700">{result}</button>)}</div>}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase mb-2">Page info</p>
        <dl className="space-y-2 text-gray-400"><div className="flex justify-between"><dt>Created</dt><dd>{new Date(note.createdAt).toLocaleDateString()}</dd></div><div className="flex justify-between"><dt>Updated</dt><dd>{new Date(note.updatedAt).toLocaleString()}</dd></div><div className="flex justify-between"><dt>Words</dt><dd>{note.plainText?.trim() ? note.plainText.trim().split(/\s+/).length : 0}</dd></div></dl>
      </div>
    </div>
  );


};

export default NoteProperties;
