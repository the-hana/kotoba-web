export const DashboardPage = () => (
  <div className="p-6 max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold text-slate-800 mb-6">대시보드</h1>
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
      <p className="text-sm text-slate-500">연속 학습일</p>
      <p className="text-4xl font-bold text-indigo-500 mt-1">- 일</p>
    </div>
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-700 mb-2">오늘의 AI 스토리</p>
      <p className="text-slate-400 text-sm">준비 중...</p>
    </div>
  </div>
)
