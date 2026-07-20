import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import ThemeQuickToggle from './components/ThemeQuickToggle.jsx'

import ReferenceHome from './pages/reference/ReferenceHome.jsx'
import LectureView from './pages/reference/LectureView.jsx'
import ArticleView from './pages/reference/ArticleView.jsx'
import Glossary from './pages/reference/Glossary.jsx'
import GlossaryTermView from './pages/reference/GlossaryTermView.jsx'
import SearchScreen from './pages/reference/SearchScreen.jsx'
import QuizHome from './pages/reference/QuizHome.jsx'
import QuizRunner from './pages/reference/QuizRunner.jsx'
import CareGuide from './pages/reference/CareGuide.jsx'

import TrainerHome from './pages/trainer/TrainerHome.jsx'
import ListenBeats from './pages/trainer/ListenBeats.jsx'
import CountBeats from './pages/trainer/CountBeats.jsx'
import SenseSecond from './pages/trainer/SenseSecond.jsx'
import MergeUnison from './pages/trainer/MergeUnison.jsx'

import ToolsHome from './pages/tools/ToolsHome.jsx'
import WireTable from './pages/tools/WireTable.jsx'
import StringOrderForm from './pages/tools/StringOrderForm.jsx'
import DiagnosticChecklist from './pages/tools/DiagnosticChecklist.jsx'
import WorkOrderChecklist from './pages/tools/WorkOrderChecklist.jsx'

import MoreHome from './pages/more/MoreHome.jsx'
import Favorites from './pages/more/Favorites.jsx'
import About from './pages/more/About.jsx'
import Appearance from './pages/more/Appearance.jsx'

export default function App() {
  return (
    <>
      <ThemeQuickToggle />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/reference" replace />} />

          <Route path="/reference" element={<ReferenceHome />} />
          <Route path="/reference/search" element={<SearchScreen />} />
          <Route path="/reference/glossary" element={<Glossary />} />
          <Route path="/reference/glossary/:termId" element={<GlossaryTermView />} />
          <Route path="/reference/quiz" element={<QuizHome />} />
          <Route path="/reference/quiz/:lectureId" element={<QuizRunner />} />
          <Route path="/reference/care" element={<CareGuide />} />
          <Route path="/reference/:lectureId" element={<LectureView />} />
          <Route path="/reference/:lectureId/:articleId" element={<ArticleView />} />

          <Route path="/trainer" element={<TrainerHome />} />
          <Route path="/trainer/listen" element={<ListenBeats />} />
          <Route path="/trainer/count" element={<CountBeats />} />
          <Route path="/trainer/second" element={<SenseSecond />} />
          <Route path="/trainer/unison" element={<MergeUnison />} />

          <Route path="/tools" element={<ToolsHome />} />
          <Route path="/tools/wire" element={<WireTable />} />
          <Route path="/tools/order-form" element={<StringOrderForm />} />
          <Route path="/tools/diagnostic" element={<DiagnosticChecklist />} />
          <Route path="/tools/work-order" element={<WorkOrderChecklist />} />

          <Route path="/more" element={<MoreHome />} />
          <Route path="/more/favorites" element={<Favorites />} />
          <Route path="/more/appearance" element={<Appearance />} />
          <Route path="/more/about" element={<About />} />

          <Route path="*" element={<Navigate to="/reference" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  )
}
