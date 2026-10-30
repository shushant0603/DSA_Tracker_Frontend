import React, { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, ExternalLink, RotateCcw, Trash2, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDueRevisions,
  getUpcomingRevisions,
  reviewRevision,
  removeRevision,
  updateRevision
} from '../services/revision';

const formatDateTime = (date) => new Date(date).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short'
});
const toDateInput = (date) => {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};
const toTimeInput = (date, preferredTime) =>
  preferredTime || new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

const Revision = () => {
  const [due, setDue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [filters, setFilters] = useState({
    book: 'all',
    chapter: 'all',
    section: 'all',
    topic: 'all',
    difficulty: 'all',
    platform: 'all'
  });

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const [dueResponse, upcomingResponse] = await Promise.all([
        getDueRevisions(),
        getUpcomingRevisions()
      ]);
      setDue(dueResponse.data.revisions || []);
      setUpcoming(upcomingResponse.data.revisions || []);
    } catch (error) {
      console.error('Error fetching revisions:', error);
      toast.error('Unable to load revisions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleReview = async (revisionId, result) => {
    try {
      await reviewRevision(revisionId, result);
      toast.success('Review saved');
      fetchRevisions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save review');
    }
  };

  const handleRemove = async (revisionId) => {
    try {
      await removeRevision(revisionId);
      toast.success('Removed from revision');
      fetchRevisions();
    } catch (error) {
      toast.error('Unable to remove revision');
    }
  };

  const openEdit = (revision) => {
    setEditing({
      ...revision,
      date: toDateInput(revision.nextRevisionDate),
      time: toTimeInput(revision.nextRevisionDate, revision.preferredTime),
      repeatEnabled: revision.repeatEnabled !== false,
      repeatCount: revision.repeatCount ? String(revision.repeatCount) : ''
    });
  };

  const handleEditSave = async (event) => {
    event.preventDefault();
    const { id, date, time, intervalDays, repeatEnabled, repeatCount } = editing;
    if (!date || !time || Number(intervalDays) < 1 || Number(intervalDays) > 365) {
      toast.error('Please enter a valid date, time and interval');
      return;
    }
    if (repeatEnabled && repeatCount && (Number(repeatCount) < 1 || Number(repeatCount) > 365)) {
      toast.error('Repeat count must be between 1 and 365');
      return;
    }

    try {
      setSavingEdit(true);
      await updateRevision(id, {
        intervalDays: Number(intervalDays),
        preferredTime: time,
        repeatEnabled,
        repeatCount: repeatEnabled && repeatCount ? Number(repeatCount) : null,
        nextRevisionDate: new Date(`${date}T${time}`).toISOString()
      });
      setEditing(null);
      toast.success('Revision schedule updated');
      fetchRevisions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update schedule');
    } finally {
      setSavingEdit(false);
    }
  };

  const allRevisions = [...due, ...upcoming];
  const filterOptions = {
    book: [...new Set(allRevisions.map(({ question }) => question.book).filter(Boolean))].sort(),
    chapter: [...new Set(allRevisions.map(({ question }) => question.chapter).filter(Boolean))].sort(),
    section: [...new Set(allRevisions.map(({ question }) => question.section).filter(Boolean))].sort(),
    topic: [...new Set(allRevisions.flatMap(({ question }) => question.topic || []).filter(Boolean))].sort(),
    difficulty: [...new Set(allRevisions.map(({ question }) => question.difficulty).filter(Boolean))].sort(),
    platform: [...new Set(allRevisions.map(({ question }) => question.platform).filter(Boolean))].sort()
  };

  const matchesFilters = (revision) => {
    const question = revision.question;
    return (
      (filters.book === 'all' || question.book === filters.book) &&
      (filters.chapter === 'all' || question.chapter === filters.chapter) &&
      (filters.section === 'all' || question.section === filters.section) &&
      (filters.topic === 'all' || (question.topic || []).includes(filters.topic)) &&
      (filters.difficulty === 'all' || question.difficulty === filters.difficulty) &&
      (filters.platform === 'all' || question.platform === filters.platform)
    );
  };

  const filteredDue = due.filter(matchesFilters);
  const filteredUpcoming = upcoming.filter(matchesFilters);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      book: 'all',
      chapter: 'all',
      section: 'all',
      topic: 'all',
      difficulty: 'all',
      platform: 'all'
    });
  };

  const renderRevision = (revision, isDue) => (
    <div key={revision.id} className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {revision.question.book} · {revision.question.chapter}
          </p>
          <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">
            {revision.question.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isDue ? 'Due now' : `Next revision: ${formatDateTime(revision.nextRevisionDate)}`}
            {' · '}Reviewed {revision.reviewCount} time{revision.reviewCount === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {revision.repeatEnabled === false
              ? 'One-time revision'
              : revision.repeatCount
                ? `Repeats ${revision.repeatCount} times`
                : 'Repeats until completed'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {revision.question.topic?.map((topic) => (
              <span key={topic} className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {topic}
              </span>
            ))}
            {revision.question.difficulty && (
              <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {revision.question.difficulty}
              </span>
            )}
            {revision.question.platform && (
              <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {revision.question.platform}
              </span>
            )}
          </div>
        </div>
        <a
          href={revision.question.link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary p-2"
          title="Open question"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      {isDue && (
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => handleReview(revision.id, 'again')} className="btn-secondary flex items-center gap-1">
            <RotateCcw className="w-4 h-4" /> Again
          </button>
          <button onClick={() => handleReview(revision.id, 'hard')} className="btn-secondary">Hard</button>
          <button onClick={() => handleReview(revision.id, 'good')} className="btn-primary">Good</button>
          <button onClick={() => handleReview(revision.id, 'easy')} className="btn-secondary">Easy</button>
        </div>
      )}
      <button
        onClick={() => openEdit(revision)}
        className="mt-3 mr-4 text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
      >
        <Pencil className="w-3 h-3" /> Edit schedule
      </button>
      <button
        onClick={() => handleRemove(revision.id)}
        className="mt-3 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
      >
        <Trash2 className="w-3 h-3" /> Remove from revision
      </button>
    </div>
  );

  if (loading) return <div className="card text-center">Loading revisions...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <CalendarClock className="w-8 h-8 text-primary-500" /> Revision
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Review due questions and keep your learning consistent.
        </p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Filter revisions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Group your revision work by topic, book or difficulty.
            </p>
          </div>
          <button onClick={resetFilters} className="btn-ghost text-sm">Reset filters</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Object.entries(filterOptions).map(([key, options]) => (
            <label key={key} className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {key}
              <select
                value={filters[key]}
                onChange={(event) => updateFilter(key, event.target.value)}
                className="input-field mt-1 text-sm normal-case"
              >
                <option value="all">All {key}s</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-amber-500" />
          <h2 className="section-title">Due today ({filteredDue.length}{filteredDue.length !== due.length ? ` / ${due.length}` : ''})</h2>
        </div>
        {filteredDue.length ? <div className="grid gap-4">{filteredDue.map((item) => renderRevision(item, true))}</div> : (
          <div className="card text-gray-500 dark:text-gray-400">
            {due.length ? 'No due revisions match the selected filters.' : 'No revisions due right now.'}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-4">Upcoming ({filteredUpcoming.length}{filteredUpcoming.length !== upcoming.length ? ` / ${upcoming.length}` : ''})</h2>
        {filteredUpcoming.length ? (
          <div className="grid gap-4">{filteredUpcoming.map((item) => renderRevision(item, false))}</div>
        ) : (
          <div className="card text-gray-500 dark:text-gray-400">
            No upcoming revisions match the selected filters.
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm">
          <form onSubmit={handleEditSave} className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Edit revision schedule</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{editing.question.title}</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Next revision date
                <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="input-field mt-2" required />
              </label>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Revision time
                <input type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} className="input-field mt-2" required />
              </label>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repeat after (days)
                <input type="number" min="1" max="365" value={editing.intervalDays} onChange={(e) => setEditing({ ...editing, intervalDays: e.target.value })} className="input-field mt-2" required />
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <input type="checkbox" checked={editing.repeatEnabled} onChange={(e) => setEditing({ ...editing, repeatEnabled: e.target.checked })} className="h-4 w-4 accent-primary-600" />
                Repeat this revision
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                When disabled, it will be completed after the next review.
              </p>
              {editing.repeatEnabled && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                  Number of repetitions
                  <input type="number" min="1" max="365" placeholder="Unlimited" value={editing.repeatCount} onChange={(e) => setEditing({ ...editing, repeatCount: e.target.value })} className="input-field mt-2" />
                  <span className="text-xs font-normal text-gray-500">Leave blank for unlimited repetitions.</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={savingEdit} className="btn-primary">{savingEdit ? 'Saving...' : 'Save schedule'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Revision;
