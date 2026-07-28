import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import ThemeQuickToggle from './components/ThemeQuickToggle.jsx'
import VisitReminderCheck from './components/VisitReminderCheck.jsx'

const ReferenceHome = lazy(() => import('./pages/reference/ReferenceHome.jsx'))
const LectureView = lazy(() => import('./pages/reference/LectureView.jsx'))
const ArticleView = lazy(() => import('./pages/reference/ArticleView.jsx'))
const Glossary = lazy(() => import('./pages/reference/Glossary.jsx'))
const GlossaryTermView = lazy(() => import('./pages/reference/GlossaryTermView.jsx'))
const SearchScreen = lazy(() => import('./pages/reference/SearchScreen.jsx'))
const QuizHome = lazy(() => import('./pages/reference/QuizHome.jsx'))
const QuizRunner = lazy(() => import('./pages/reference/QuizRunner.jsx'))
const CareGuide = lazy(() => import('./pages/reference/CareGuide.jsx'))
const FinalReview = lazy(() => import('./pages/reference/FinalReview.jsx'))

const TrainerHome = lazy(() => import('./pages/trainer/TrainerHome.jsx'))
const ListenBeats = lazy(() => import('./pages/trainer/ListenBeats.jsx'))
const CountBeats = lazy(() => import('./pages/trainer/CountBeats.jsx'))
const SenseSecond = lazy(() => import('./pages/trainer/SenseSecond.jsx'))
const MergeUnison = lazy(() => import('./pages/trainer/MergeUnison.jsx'))
const TemperamentTrainer = lazy(() => import('./pages/trainer/TemperamentTrainer.jsx'))
const EarDiagnostics = lazy(() => import('./pages/trainer/EarDiagnostics.jsx'))
const DailyExam = lazy(() => import('./pages/trainer/DailyExam.jsx'))

const ToolsHome = lazy(() => import('./pages/tools/ToolsHome.jsx'))
const WireTable = lazy(() => import('./pages/tools/WireTable.jsx'))
const StringOrderForm = lazy(() => import('./pages/tools/StringOrderForm.jsx'))
const DiagnosticChecklist = lazy(() => import('./pages/tools/DiagnosticChecklist.jsx'))
const WorkOrderChecklist = lazy(() => import('./pages/tools/WorkOrderChecklist.jsx'))
const ShopLinks = lazy(() => import('./pages/tools/ShopLinks.jsx'))
const TuningFork = lazy(() => import('./pages/tools/TuningFork.jsx'))
const FieldVisit = lazy(() => import('./pages/tools/FieldVisit.jsx'))
const PitchTuner = lazy(() => import('./pages/tools/PitchTuner.jsx'))
const TensionCalculator = lazy(() => import('./pages/tools/TensionCalculator.jsx'))
const ClientPhrases = lazy(() => import('./pages/tools/ClientPhrases.jsx'))
const MyOrders = lazy(() => import('./pages/tools/MyOrders.jsx'))
const OrderStats = lazy(() => import('./pages/tools/OrderStats.jsx'))
const Inventory = lazy(() => import('./pages/tools/Inventory.jsx'))
const Clients = lazy(() => import('./pages/tools/Clients.jsx'))
const ClientProfile = lazy(() => import('./pages/tools/ClientProfile.jsx'))
const CommonMistakes = lazy(() => import('./pages/tools/CommonMistakes.jsx'))
const SymptomQuiz = lazy(() => import('./pages/tools/SymptomQuiz.jsx'))

const MoreHome = lazy(() => import('./pages/more/MoreHome.jsx'))
const MyCourse = lazy(() => import('./pages/more/MyCourse.jsx'))
const BusinessCard = lazy(() => import('./pages/more/BusinessCard.jsx'))
const TaxCalculator = lazy(() => import('./pages/more/TaxCalculator.jsx'))
const Notifications = lazy(() => import('./pages/more/Notifications.jsx'))
const Favorites = lazy(() => import('./pages/more/Favorites.jsx'))
const About = lazy(() => import('./pages/more/About.jsx'))
const Appearance = lazy(() => import('./pages/more/Appearance.jsx'))
const DataBackup = lazy(() => import('./pages/more/DataBackup.jsx'))
const Changelog = lazy(() => import('./pages/more/Changelog.jsx'))

function RouteFallback() {
  return <div className="empty-state">Загрузка…</div>
}

export default function App() {
  return (
    <>
      <VisitReminderCheck />
      <ThemeQuickToggle />
      <main className="app-main">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/reference" replace />} />

            <Route path="/reference" element={<ReferenceHome />} />
            <Route path="/reference/search" element={<SearchScreen />} />
            <Route path="/reference/glossary" element={<Glossary />} />
            <Route path="/reference/glossary/:termId" element={<GlossaryTermView />} />
            <Route path="/reference/quiz" element={<QuizHome />} />
            <Route path="/reference/quiz/:lectureId" element={<QuizRunner />} />
            <Route path="/reference/care" element={<CareGuide />} />
            <Route path="/reference/review" element={<FinalReview />} />
            <Route path="/reference/:lectureId" element={<LectureView />} />
            <Route path="/reference/:lectureId/:articleId" element={<ArticleView />} />

            <Route path="/trainer" element={<TrainerHome />} />
            <Route path="/trainer/listen" element={<ListenBeats />} />
            <Route path="/trainer/count" element={<CountBeats />} />
            <Route path="/trainer/second" element={<SenseSecond />} />
            <Route path="/trainer/unison" element={<MergeUnison />} />
            <Route path="/trainer/temperament" element={<TemperamentTrainer />} />
            <Route path="/trainer/ear-diagnostics" element={<EarDiagnostics />} />
            <Route path="/trainer/daily-exam" element={<DailyExam />} />

            <Route path="/tools" element={<ToolsHome />} />
            <Route path="/tools/wire" element={<WireTable />} />
            <Route path="/tools/order-form" element={<StringOrderForm />} />
            <Route path="/tools/diagnostic" element={<DiagnosticChecklist />} />
            <Route path="/tools/work-order" element={<WorkOrderChecklist />} />
            <Route path="/tools/shop" element={<ShopLinks />} />
            <Route path="/tools/tuning-fork" element={<TuningFork />} />
            <Route path="/tools/field-visit" element={<FieldVisit />} />
            <Route path="/tools/pitch-detector" element={<PitchTuner />} />
            <Route path="/tools/tension" element={<TensionCalculator />} />
            <Route path="/tools/phrases" element={<ClientPhrases />} />
            <Route path="/tools/my-orders" element={<MyOrders />} />
            <Route path="/tools/order-stats" element={<OrderStats />} />
            <Route path="/tools/inventory" element={<Inventory />} />
            <Route path="/tools/clients" element={<Clients />} />
            <Route path="/tools/clients/:key" element={<ClientProfile />} />
            <Route path="/tools/common-mistakes" element={<CommonMistakes />} />
            <Route path="/tools/symptom-quiz" element={<SymptomQuiz />} />
            <Route path="/tools/my-instruments" element={<Navigate to="/tools/my-orders" replace />} />

            <Route path="/more" element={<MoreHome />} />
            <Route path="/more/course" element={<MyCourse />} />
            <Route path="/more/business-card" element={<BusinessCard />} />
            <Route path="/more/tax" element={<TaxCalculator />} />
            <Route path="/more/notifications" element={<Notifications />} />
            <Route path="/more/favorites" element={<Favorites />} />
            <Route path="/more/appearance" element={<Appearance />} />
            <Route path="/more/about" element={<About />} />
            <Route path="/more/backup" element={<DataBackup />} />
            <Route path="/more/changelog" element={<Changelog />} />

            <Route path="*" element={<Navigate to="/reference" replace />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </>
  )
}
