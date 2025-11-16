import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useTranslation } from 'react-i18next'
import jsPDF from 'jspdf'

import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Rocket,
  User,
  Mail,
  Calendar,
  Globe,
  GraduationCap,
  BarChart3,
  Languages,
  Briefcase,
  MapPin,
  ExternalLink,
  DollarSign,
  Clock,
  CheckCircle,
  BookOpen,
  Users,
  FileText,
  Link as LinkIcon,
  ArrowLeft,
  Edit3,
  FileDown
} from 'lucide-react'

const languageOptions = ['en', 'fr', 'es', 'ar']

const degreeOptionValues = {
  bachelor: "Bachelor's",
  master: "Master's",
  phd: 'PhD',
  diploma: 'Diploma'
}

const budgetOptionValues = {
  full: 'Full scholarship needed',
  partial: 'Partial scholarship (50-75%)',
  contribute: 'Can pay 25-50%',
  selfFund: 'Can self-fund'
}

// ---------- Small Helpers ----------

const interpolateTemplate = (template, vars = {}) => {
  if (typeof template !== 'string') return ''
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = vars[key]
    return value != null ? String(value) : ''
  })
}

const safeParseJSON = (value, fallback) => {
  if (value == null) return fallback
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return fallback
    }
    try {
      return JSON.parse(trimmed)
    } catch (error) {
      console.warn('Failed to parse JSON value', error)
      return fallback
    }
  }
  return value
}

const ensureArray = (value, fallback = []) => {
  const parsed = safeParseJSON(value, fallback)
  return Array.isArray(parsed) ? parsed : fallback
}

const ensureObject = (value, fallback = {}) => {
  const parsed = safeParseJSON(value, fallback)
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback
}

// ---------- UI Components ----------

const LanguageSwitcher = ({ currentLanguage, onChange, t }) => (
  <div className="fixed top-4 right-4 z-50">
    <div className="glass-morphism rounded-xl flex items-center space-x-2 px-3 py-2">
      <label className="text-white text-sm font-semibold hidden sm:block">
        {t('languageSwitcher.label')}
      </label>
      <select
        value={currentLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white text-sm border border-white/30 rounded-lg px-2 py-1 focus:outline-none"
      >
        {languageOptions.map((lang) => (
          <option key={lang} value={lang} className="text-black">
            {t(`languageSwitcher.options.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  </div>
)

const StepNavigation = ({
  showBack,
  backLabel,
  onBack,
  backIcon: BackIcon = ArrowLeft,
  primaryLabel,
  primaryIcon: PrimaryIcon = Star,
  onPrimary,
  primaryClassName = 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
  primaryDisabled = false
}) => (
  <div className="flex flex-col sm:flex-row gap-4 mt-8">
    {showBack && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold border border-white/20 flex items-center justify-center"
      >
        <BackIcon className="inline w-5 h-5 mr-2" />
        {backLabel}
      </motion.button>
    )}
    <motion.button
      whileHover={{ scale: primaryDisabled ? 1 : 1.05 }}
      whileTap={{ scale: primaryDisabled ? 1 : 0.95 }}
      onClick={primaryDisabled ? undefined : onPrimary}
      disabled={primaryDisabled}
      className={`${primaryClassName} px-6 py-3 rounded-xl font-bold text-center flex items-center justify-center ${
        primaryDisabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {PrimaryIcon && <PrimaryIcon className="inline w-5 h-5 mr-2" />}
      {primaryLabel}
    </motion.button>
  </div>
)

const StarField = () => {
  const [stars, setStars] = useState([])

  useEffect(() => {
    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 3
        })
      }
      setStars(newStars)
    }
    generateStars()
  }, [])

  return (
    <div className="stars">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </div>
  )
}

const GameProgress = ({ currentStep, totalSteps, xp, level, labels }) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="fixed top-4 left-4 right-4 z-40">
      <div className="glass-morphism rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-game-gold" />
            <span className="game-font text-white font-bold">{labels.level}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-game-gold" />
            <span className="text-white font-semibold">{labels.xp}</span>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full neon-glow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-center text-sm text-gray-300">{labels.quest}</div>
      </div>
    </div>
  )
}

const Achievement = ({ title, description, icon: Icon, show, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-20 right-4 z-50 glass-morphism rounded-xl p-4 border-2 border-game-gold"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-game-gold rounded-full p-2">
              <Icon className="w-6 h-6 text-game-bg" />
            </div>
            <div>
              <h3 className="game-font text-game-gold font-bold">{title}</h3>
              <p className="text-white text-sm">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const GameCard = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`glass-morphism rounded-2xl p-8 border border-white/20 ${className}`}
  >
    {children}
  </motion.div>
)

const GameInput = ({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  options,
  required = false,
  placeholder,
  selectPlaceholder = 'Select...'
}) => (
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-white font-semibold">
      <Icon className="w-5 h-5 text-blue-400" />
      <span>{label}</span>
      {required && <span className="text-red-400">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 bg-game-card border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        required={required}
      >
        <option value="">{selectPlaceholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 bg-game-card border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all min-h-[100px] resize-none"
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 bg-game-card border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        required={required}
        min={type === 'number' ? 16 : undefined}
        max={type === 'number' ? 100 : undefined}
      />
    )}
  </div>
)

// ---------- Game Logic ----------

const steps = [
  { id: 'welcome', icon: Rocket, xpReward: 50 },
  { id: 'personal', icon: User, xpReward: 100 },
  { id: 'education', icon: GraduationCap, xpReward: 150 },
  { id: 'goals', icon: Target, xpReward: 200 },
  { id: 'experience', icon: Award, xpReward: 150 },
  { id: 'preferences', icon: MapPin, xpReward: 100 },
  { id: 'complete', icon: Trophy, xpReward: 500 },
  { id: 'results', icon: Star, xpReward: 1000 }
]

const calculateXpForStep = (stepIndex) => {
  const boundedIndex = Math.min(Math.max(stepIndex, 0), steps.length)
  return steps.slice(0, boundedIndex).reduce((total, step) => total + step.xpReward, 0)
}

const getLevelFromXp = (xpValue) => Math.floor(xpValue / 500) + 1

const defaultFormData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: '23',
  nationality: 'Moroccan',
  currentEducation: "Bachelor's in Computer Science",
  gpa: '3.8 / 4.0',
  englishLevel: 'IELTS 7.5',
  fieldOfInterest: 'Artificial Intelligence and Machine Learning',
  targetDegree: "Master's",
  budget: 'Full scholarship needed',
  workExperience: '2 years as Junior Software Developer at XYZ Tech.',
  achievements: "Published 1 research paper, won local AI hackathon, Dean's list",
  targetCountries: 'Canada, Germany, Netherlands',
  preferences: 'Strong research focus, part-time work allowed, preference for medium-sized universities.',
  languagePreference: 'en'
}

const FORM_STORAGE_KEY = 'scholarshipQuest.form'
const STEP_STORAGE_KEY = 'scholarshipQuest.step'
const RESULTS_STORAGE_KEY = 'scholarshipQuest.results'

const getStoredFormData = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(FORM_STORAGE_KEY)
    if (saved) {
      try {
        return { ...defaultFormData, ...JSON.parse(saved) }
      } catch (error) {
        console.warn('Failed to parse stored form data', error)
      }
    }
  }
  return defaultFormData
}

const getStoredStep = () => {
  if (typeof window !== 'undefined') {
    const saved = parseInt(window.localStorage.getItem(STEP_STORAGE_KEY), 10)
    if (!Number.isNaN(saved)) {
      return Math.min(Math.max(saved, 0), steps.length - 1)
    }
  }
  return 0
}

const getStoredResults = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(RESULTS_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.warn('Failed to parse stored results', error)
      }
    }
  }
  return null
}

const computeProgress = (targetIndex) => {
  const boundedIndex = Math.min(Math.max(targetIndex, 0), steps.length - 1)
  const xpValue = calculateXpForStep(boundedIndex)
  const levelValue = getLevelFromXp(xpValue)
  return { boundedIndex, xpValue, levelValue }
}

function App() {
  const { t, i18n } = useTranslation()

  const storedFormData = useMemo(() => getStoredFormData(), [])
  const storedStep = useMemo(() => getStoredStep(), [])
  const storedResults = useMemo(() => getStoredResults(), [])
  const initialLanguage = storedFormData.languagePreference || i18n.language || 'en'
  const initialProgress = useMemo(() => computeProgress(storedStep), [storedStep])

  const [currentStep, setCurrentStep] = useState(storedStep)
  const [xp, setXp] = useState(initialProgress.xpValue)
  const [level, setLevel] = useState(initialProgress.levelValue)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementData, setAchievementData] = useState({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiResults, setAiResults] = useState(storedResults)
  const [language, setLanguage] = useState(initialLanguage)

  const [formData, setFormData] = useState(() => ({
    ...storedFormData,
    languagePreference: initialLanguage
  }))

  // ---------- Derived data from AI results ----------

  // In normalized form, aiResults is the `data` object from your response
  const parsedResults = ensureObject(aiResults, {})

  const linkData = ensureObject(parsedResults.linksData || parsedResults, {})
  const checklistItems = ensureArray(parsedResults.applicationChecklist?.documents)
  const timelinePhases = ensureArray(parsedResults.applicationChecklist?.timeline)

  const universities = ensureArray(linkData.universities)
  const scholarships = ensureArray(linkData.scholarships)
  const resourceGroups = ensureObject(linkData.resources)

  const successProbability = parsedResults.successProbability || parsedResults.successProbabilityText

  // ---------- Persistence ----------

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STEP_STORAGE_KEY, String(currentStep))
    }
  }, [currentStep])

  useEffect(() => {
    if (typeof window !== 'undefined' && aiResults) {
      window.localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(aiResults))
    }
  }, [aiResults])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setFormData((prev) => ({ ...prev, languagePreference: lang }))
  }

  // ---------- Copy / i18n ----------

  const selectPlaceholderText = t('forms.selectPlaceholder')
  const degreeOptionsList = Object.entries(degreeOptionValues).map(([key, value]) => ({
    value,
    label: t(`forms.options.degrees.${key}`)
  }))
  const budgetOptionsList = Object.entries(budgetOptionValues).map(([key, value]) => ({
    value,
    label: t(`forms.options.budget.${key}`)
  }))
  const formLabels = t('forms.fields', { returnObjects: true })
  const formPlaceholders = t('forms.placeholders', { returnObjects: true })
  const stepsCopy = t('steps', { returnObjects: true })
  const resultsCopy = t('results', { returnObjects: true })
  const heroCopy = resultsCopy.hero || {}
  const resultsSections = resultsCopy.sections || {}
  const resultsResources = resultsCopy.resources || {}
  const resultsActions = resultsCopy.actions || {}
  const resultsButtons = resultsCopy.buttons || {}
  const resultsChecklist = resultsCopy.checklist || {}
  const navigationCopy = t('navigation', { returnObjects: true })

  // ---------- Helpers ----------

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const showAchievementPopup = (title, description, icon) => {
    setAchievementData({ title, description, icon })
    setShowAchievement(true)
  }

  const jumpToStep = (targetIndex) => {
    const boundedIndex = Math.min(Math.max(targetIndex, 0), steps.length - 1)
    const newXp = calculateXpForStep(boundedIndex)
    const newLevel = getLevelFromXp(newXp)
    setCurrentStep(boundedIndex)
    setXp(newXp)
    setLevel(newLevel)
    setShowAchievement(false)
    setShowConfetti(false)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const completedStep = steps[currentStep]
      const nextIndex = currentStep + 1
      const newXp = calculateXpForStep(nextIndex)
      const newLevel = getLevelFromXp(newXp)

      if (newLevel > level) {
        showAchievementPopup(
          t('achievement.levelUpTitle'),
          t('achievement.levelUpDescription', { level: newLevel }),
          Trophy
        )
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }

      setCurrentStep(nextIndex)
      setXp(newXp)
      setLevel(newLevel)

      if (currentStep > 0) {
        showAchievementPopup(
          t('achievement.stepCompleteTitle'),
          t('achievement.stepCompleteDescription', {
            stepTitle: t(`steps.${completedStep.id}.title`),
            xp: completedStep.xpReward
          }),
          completedStep.icon
        )
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      jumpToStep(currentStep - 1)
    }
  }

  // ---------- PDF Generation ----------

  const handleDownloadPdf = () => {
    if (!parsedResults || Object.keys(parsedResults).length === 0) return

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15

    const primary = { r: 37, g: 99, b: 235 } // blue-500
    const accent = { r: 168, g: 85, b: 247 } // purple-500
    const textDark = { r: 33, g: 37, b: 41 }

    const setTextColorObj = (c) => doc.setTextColor(c.r, c.g, c.b)

    // Header bar
    doc.setFillColor(primary.r, primary.g, primary.b)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)

    const userName =
      formData.name && formData.name.trim().length > 0
        ? formData.name.trim()
        : parsedResults.userProfile?.name || 'Explorer'

    doc.text('Scholarship Quest – Personalized Report', pageWidth / 2, 15, {
      align: 'center'
    })

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Student: ${userName}`, margin, 26)
    if (successProbability) {
      doc.text(`Success Probability: ${successProbability}`, pageWidth - margin, 26, {
        align: 'right'
      })
    }

    // Table of contents "buttons"
    let y = 45
    const tocButtons = [
      { key: 'profile', label: 'Profile Overview' },
      { key: 'universities', label: 'University Matches' },
      { key: 'scholarships', label: 'Scholarships' },
      { key: 'checklist', label: 'Application Checklist' },
      { key: 'timeline', label: 'Timeline & Estimated Costs' },
      { key: 'insights', label: 'Insights & Next Steps' }
    ]

    const buttonRects = []

    setTextColorObj(textDark)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Navigation', margin, y)
    y += 6

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const buttonWidth = (pageWidth - margin * 2 - 10) / 2
    const buttonHeight = 9

    tocButtons.forEach((btn, index) => {
      if (index > 0 && index % 2 === 0) {
        y += buttonHeight + 3
      }
      const col = index % 2
      const x = margin + col * (buttonWidth + 10)

      doc.setDrawColor(primary.r, primary.g, primary.b)
      doc.setFillColor(232, 240, 254)
      doc.roundedRect(x, y, buttonWidth, buttonHeight, 2, 2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.text(btn.label, x + 3, y + 6)

      buttonRects.push({
        key: btn.key,
        x,
        y,
        w: buttonWidth,
        h: buttonHeight
      })
    })

    // Remember section pages
    const sectionPages = {}

    // Utility: section header
    const addSectionHeader = (title) => {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      setTextColorObj(primary)
      doc.text(title, margin, 25)
      doc.setDrawColor(primary.r, primary.g, primary.b)
      doc.setLineWidth(0.5)
      doc.line(margin, 27, pageWidth - margin, 27)
      setTextColorObj(textDark)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
    }

    // ---------- Profile Page ----------
    doc.addPage()
    sectionPages.profile = doc.internal.getNumberOfPages()
    addSectionHeader('Profile Overview')

    const profile = parsedResults.userProfile || {}
    let py = 35

    const profileLines = [
      ['Name', profile.name || userName],
      ['Email', profile.email || formData.email],
      ['Age', profile.age != null ? String(profile.age) : formData.age],
      ['Nationality', profile.nationality || formData.nationality],
      ['Current Education', profile.currentEducation || formData.currentEducation],
      ['GPA', String(profile.gpa || formData.gpa)],
      ['English Level', profile.englishLevel || formData.englishLevel],
      ['Field of Interest', profile.fieldOfInterest || formData.fieldOfInterest],
      ['Target Degree', profile.targetDegree || formData.targetDegree],
      ['Budget', profile.budget || formData.budget],
      ['Target Countries', profile.targetCountries || formData.targetCountries]
    ]

    profileLines.forEach(([label, value]) => {
      if (!value) return
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, margin, py)
      doc.setFont('helvetica', 'normal')
      doc.text(String(value), margin + 40, py)
      py += 6
    })

    if (profile.workExperience) {
      py += 4
      doc.setFont('helvetica', 'bold')
      doc.text('Experience:', margin, py)
      py += 6
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(profile.workExperience, pageWidth - margin * 2)
      doc.text(lines, margin, py)
      py += lines.length * 6
    }

    if (profile.achievements) {
      py += 4
      doc.setFont('helvetica', 'bold')
      doc.text('Achievements:', margin, py)
      py += 6
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(profile.achievements, pageWidth - margin * 2)
      doc.text(lines, margin, py)
    }

    // ---------- Universities Page ----------
    if (universities.length > 0) {
      doc.addPage()
      sectionPages.universities = doc.internal.getNumberOfPages()
      addSectionHeader('University Matches')

      py = 35
      universities.forEach((uni, idx) => {
        if (py > 270) {
          doc.addPage()
          addSectionHeader('University Matches (cont.)')
          py = 35
        }
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${uni.name} (${uni.country})`, margin, py)
        py += 5
        doc.setFont('helvetica', 'normal')
        const lines = [
          `City: ${uni.city || '-'}`,
          `Match: ${uni.matchPercentage || uni.match || '-'}`,
          `Tuition: ${uni.tuition || '-'}`,
          `Scholarships: ${uni.scholarships || '-'}`,
          `Deadline: ${uni.deadline || '-'}`,
          `Reason: ${uni.reason || '-'}`
        ]
        lines.forEach((line) => {
          const split = doc.splitTextToSize(line, pageWidth - margin * 2)
          doc.text(split, margin + 5, py)
          py += split.length * 5
        })
        py += 4
      })
    }

    // ---------- Scholarships Page ----------
    if (scholarships.length > 0) {
      doc.addPage()
      sectionPages.scholarships = doc.internal.getNumberOfPages()
      addSectionHeader('Scholarships')

      py = 35
      scholarships.forEach((sch, idx) => {
        if (py > 270) {
          doc.addPage()
          addSectionHeader('Scholarships (cont.)')
          py = 35
        }
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${sch.name}`, margin, py)
        py += 5
        doc.setFont('helvetica', 'normal')
        const lines = [
          `Provider: ${sch.provider || '-'}`,
          `Amount: ${sch.amount || '-'}`,
          `Deadline: ${sch.deadline || '-'}`,
          `Probability: ${sch.probability || '-'}`,
          `Eligibility: ${sch.eligibility || '-'}`,
          `Description: ${sch.description || '-'}`
        ]
        lines.forEach((line) => {
          const split = doc.splitTextToSize(line, pageWidth - margin * 2)
          doc.text(split, margin + 5, py)
          py += split.length * 5
        })
        py += 4
      })
    }

    // ---------- Checklist Page ----------
    if (checklistItems.length > 0) {
      doc.addPage()
      sectionPages.checklist = doc.internal.getNumberOfPages()
      addSectionHeader('Application Checklist')

      py = 35
      checklistItems.forEach((item, idx) => {
        if (py > 270) {
          doc.addPage()
          addSectionHeader('Application Checklist (cont.)')
          py = 35
        }
        const status =
          resultsChecklist.statusMap?.[item.status] ||
          item.status?.[0]?.toUpperCase() + item.status?.slice(1) ||
          '-'
        const urgency =
          resultsChecklist.urgencyMap?.[item.urgency] ||
          item.urgency?.[0]?.toUpperCase() + item.urgency?.slice(1) ||
          '-'

        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${item.item}`, margin, py)
        py += 5
        doc.setFont('helvetica', 'normal')
        doc.text(`Status: ${status} • Urgency: ${urgency}`, margin + 5, py)
        py += 7
      })
    }

    // ---------- Timeline & Costs Page ----------
    if (timelinePhases.length > 0 || parsedResults.estimatedCosts) {
      doc.addPage()
      sectionPages.timeline = doc.internal.getNumberOfPages()
      addSectionHeader('Timeline & Estimated Costs')

      py = 35
      if (timelinePhases.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Timeline', margin, py)
        py += 6
        doc.setFont('helvetica', 'normal')
        timelinePhases.forEach((phase, idx) => {
          doc.text(`• ${phase.phase}: ${phase.duration}`, margin + 5, py)
          py += 6
        })
      }

      if (parsedResults.estimatedCosts) {
        const costs = parsedResults.estimatedCosts
        py += 8
        doc.setFont('helvetica', 'bold')
        doc.text('Estimated Costs', margin, py)
        py += 6
        doc.setFont('helvetica', 'normal')
        const costLines = [
          ['Application fees', costs.applicationFees],
          ['Test fees', costs.testFees],
          ['Visa fees', costs.visaFees],
          ['Total estimate', costs.totalEstimate]
        ]
        costLines.forEach(([label, value]) => {
          if (!value) return
          doc.text(`• ${label}: ${value}`, margin + 5, py)
          py += 6
        })
      }
    }

    // ---------- Insights Page ----------
    if (parsedResults.personalizedInsights) {
      doc.addPage()
      sectionPages.insights = doc.internal.getNumberOfPages()
      addSectionHeader('Insights & Next Steps')

      py = 35
      const insights = parsedResults.personalizedInsights || {}
      const comp = insights.competitivenessAnalysis || {}

      if (comp.gpaRating || comp.strengthAreas) {
        doc.setFont('helvetica', 'bold')
        doc.text('Competitiveness Analysis', margin, py)
        py += 6
        doc.setFont('helvetica', 'normal')
        if (comp.gpaRating) {
          doc.text(`GPA Rating: ${comp.gpaRating}`, margin + 5, py)
          py += 6
        }
        if (Array.isArray(comp.strengthAreas) && comp.strengthAreas.length > 0) {
          doc.text('Strengths:', margin + 5, py)
          py += 6
          comp.strengthAreas.forEach((s) => {
            doc.text(`• ${s}`, margin + 10, py)
            py += 5
          })
        }
      }

      if (Array.isArray(insights.nextSteps) && insights.nextSteps.length > 0) {
        py += 6
        doc.setFont('helvetica', 'bold')
        doc.text('Next Steps', margin, py)
        py += 6
        doc.setFont('helvetica', 'normal')
        insights.nextSteps.forEach((step) => {
          const lines = doc.splitTextToSize(`• ${step}`, pageWidth - margin * 2)
          doc.text(lines, margin + 5, py)
          py += lines.length * 5
        })
      }
    }

    // ---------- Wire TOC buttons to section pages ----------
    doc.setPage(1)
    buttonRects.forEach((btn) => {
      const targetPage = sectionPages[btn.key]
      if (!targetPage) return
      doc.link(btn.x, btn.y, btn.w, btn.h, {
        pageNumber: targetPage
      })
    })

    doc.save(`scholarship-quest-report-${userName.replace(/\s+/g, '-')}.pdf`)
  }

  // ---------- Submission ----------

  const submitForm = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(
        import.meta.env.VITE_WEBHOOK_URL ||
          'http://localhost:5680/webhook/scholarship-finder',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      )

      const text = await response.text()
      if (!text) {
        throw new Error('Empty response from server')
      }

      let raw
      try {
        raw = JSON.parse(text)
      } catch (err) {
        console.error('JSON parse error, raw text:', text)
        throw err
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let core = raw

      // Normalize different shapes:
      // { success, data: {...} }  OR  [ { ... } ]  OR { data: [ {...} ] }
      if (Array.isArray(core)) {
        core = core[0] || {}
      } else if (core && typeof core === 'object') {
        if (core.data && typeof core.data === 'object') {
          if (Array.isArray(core.data)) {
            core = core.data[0] || {}
          } else {
            core = core.data
          }
        }
      }

      if (!core || typeof core !== 'object') {
        throw new Error('Unexpected response format from server')
      }

      setAiResults(core)

      showAchievementPopup(
        t('achievement.questCompleteTitle'),
        t('achievement.questCompleteDescription'),
        Trophy
      )
      setShowConfetti(true)

      setTimeout(() => {
        jumpToStep(steps.length - 1) // Go directly to results
      }, 2000)
    } catch (error) {
      console.error('Submission error:', error)
      alert(t('alerts.questFailed'))
      setCurrentStep((prev) => Math.max(prev - 1, 0))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------- Step Rendering ----------

  const renderStepContent = () => {
    const step = steps[currentStep]
    const stepCopy = stepsCopy?.[step.id] || {}

    switch (step.id) {
      case 'welcome':
        return (
          <GameCard className="text-center max-w-2xl mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              <Rocket className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="game-font text-4xl font-bold text-white mb-4">
              {stepCopy.headline}
            </h1>
            <p className="text-xl text-gray-300 mb-8">{stepCopy.description}</p>
            <StepNavigation
              showBack={false}
              primaryLabel={stepCopy.button}
              primaryIcon={Zap}
              onPrimary={nextStep}
            />
          </GameCard>
        )

      case 'personal':
        return (
          <GameCard className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <User className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="game-font text-3xl font-bold text-white mb-2">
                {stepCopy.title}
              </h2>
              <p className="text-gray-300">{stepCopy.description}</p>
            </div>
            <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
              <GameInput
                icon={User}
                label={formLabels.name}
                value={formData.name}
                onChange={(value) => updateFormData('name', value)}
                required
                placeholder={formPlaceholders.name}
              />
              <GameInput
                icon={Mail}
                label={formLabels.email}
                type="email"
                value={formData.email}
                onChange={(value) => updateFormData('email', value)}
                required
                placeholder={formPlaceholders.email}
              />
              <GameInput
                icon={Calendar}
                label={formLabels.age}
                type="number"
                value={formData.age}
                onChange={(value) => updateFormData('age', value)}
                required
                placeholder={formPlaceholders.age}
              />
              <GameInput
                icon={Globe}
                label={formLabels.nationality}
                value={formData.nationality}
                onChange={(value) => updateFormData('nationality', value)}
                required
                placeholder={formPlaceholders.nationality}
              />
            </div>
            <StepNavigation
              showBack={currentStep > 1}
              backLabel={navigationCopy.back}
              onBack={prevStep}
              primaryLabel={stepCopy.button}
              primaryIcon={Star}
              onPrimary={nextStep}
            />
          </GameCard>
        )

      case 'education':
        return (
          <GameCard className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="game-font text-3xl font-bold text-white mb-2">
                {stepCopy.title}
              </h2>
              <p className="text-gray-300">{stepCopy.description}</p>
            </div>
            <div className="space-y-6">
              <GameInput
                icon={GraduationCap}
                label={formLabels.currentEducation}
                value={formData.currentEducation}
                onChange={(value) => updateFormData('currentEducation', value)}
                required
                placeholder={formPlaceholders.currentEducation}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GameInput
                  icon={BarChart3}
                  label={formLabels.gpa}
                  value={formData.gpa}
                  onChange={(value) => updateFormData('gpa', value)}
                  required
                  placeholder={formPlaceholders.gpa}
                />
                <GameInput
                  icon={Languages}
                  label={formLabels.englishLevel}
                  value={formData.englishLevel}
                  onChange={(value) => updateFormData('englishLevel', value)}
                  required
                  placeholder={formPlaceholders.englishLevel}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg neon-glow"
            >
              {stepCopy.button} <Star className="inline w-5 h-5 ml-2" />
            </motion.button>
          </GameCard>
        )

      case 'goals':
        return (
          <GameCard className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="game-font text-3xl font-bold text-white mb-2">
                {stepCopy.title}
              </h2>
              <p className="text-gray-300">{stepCopy.description}</p>
            </div>
            <div className="space-y-6">
              <GameInput
                icon={Target}
                label={formLabels.fieldOfInterest}
                value={formData.fieldOfInterest}
                onChange={(value) => updateFormData('fieldOfInterest', value)}
                required
                placeholder={formPlaceholders.fieldOfInterest}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GameInput
                  icon={GraduationCap}
                  label={formLabels.targetDegree}
                  type="select"
                  value={formData.targetDegree}
                  onChange={(value) => updateFormData('targetDegree', value)}
                  required
                  options={degreeOptionsList}
                  selectPlaceholder={selectPlaceholderText}
                />
                <GameInput
                  icon={BarChart3}
                  label={formLabels.budget}
                  type="select"
                  value={formData.budget}
                  onChange={(value) => updateFormData('budget', value)}
                  required
                  options={budgetOptionsList}
                  selectPlaceholder={selectPlaceholderText}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg neon-glow"
            >
              {stepCopy.button} <Star className="inline w-5 h-5 ml-2" />
            </motion.button>
          </GameCard>
        )

      case 'experience':
        return (
          <GameCard className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Award className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="game-font text-3xl font-bold text-white mb-2">
                {stepCopy.title}
              </h2>
              <p className="text-gray-300">{stepCopy.description}</p>
            </div>
            <div className="space-y-6">
              <GameInput
                icon={Briefcase}
                label={formLabels.workExperience}
                type="textarea"
                value={formData.workExperience}
                onChange={(value) => updateFormData('workExperience', value)}
                placeholder={formPlaceholders.workExperience}
              />
              <GameInput
                icon={Award}
                label={formLabels.achievements}
                type="textarea"
                value={formData.achievements}
                onChange={(value) => updateFormData('achievements', value)}
                placeholder={formPlaceholders.achievements}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg neon-glow"
            >
              {stepCopy.button} <Star className="inline w-5 h-5 ml-2" />
            </motion.button>
          </GameCard>
        )

      case 'preferences':
        return (
          <GameCard className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h2 className="game-font text-3xl font-bold text-white mb-2">
                {stepCopy.title}
              </h2>
              <p className="text-gray-300">{stepCopy.description}</p>
            </div>
            <div className="space-y-6">
              <GameInput
                icon={MapPin}
                label={formLabels.targetCountries}
                value={formData.targetCountries}
                onChange={(value) => updateFormData('targetCountries', value)}
                required
                placeholder={formPlaceholders.targetCountries}
              />
              <GameInput
                icon={Target}
                label={formLabels.preferences}
                type="textarea"
                value={formData.preferences}
                onChange={(value) => updateFormData('preferences', value)}
                placeholder={formPlaceholders.preferences}
              />
            </div>
            <StepNavigation
              showBack
              backLabel={navigationCopy.back}
              onBack={prevStep}
              primaryLabel={stepCopy.button}
              primaryIcon={Trophy}
              onPrimary={nextStep}
            />
          </GameCard>
        )

      case 'complete':
        return (
          <GameCard className="text-center max-w-2xl mx-auto">
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <Zap className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="game-font text-3xl font-bold text-white mb-4">
                  {stepCopy.loadingTitle}
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  {stepCopy.loadingDescription}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="game-font text-3xl font-bold text-white mb-4">
                  {stepCopy.title}
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  {stepCopy.description}
                </p>
                <StepNavigation
                  showBack
                  backLabel={navigationCopy.back}
                  onBack={prevStep}
                  primaryLabel={stepCopy.button}
                  primaryIcon={Rocket}
                  onPrimary={submitForm}
                  primaryClassName="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  primaryDisabled={isSubmitting}
                />
              </>
            )}
          </GameCard>
        )

      case 'results': {
        const userName =
          formData.name && formData.name.trim().length > 0
            ? formData.name.trim()
            : parsedResults.userProfile?.name || 'Explorer'

        // hero title may come as "🎉 ... {{name}}!"
        let heroTitleRaw =
          heroCopy.title ||
          t('results.hero.title', { name: userName })

        const heroTitle = interpolateTemplate(heroTitleRaw, { name: userName })

        const heroDescription =
          heroCopy.description ||
          t(
            'results.hero.description',
            'Your personalized scholarship guide is ready!'
          )

        const heroLevel = t('results.hero.level', { level })
        const heroXp = t('results.hero.xp', { xp })

        const downloadLabel =
          resultsButtons.downloadPdf ||
          t('results.buttons.downloadPdf', 'Download PDF Report')

        // Checklist labels, avoid showing raw keys
        const prettyStatus = (status) =>
          resultsChecklist.statusMap?.[status] ||
          (status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : '-')

        const prettyUrgency = (urgency) =>
          resultsChecklist.urgencyMap?.[urgency] ||
          (urgency
            ? urgency.charAt(0).toUpperCase() + urgency.slice(1)
            : '-')

        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <GameCard className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Star className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="game-font text-4xl font-bold text-white mb-4">
                {heroTitle}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{heroDescription}</p>

              {successProbability && (
                <p className="text-sm text-green-300 mb-4">
                  {t('results.hero.successProbability', {
                    defaultValue: 'Overall success probability: {{value}}',
                    value: successProbability
                  })}
                </p>
              )}

              {checklistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle
                        className={`w-5 h-5 mt-1 ${
                          item.status === 'completed'
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }`}
                      />
                      <div>
                        <p className="text-white font-semibold">{item.item}</p>
                        <p className="text-sm text-gray-300">
                          {prettyStatus(item.status)} • {prettyUrgency(item.urgency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mb-6">
                  {resultsCopy.checklist?.empty ||
                    t(
                      'results.checklist.empty',
                      'No checklist items yet'
                    )}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-3 text-sm mb-4">
                <div className="bg-blue-500/20 px-4 py-2 rounded-full">
                  <Trophy className="inline w-4 h-4 mr-2" />
                  {heroLevel}
                </div>
                <div className="bg-purple-500/20 px-4 py-2 rounded-full">
                  <Star className="inline w-4 h-4 mr-2" />
                  {heroXp}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <StepNavigation
                  showBack
                  backLabel={navigationCopy.edit}
                  backIcon={Edit3}
                  onBack={() => jumpToStep(1)}
                  primaryLabel={resultsCopy.actions.startNew}
                  primaryIcon={Rocket}
                  onPrimary={() => {
                    window.localStorage.removeItem(FORM_STORAGE_KEY)
                    window.localStorage.removeItem(STEP_STORAGE_KEY)
                    window.localStorage.removeItem(RESULTS_STORAGE_KEY)
                    window.location.reload()
                  }}
                  primaryClassName="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPdf}
                  disabled={!aiResults}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FileDown className="inline w-5 h-5 mr-2" />
                  {downloadLabel}
                </motion.button>
                {aiResults?.redirectUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(aiResults.redirectUrl, '_blank')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center"
                  >
                    <ExternalLink className="inline w-5 h-5 mr-2" />
                    {resultsActions.viewGuide ||
                      t('results.actions.viewGuide', 'Open full guide')}
                  </motion.button>
                )}
              </div>
            </GameCard>

            {/* Universities Section */}
            {universities.length > 0 && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsSections.universities ||
                    t('results.sections.universities', '🎓 University Matches')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {universities.map((uni, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GameCard className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <GraduationCap className="w-8 h-8 text-blue-400" />
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {t('results.universities.match', {
                              value: uni.matchPercentage || uni.match
                            })}
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2">
                          {uni.name}
                        </h3>
                        <p className="text-gray-300 mb-1">
                          {uni.city}, {uni.country}
                        </p>
                        <div className="space-y-2 mb-4 text-sm text-gray-300">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {uni.tuition}
                          </div>
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            {uni.scholarships}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {uni.deadline}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                          {uni.reason}
                        </p>
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              window.open(
                                uni.websiteUrl || uni.mainUrl || '#',
                                '_blank'
                              )
                            }
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          >
                            <ExternalLink className="inline w-4 h-4 mr-2" />
                            {resultsButtons.visitWebsite ||
                              t(
                                'results.buttons.visitWebsite',
                                'Visit website'
                              )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              window.open(
                                uni.applicationUrl || uni.applyUrl || '#',
                                '_blank'
                              )
                            }
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          >
                            <FileText className="inline w-4 h-4 mr-2" />
                            {resultsButtons.applyNow ||
                              t(
                                'results.buttons.applyNow',
                                'Go to application'
                              )}
                          </motion.button>
                        </div>
                      </GameCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Scholarships Section */}
            {scholarships.length > 0 && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsSections.scholarships ||
                    t('results.sections.scholarships', '💰 Scholarships')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scholarships.map((scholarship, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                    >
                      <GameCard className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                            {scholarship.amount}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              scholarship.probability === 'Very High'
                                ? 'bg-green-500 text-white'
                                : scholarship.probability === 'High'
                                ? 'bg-blue-500 text-white'
                                : 'bg-yellow-500 text-black'
                            }`}
                          >
                            {t('results.scholarships.chance', {
                              probability: scholarship.probability
                            })}
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2">
                          {scholarship.name}
                        </h3>
                        <p className="text-blue-400 mb-2">
                          {scholarship.provider}
                        </p>
                        <div className="flex items-center text-sm text-gray-300 mb-4">
                          <Clock className="w-4 h-4 mr-2" />
                          {t('results.scholarships.deadline', {
                            date: scholarship.deadline
                          })}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                          {scholarship.description}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const url =
                              scholarship.applicationUrl ||
                              scholarship.applyUrl ||
                              scholarship.url ||
                              '#'
                            window.open(url, '_blank')
                          }}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-semibold transition-all cursor-pointer"
                        >
                          <Award className="inline w-4 h-4 mr-2" />
                          {resultsButtons.applyNow ||
                            t('results.buttons.applyNow', 'Apply now')}
                        </motion.button>
                      </GameCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            {(resourceGroups?.sopTools?.length ||
              resourceGroups?.resumeBuilders?.length ||
              resourceGroups?.testPrep?.length ||
              resourceGroups?.forums?.length) && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsSections.resources ||
                    t('results.sections.resources', '🛠 Tools & Resources')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name:
                        resultsResources.sop ||
                        t('results.resources.sop', 'SOP Tools'),
                      icon: FileText,
                      color: 'bg-blue-500',
                      list: resourceGroups.sopTools
                    },
                    {
                      name:
                        resultsResources.resume ||
                        t('results.resources.resume', 'Resume Builders'),
                      icon: User,
                      color: 'bg-green-500',
                      list: resourceGroups.resumeBuilders
                    },
                    {
                      name:
                        resultsResources.testPrep ||
                        t('results.resources.testPrep', 'Test Prep'),
                      icon: BookOpen,
                      color: 'bg-purple-500',
                      list: resourceGroups.testPrep
                    },
                    {
                      name:
                        resultsResources.forums ||
                        t('results.resources.forums', 'Forums & Community'),
                      icon: Users,
                      color: 'bg-orange-500',
                      list: resourceGroups.forums
                    }
                  ].map((resource, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const url = resource.list?.[0]?.url
                        if (url) window.open(url, '_blank')
                      }}
                      className="cursor-pointer"
                    >
                      <GameCard className="text-center p-6">
                        <div
                          className={`w-12 h-12 mx-auto mb-3 ${resource.color} rounded-full flex items-center justify-center`}
                        >
                          <resource.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-sm">
                          {resource.name}
                        </h3>
                      </GameCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Section */}
            {timelinePhases.length > 0 && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsSections.timeline ||
                    t('results.sections.timeline', '📅 Your Roadmap')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {timelinePhases.map((phase, index) => (
                    <GameCard key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-sm text-gray-400">{phase.phase}</p>
                      <p className="text-white text-xl font-bold">
                        {phase.duration}
                      </p>
                    </GameCard>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <GameCard className="text-center">
              <h3 className="game-font text-xl font-bold text-white mb-4">
                {resultsActions.title ||
                  t('results.actions.title', 'Ready for your next move?')}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold"
                >
                  <Rocket className="inline w-5 h-5 mr-2" />
                  {resultsActions.startNew ||
                    t('results.actions.startNew', 'Start a new quest')}
                </motion.button>
              </div>
            </GameCard>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      {showConfetti && <Confetti />}

      <GameProgress
        currentStep={currentStep}
        totalSteps={steps.length - 1}
        xp={xp}
        level={level}
        labels={{
          level: t('progress.level', { level }),
          xp: t('progress.xp', { xp }),
          quest: t('progress.quest', {
            current: currentStep,
            total: steps.length - 1
          })
        }}
      />

      <LanguageSwitcher
        currentLanguage={language}
        onChange={handleLanguageChange}
        t={t}
      />

      <Achievement
        {...achievementData}
        show={showAchievement}
        onHide={() => setShowAchievement(false)}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </div>
    </div>
  )
}

export default App
