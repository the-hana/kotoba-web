export const LoadingSpinner = () => (
  <div className="fixed inset-0 md:left-56 flex items-center justify-center pointer-events-none">
    <div role="status" aria-label="読み込み中" className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
)
