import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const emptyUserCache = () => ({
  books: null,
  bookData: {},
  questionStatuses: {},
  questionRecords: {},
  revisionSummary: null,
  revisionSummaryFetchedAt: 0,
  dueRevisions: null,
  upcomingRevisions: null,
  revisionsFetchedAt: 0,
  platformStats: null,
  platformStatsFetchedAt: 0,
  dashboardStats: null,
  dashboardStatsFetchedAt: 0,
  notes: [],
  folders: [],
  selectedNoteId: null,
});

export const useAppStore = create(
  persist(
    (set) => ({
      userId: null,
      sidebarOpen: false,
      userCache: emptyUserCache(),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      setUser: (userId) =>
        set((state) => ({
          userId,
          userCache: state.userId === userId ? state.userCache : emptyUserCache(),
        })),

      clearUser: () =>
        set({
          userId: null,
          sidebarOpen: false,
          selectedNoteId: null,
          userCache: emptyUserCache(),
        }),

      setBooks: (books) =>
        set((state) => ({ userCache: { ...state.userCache, books } })),

      setBookData: (bookId, bookData) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            bookData: { ...state.userCache.bookData, [bookId]: bookData },
          },
        })),

      setQuestionStatus: (questionId, status) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            questionStatuses: {
              ...state.userCache.questionStatuses,
              [questionId]: status,
            },
          },
        })),

      setQuestionStatuses: (questionStatuses) =>
        set((state) => ({
          userCache: { ...state.userCache, questionStatuses },
        })),

      setQuestionRecords: (questionRecords) =>
        set((state) => ({
          userCache: { ...state.userCache, questionRecords },
        })),

      saveQuestionRecord: (questionKey, record) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            questionRecords: {
              ...(state.userCache.questionRecords || {}),
              [questionKey]: record,
            },
          },
        })),

      removeQuestionRecord: (questionKey) =>
        set((state) => {
          const questionRecords = { ...(state.userCache.questionRecords || {}) };
          delete questionRecords[questionKey];
          return { userCache: { ...state.userCache, questionRecords } };
        }),

      setRevisionSummary: (revisionSummary) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            revisionSummary,
            revisionSummaryFetchedAt: Date.now(),
          },
        })),

      setRevisionLists: (dueRevisions, upcomingRevisions) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            dueRevisions,
            upcomingRevisions,
            revisionsFetchedAt: Date.now(),
          },
        })),

      invalidateRevisionLists: () =>
        set((state) => ({
          userCache: { ...state.userCache, revisionsFetchedAt: 0 },
        })),

      invalidateRevisionSummary: () =>
        set((state) => ({
          userCache: { ...state.userCache, revisionSummaryFetchedAt: 0 },
        })),

      setPlatformStats: (platformStats) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            platformStats,
            platformStatsFetchedAt: Date.now(),
          },
        })),

      invalidatePlatformStats: () =>
        set((state) => ({
          userCache: { ...state.userCache, platformStatsFetchedAt: 0 },
        })),

      setDashboardStats: (dashboardStats) =>
        set((state) => ({
          userCache: {
            ...state.userCache,
            dashboardStats,
            dashboardStatsFetchedAt: Date.now(),
          },
        })),

      invalidateDashboardStats: () =>
        set((state) => ({
          userCache: { ...state.userCache, dashboardStatsFetchedAt: 0 },
        })),

      setNotesData: (notes, folders) =>
        set((state) => ({
          userCache: { ...state.userCache, notes, folders },
        })),
      setSelectedNote: (selectedNoteId) => set({ selectedNoteId }),
    }),
    {
      name: 'dsa-tracker-app',
      partialize: (state) => ({
        userId: state.userId,
        selectedNoteId: state.selectedNoteId,
        userCache: state.userCache,
      }),
    }
  )
);
