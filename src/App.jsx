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
  Link,
  ArrowLeft,
  Edit3,
  Heart,
  Filter,
  Sparkles,
  AlertTriangle,
  Download
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

const FORM_STORAGE_KEY = 'scholarshipQuest.form'
const STEP_STORAGE_KEY = 'scholarshipQuest.step'
const UNI_SHORTLIST_KEY = 'scholarshipQuest.shortlist.universities'
const SCH_SHORTLIST_KEY = 'scholarshipQuest.shortlist.scholarships'

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

/**
 * Safely parse JSON if it looks like JSON, otherwise return fallback
 */
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

/**
 * Manual interpolation for strings like "🎉 Your Perfect Matches, {{name}}!"
 * Works even if i18n interpolation is misconfigured.
 */
const interpolateTemplate = (template, vars = {}) => {
  if (typeof template !== 'string') return template
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? '')
}

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

// Steps
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

const computeProgress = (targetIndex) => {
  const boundedIndex = Math.min(Math.max(targetIndex, 0), steps.length - 1)
  const xpValue = calculateXpForStep(boundedIndex)
  const levelValue = getLevelFromXp(xpValue)
  return { boundedIndex, xpValue, levelValue }
}

/**
 * Small helper for PDF text wrapping
 */
const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 6) => {
  if (!text) return y
  const lines = doc.splitTextToSize(text, maxWidth)
  lines.forEach((line) => {
    doc.text(line, x, y)
    y += lineHeight
  })
  return y
}

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
              {Icon && <Icon className="w-6 h-6 text-game-bg" />}
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

/**
 * Compute "badges" based on profile & insights
 */
const computeBadges = (profile = {}, insights = {}, successProbability) => {
  const badges = []
  const normalizedGPA =
    typeof profile.gpa === 'number'
      ? profile.gpa
      : parseFloat(String(profile.gpa || '').split(/[^\d.]/)[0])

  if (normalizedGPA && normalizedGPA >= 3.7) {
    badges.push({
      label: 'GPA Pro',
      description: 'Your academic record is excellent.',
      color: 'bg-emerald-500/20 text-emerald-300'
    })
  }

  if (profile.workExperience) {
    badges.push({
      label: 'Hands-on Experience',
      description: 'Real-world work experience boosts your profile.',
      color: 'bg-blue-500/20 text-blue-300'
    })
  }

  if (profile.achievements) {
    const lower = String(profile.achievements).toLowerCase()
    if (lower.includes('paper') || lower.includes('hackathon') || lower.includes('award')) {
      badges.push({
        label: 'Achievement Hunter',
        description: 'Awards and achievements make you stand out.',
        color: 'bg-purple-500/20 text-purple-300'
      })
    }
  }

  if (profile.targetCountries && String(profile.targetCountries).includes(',')) {
    badges.push({
      label: 'Global Explorer',
      description: 'You are open to multiple study destinations.',
      color: 'bg-orange-500/20 text-orange-300'
    })
  }

  if (successProbability === 'Excellent' || successProbability === 'High') {
    badges.push({
      label: 'Top Chance',
      description: 'Your overall chances for funding look strong.',
      color: 'bg-yellow-500/20 text-yellow-300'
    })
  }

  return badges
}

const SummarySidebar = ({ formData, parsedResults, successProbability }) => {
  const profile = parsedResults.userProfile || formData
  if (!profile) return null

  const displayName = profile.name || 'Future Scholar'
  const displayGpa = profile.gpa || 'N/A'
  const displayDegree = profile.targetDegree || 'N/A'
  const displayCountries = profile.targetCountries || 'N/A'

  return (
    <GameCard className="sticky top-28 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-300">Current Profile</p>
          <p className="text-lg text-white font-semibold truncate">{displayName}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Target degree</span>
          <span className="text-white font-medium">{displayDegree}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">GPA</span>
          <span className="text-white font-medium">{displayGpa}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Target countries</span>
          <span className="text-white font-medium text-right truncate max-w-[160px]">
            {displayCountries}
          </span>
        </div>
        {successProbability && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Success chance</span>
            <span className="text-emerald-300 font-semibold">{successProbability}</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Your answers are automatically saved. You can close the app and come back later.
      </div>
    </GameCard>
  )
}

function App() {
  const { t, i18n } = useTranslation()

  const storedFormData = useMemo(() => getStoredFormData(), [])
  const storedStep = useMemo(() => {
    if (typeof window === 'undefined') return 0
    const saved = window.localStorage.getItem(STEP_STORAGE_KEY)
    if (!saved) return 0
    const n = parseInt(saved, 10)
    return Number.isNaN(n) ? 0 : Math.min(Math.max(n, 0), steps.length - 1)
  }, [])

  const initialLanguage = storedFormData.languagePreference || i18n.language || 'en'
  const initialProgress = useMemo(() => computeProgress(storedStep), [storedStep])

  const [currentStep, setCurrentStep] = useState(storedStep)
  const [xp, setXp] = useState(initialProgress.xpValue)
  const [level, setLevel] = useState(initialProgress.levelValue)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementData, setAchievementData] = useState({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiResults, setAiResults] = useState(null)
  const [language, setLanguage] = useState(initialLanguage)
  const [showResumePrompt, setShowResumePrompt] = useState(false)

  const [formData, setFormData] = useState(() => ({
    ...storedFormData,
    languagePreference: initialLanguage
  }))

  const [universityFilters, setUniversityFilters] = useState({
    country: 'all',
    freeTuitionOnly: false,
    minMatch: 0
  })
  const [scholarshipFilters, setScholarshipFilters] = useState({
    probability: 'all'
  })
  const [shortlistedUniversities, setShortlistedUniversities] = useState([])
  const [shortlistedScholarships, setShortlistedScholarships] = useState([])

  // Derived results from AI
  const parsedResults = ensureObject(aiResults, {})
  const universities = ensureArray(parsedResults.universities)
  const scholarships = ensureArray(parsedResults.scholarships)
  const resourceGroups = ensureObject(parsedResults.resources)
  const checklistItems = ensureArray(parsedResults.applicationChecklist?.documents)
  const timelinePhases = ensureArray(parsedResults.applicationChecklist?.timeline)
  const estimatedCosts = ensureObject(parsedResults.estimatedCosts)
  const personalizedInsights = ensureObject(parsedResults.personalizedInsights)
  const successProbability = parsedResults.successProbability || aiResults?.successProbability
  const profileFromResults = parsedResults.userProfile || {}

  const effectiveName = profileFromResults.name || formData.name || 'Future Scholar'

  const allCountries = useMemo(() => {
    const set = new Set()
    universities.forEach((u) => {
      if (u.country) set.add(u.country)
    })
    return Array.from(set)
  }, [universities])

  const filteredUniversities = useMemo(() => {
    return universities.filter((uni) => {
      if (universityFilters.country !== 'all' && uni.country !== universityFilters.country) {
        return false
      }

      if (universityFilters.freeTuitionOnly) {
        const tuitionText = String(uni.tuition || '').toLowerCase()
        if (
          !tuitionText.includes('$0') &&
          !tuitionText.includes('no tuition') &&
          !tuitionText.includes('0/year')
        ) {
          return false
        }
      }

      if (universityFilters.minMatch > 0) {
        const num = parseFloat(String(uni.matchPercentage || uni.match || '0').replace('%', ''))
        if (!Number.isNaN(num) && num < universityFilters.minMatch) return false
      }

      return true
    })
  }, [universities, universityFilters])

  const filteredScholarships = useMemo(() => {
    if (scholarshipFilters.probability === 'all') return scholarships
    return scholarships.filter(
      (s) => String(s.probability || '').toLowerCase() === scholarshipFilters.probability.toLowerCase()
    )
  }, [scholarships, scholarshipFilters])

  const badges = useMemo(
    () => computeBadges(profileFromResults || formData, personalizedInsights?.competitivenessAnalysis, successProbability),
    [profileFromResults, formData, personalizedInsights, successProbability]
  )

  // Load shortlist from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const uniSaved = window.localStorage.getItem(UNI_SHORTLIST_KEY)
      const schSaved = window.localStorage.getItem(SCH_SHORTLIST_KEY)
      if (uniSaved) setShortlistedUniversities(JSON.parse(uniSaved))
      if (schSaved) setShortlistedScholarships(JSON.parse(schSaved))
    } catch (e) {
      console.warn('Failed to load shortlist from localStorage', e)
    }
  }, [])

  // Persist form data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData])

  // Persist step
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STEP_STORAGE_KEY, String(currentStep))
    }
  }, [currentStep])

  // Persist shortlist
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(UNI_SHORTLIST_KEY, JSON.stringify(shortlistedUniversities))
  }, [shortlistedUniversities])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SCH_SHORTLIST_KEY, JSON.stringify(shortlistedScholarships))
  }, [shortlistedScholarships])

  // Ask to resume if saved progress exists
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedForm = window.localStorage.getItem(FORM_STORAGE_KEY)
    const savedStep = window.localStorage.getItem(STEP_STORAGE_KEY)
    if (savedForm || savedStep) {
      setShowResumePrompt(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setFormData((prev) => ({ ...prev, languagePreference: lang }))
  }

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

  const navigationCopy = t('navigation', { returnObjects: true })

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

  const validateCurrentStep = () => {
    const step = steps[currentStep]
    if (!step) return true

    if (step.id === 'personal') {
      if (!formData.name || !formData.email || !formData.age || !formData.nationality) {
        alert('Please fill in all required fields.')
        return false
      }
    }

    if (step.id === 'education') {
      if (!formData.currentEducation || !formData.gpa || !formData.englishLevel) {
        alert('Please complete your education details.')
        return false
      }
    }

    if (step.id === 'goals') {
      if (!formData.fieldOfInterest || !formData.targetDegree || !formData.budget) {
        alert('Please fill in your academic goals.')
        return false
      }
    }

    if (step.id === 'preferences') {
      if (!formData.targetCountries) {
        alert('Please provide at least one target country.')
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) return

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

  const toggleShortlistUni = (name) => {
    setShortlistedUniversities((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const toggleShortlistScholarship = (name) => {
    setShortlistedScholarships((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const submitForm = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(
        import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:5680/webhook/scholarship-finder',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const raw = await response.json()
      let core = raw

      // n8n may return array, or { success, data }, or something else
      if (Array.isArray(core)) {
        core = core[0] || {}
      } else if (core && typeof core === 'object') {
        if (Array.isArray(core.data)) {
          core = core.data[0] || {}
        } else if (core.data && typeof core.data === 'object') {
          core = core.data
        }
      }

      if (!core || typeof core !== 'object') {
        throw new Error('Unexpected response format from server')
      }

      // Normalize: keep studentName & successProbability from the top-level if available
      const normalized = {
        ...core,
        userProfile: core.userProfile || formData,
        studentName: raw.studentName || core.userProfile?.name || formData.name,
        successProbability: raw.successProbability || core.successProbability,
        success: raw.success,
        message: raw.message || 'Your personalized scholarship guide is ready!'
      }

      setAiResults(normalized)

      showAchievementPopup(
        t('achievement.questCompleteTitle'),
        t('achievement.questCompleteDescription'),
        Trophy
      )
      setShowConfetti(true)

      // Move to results step after a short celebration
      setTimeout(() => {
        jumpToStep(steps.findIndex((s) => s.id === 'results'))
      }, 2000)
    } catch (error) {
      console.error('Submission error:', error)
      alert(t('alerts.questFailed'))
      // Go back to review step
      jumpToStep(steps.findIndex((s) => s.id === 'preferences'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!parsedResults || Object.keys(parsedResults).length === 0) {
      alert('No results to export yet.')
      return
    }

    const doc = new jsPDF()
    const margin = 14
    const pageWidth = doc.internal.pageSize.getWidth()

    const drawNavBar = (active) => {
      const sections = ['Universities', 'Scholarships', 'Checklist', 'Timeline']
      const xStart = margin
      const y = 20
      const buttonWidth = (pageWidth - margin * 2) / sections.length - 2
      const buttonHeight = 8

      sections.forEach((sec, index) => {
        const x = xStart + index * (buttonWidth + 2)
        const isActive = sec === active
        doc.setFillColor(isActive ? 56 : 30, isActive ? 189 : 41, isActive ? 248 : 82) // bluish vs dark
        doc.setDrawColor(255, 255, 255)
        doc.roundedRect(x, y, buttonWidth, buttonHeight, 2, 2, 'FD')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.text(sec, x + buttonWidth / 2, y + buttonHeight / 2 + 2, { align: 'center' })
      })

      doc.setTextColor(255, 255, 255)
    }

    // COVER PAGE
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('Scholarship Quest Report', margin, 40)

    doc.setFontSize(12)
    doc.text(`Student: ${effectiveName}`, margin, 55)
    if (successProbability) {
      doc.text(`Success Probability: ${successProbability}`, margin, 63)
    }

    if (profileFromResults.fieldOfInterest) {
      doc.text(`Field: ${profileFromResults.fieldOfInterest}`, margin, 71)
    }
    if (profileFromResults.targetDegree) {
      doc.text(`Target degree: ${profileFromResults.targetDegree}`, margin, 79)
    }

    // small badges
    let yBadge = 95
    badges.slice(0, 3).forEach((badge) => {
      doc.setFillColor(37, 99, 235)
      doc.roundedRect(margin, yBadge - 6, 60, 10, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.text(badge.label, margin + 3, yBadge)
      yBadge += 12
    })

    doc.setFontSize(10)
    doc.setTextColor(226, 232, 240)
    let y = yBadge + 4
    y = addWrappedText(
      doc,
      'This report summarizes your personalized university and scholarship matches, plus a step-by-step checklist and timeline to guide your applications.',
      margin,
      y,
      pageWidth - margin * 2
    )

    // TABLE OF CONTENTS
    doc.addPage()
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
    doc.setTextColor(255, 255, 255)

    doc.setFontSize(16)
    doc.text('Table of Contents', margin, 30)
    doc.setFontSize(11)

    const tocItems = [
      '1. Profile Snapshot',
      '2. Recommended Universities',
      '3. Scholarships',
      '4. Application Checklist',
      '5. Timeline & Estimated Costs'
    ]
    let tocY = 45
    tocItems.forEach((item) => {
      doc.circle(margin + 2, tocY - 2.5, 1, 'F')
      doc.text(item, margin + 6, tocY)
      tocY += 8
    })

    // UNIVERSITIES PAGE
    if (filteredUniversities.length > 0) {
      doc.addPage()
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
      drawNavBar('Universities')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.text('Recommended Universities', margin, 36)

      y = 48
      doc.setFontSize(9)

      filteredUniversities.forEach((uni, index) => {
        if (y > 260) {
          doc.addPage()
          doc.setFillColor(15, 23, 42)
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
          drawNavBar('Universities')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(14)
          doc.text('Recommended Universities (cont.)', margin, 36)
          y = 48
          doc.setFontSize(9)
        }

        const isShortlisted = shortlistedUniversities.includes(uni.name)

        doc.setTextColor(52, 211, 153)
        doc.text(`${index + 1}. ${uni.name}`, margin, y)
        y += 5
        doc.setTextColor(148, 163, 184)
        y = addWrappedText(
          doc,
          `${uni.city || ''} ${uni.country ? `(${uni.country})` : ''}`,
          margin,
          y,
          pageWidth - margin * 2
        )

        const row1 = [
          `Match: ${uni.matchPercentage || uni.match || 'N/A'}`,
          `Tuition: ${uni.tuition || 'N/A'}`,
          `Scholarship: ${uni.scholarships || 'N/A'}`
        ].join('  |  ')
        y = addWrappedText(doc, row1, margin, y + 2, pageWidth - margin * 2)

        if (uni.reason) {
          y = addWrappedText(doc, `Why it fits you: ${uni.reason}`, margin, y + 2, pageWidth - margin * 2)
        }
        if (uni.requirements) {
          y = addWrappedText(
            doc,
            `Key requirements: ${uni.requirements}`,
            margin,
            y + 2,
            pageWidth - margin * 2
          )
        }

        y += 2
        doc.setTextColor(226, 232, 240)
        doc.text(
          `[ ] Shortlisted  ${isShortlisted ? '(mark this if yes)' : ''}`,
          margin,
          (y += 5)
        )

        y += 5
        doc.setDrawColor(55, 65, 81)
        doc.line(margin, y, pageWidth - margin, y)
        y += 6
        doc.setTextColor(255, 255, 255)
      })
    }

    // SCHOLARSHIPS PAGE
    if (filteredScholarships.length > 0) {
      doc.addPage()
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
      drawNavBar('Scholarships')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.text('Scholarships', margin, 36)

      y = 48
      doc.setFontSize(9)

      filteredScholarships.forEach((sch, index) => {
        if (y > 260) {
          doc.addPage()
          doc.setFillColor(15, 23, 42)
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
          drawNavBar('Scholarships')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(14)
          doc.text('Scholarships (cont.)', margin, 36)
          y = 48
          doc.setFontSize(9)
        }

        const isShortlisted = shortlistedScholarships.includes(sch.name)

        doc.setTextColor(249, 115, 22)
        doc.text(`${index + 1}. ${sch.name}`, margin, y)
        y += 5
        doc.setTextColor(148, 163, 184)
        y = addWrappedText(
          doc,
          `${sch.provider || 'Provider'}  |  Amount: ${sch.amount || 'N/A'}  |  Probability: ${
            sch.probability || 'N/A'
          }`,
          margin,
          y,
          pageWidth - margin * 2
        )

        if (sch.description) {
          y = addWrappedText(doc, sch.description, margin, y + 2, pageWidth - margin * 2)
        }
        if (sch.eligibility) {
          y = addWrappedText(
            doc,
            `Eligibility: ${sch.eligibility}`,
            margin,
            y + 2,
            pageWidth - margin * 2
          )
        }
        if (sch.deadline) {
          y = addWrappedText(
            doc,
            `Deadline: ${sch.deadline}`,
            margin,
            y + 2,
            pageWidth - margin * 2
          )
        }

        y += 2
        doc.setTextColor(226, 232, 240)
        doc.text(
          `[ ] Shortlisted  ${isShortlisted ? '(mark this if yes)' : ''}`,
          margin,
          (y += 5)
        )
        y += 5
        doc.setDrawColor(55, 65, 81)
        doc.line(margin, y, pageWidth - margin, y)
        y += 6
        doc.setTextColor(255, 255, 255)
      })
    }

    // CHECKLIST PAGE
    if (checklistItems.length > 0) {
      doc.addPage()
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
      drawNavBar('Checklist')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.text('Application Checklist', margin, 36)

      y = 48
      doc.setFontSize(9)

      checklistItems.forEach((item, index) => {
        if (y > 260) {
          doc.addPage()
          doc.setFillColor(15, 23, 42)
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
          drawNavBar('Checklist')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(14)
          doc.text('Application Checklist (cont.)', margin, 36)
          y = 48
          doc.setFontSize(9)
        }

        doc.setTextColor(148, 163, 184)
        doc.text(`[ ] ${item.item}`, margin, y)
        y += 5
        doc.setTextColor(148, 163, 184)
        doc.text(`Status: ${item.status}  •  Urgency: ${item.urgency}`, margin + 5, y)
        y += 8
        doc.setTextColor(255, 255, 255)
      })
    }

    // TIMELINE & COSTS PAGE
    if (timelinePhases.length > 0 || Object.keys(estimatedCosts).length > 0) {
      doc.addPage()
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
      drawNavBar('Timeline')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.text('Timeline & Estimated Costs', margin, 36)

      y = 48
      doc.setFontSize(11)
      doc.text('Timeline', margin, y)
      y += 6
      doc.setFontSize(9)

      timelinePhases.forEach((phase) => {
        if (y > 260) {
          doc.addPage()
          doc.setFillColor(15, 23, 42)
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')
          drawNavBar('Timeline')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(14)
          doc.text('Timeline & Estimated Costs (cont.)', margin, 36)
          y = 48
          doc.setFontSize(9)
        }

        doc.setTextColor(248, 250, 252)
        doc.text(`• ${phase.phase}: ${phase.duration}`, margin, y)
        y += 7
      })

      if (Object.keys(estimatedCosts).length > 0) {
        y += 4
        doc.setFontSize(11)
        doc.setTextColor(255, 255, 255)
        doc.text('Estimated Costs', margin, y)
        y += 6
        doc.setFontSize(9)
        doc.setTextColor(148, 163, 184)

        const costLines = [
          estimatedCosts.applicationFees && `Application fees: ${estimatedCosts.applicationFees}`,
          estimatedCosts.testFees && `Test fees: ${estimatedCosts.testFees}`,
          estimatedCosts.visaFees && `Visa fees: ${estimatedCosts.visaFees}`,
          estimatedCosts.totalEstimate &&
            `Total estimated budget: ${estimatedCosts.totalEstimate}`
        ].filter(Boolean)

        costLines.forEach((line) => {
          y = addWrappedText(doc, line, margin, y, pageWidth - margin * 2)
          y += 4
        })
      }
    }

    // FOOTER branding
    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      const footerY = doc.internal.pageSize.getHeight() - 8
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Scholarship Quest • Generated for ${effectiveName} • Powered by AITEK Solutions`,
        margin,
        footerY
      )
    }

    doc.save(`scholarship-quest-${effectiveName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const handleEmailMe = () => {
    if (!parsedResults || (filteredUniversities.length === 0 && filteredScholarships.length === 0)) {
      alert('No results to share yet.')
      return
    }

    const to = formData.email || ''
    const subject = 'My Scholarship Quest Roadmap'

    const topUnis = filteredUniversities.slice(0, 3)
    const topSch = filteredScholarships.slice(0, 3)

    const lines = []
    lines.push(`Hi,`)
    lines.push('')
    lines.push(`Here is my shortlist from Scholarship Quest:`)
    lines.push('')
    if (topUnis.length > 0) {
      lines.push('Top Universities:')
      topUnis.forEach((u) => {
        lines.push(`- ${u.name} (${u.country}) – Match: ${u.matchPercentage || 'N/A'}`)
      })
      lines.push('')
    }
    if (topSch.length > 0) {
      lines.push('Top Scholarships:')
      topSch.forEach((s) => {
        lines.push(`- ${s.name} – Probability: ${s.probability || 'N/A'}`)
      })
      lines.push('')
    }
    lines.push('Generated by Scholarship Quest.')

    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${body}`
  }

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
              <h2 className="game-font text-3xl font-bold text-white mb-2">{stepCopy.title}</h2>
              <p className="text-gray-300">{stepCopy.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <h2 className="game-font text-3xl font-bold text-white mb-2">{stepCopy.title}</h2>
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
              <h2 className="game-font text-3xl font-bold text-white mb-2">{stepCopy.title}</h2>
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
              <h2 className="game-font text-3xl font-bold text-white mb-2">{stepCopy.title}</h2>
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
              <h2 className="game-font text-3xl font-bold text-white mb-2">{stepCopy.title}</h2>
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
                <p className="text-xl text-gray-300 mb-4">{stepCopy.loadingDescription}</p>
                <p className="text-sm text-gray-400 mb-6">
                  You can lock your screen or switch apps. We’ll keep your progress and show your
                  results as soon as they are ready.
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
                <h2 className="game-font text-3xl font-bold text-white mb-4">{stepCopy.title}</h2>
                <p className="text-xl text-gray-300 mb-8">{stepCopy.description}</p>
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
        if (!parsedResults || Object.keys(parsedResults).length === 0) {
          return (
            <GameCard className="text-center max-w-2xl mx-auto">
              <div className="flex flex-col items-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-yellow-400" />
                <h2 className="game-font text-2xl text-white font-bold">
                  We couldn’t load your results
                </h2>
                <p className="text-gray-300">
                  It looks like the previous request was interrupted (for example, if the screen
                  turned off). Tap the button below to regenerate your guide.
                </p>
                <StepNavigation
                  showBack
                  backLabel={navigationCopy.back}
                  onBack={() => jumpToStep(steps.findIndex((s) => s.id === 'preferences'))}
                  primaryLabel="Regenerate results"
                  primaryIcon={Sparkles}
                  onPrimary={submitForm}
                />
              </div>
            </GameCard>
          )
        }

        const heroTitleTemplate = heroCopy.title || t('results.hero.title')
        const heroDescriptionTemplate =
          heroCopy.description ||
          t('results.hero.description', 'Your personalized scholarship guide is ready!')

        const heroTitle = interpolateTemplate(heroTitleTemplate, { name: effectiveName })
        const heroDescription = interpolateTemplate(heroDescriptionTemplate, {
          name: effectiveName
        })

        const heroLevel = t('results.hero.level', { level })
        const heroXp = t('results.hero.xp', { xp })

        const myShortlistUniversities = universities.filter((u) =>
          shortlistedUniversities.includes(u.name)
        )
        const myShortlistScholarships = scholarships.filter((s) =>
          shortlistedScholarships.includes(s.name)
        )

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
              <h1 className="game-font text-4xl font-bold text-white mb-4">{heroTitle}</h1>
              <p className="text-xl text-gray-300 mb-6">{heroDescription}</p>

              {badges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border border-white/10 ${badge.color}`}
                    >
                      {badge.label}
                    </div>
                  ))}
                </div>
              )}

              {checklistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle
                        className={`w-5 h-5 mt-1 ${
                          item.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      />
                      <div>
                        <p className="text-white font-semibold">{item.item}</p>
                        <p className="text-sm text-gray-300">
                          Status: {item.status} • Urgency: {item.urgency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mb-6">
                  {resultsCopy.checklist?.empty ||
                    t('results.checklist.empty', 'No checklist items yet')}
                </p>
              )}

              <div className="flex justify-center space-x-4 text-sm mb-4">
                <div className="bg-blue-500/20 px-4 py-2 rounded-full">
                  <Trophy className="inline w-4 h-4 mr-2" />
                  {heroLevel}
                </div>
                <div className="bg-purple-500/20 px-4 py-2 rounded-full">
                  <Star className="inline w-4 h-4 mr-2" />
                  {heroXp}
                </div>
                {successProbability && (
                  <div className="bg-emerald-500/20 px-4 py-2 rounded-full">
                    <Sparkles className="inline w-4 h-4 mr-2" />
                    {successProbability} chance
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <StepNavigation
                  showBack
                  backLabel={navigationCopy.edit}
                  backIcon={Edit3}
                  onBack={() => jumpToStep(1)}
                  primaryLabel={resultsActions.startNew}
                  primaryIcon={Rocket}
                  onPrimary={() => {
                    window.localStorage.removeItem(FORM_STORAGE_KEY)
                    window.localStorage.removeItem(STEP_STORAGE_KEY)
                    window.localStorage.removeItem(UNI_SHORTLIST_KEY)
                    window.localStorage.removeItem(SCH_SHORTLIST_KEY)
                    window.location.reload()
                  }}
                  primaryClassName="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                />
              </div>
            </GameCard>

            {/* My Shortlist */}
            {(myShortlistUniversities.length > 0 || myShortlistScholarships.length > 0) && (
              <GameCard>
                <h2 className="game-font text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  My Shortlist
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myShortlistUniversities.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Universities</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {myShortlistUniversities.map((u) => (
                          <li key={u.name} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>
                              {u.name} ({u.country}) – Match: {u.matchPercentage || 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {myShortlistScholarships.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Scholarships</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {myShortlistScholarships.map((s) => (
                          <li key={s.name} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>
                              {s.name} – Probability: {s.probability || 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </GameCard>
            )}

            {/* Universities Filters & Section */}
            {universities.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <h2 className="game-font text-2xl font-bold text-white">
                    {resultsSections.universities || 'Recommended Universities'}
                  </h2>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-300" />
                      <select
                        value={universityFilters.country}
                        onChange={(e) =>
                          setUniversityFilters((prev) => ({
                            ...prev,
                            country: e.target.value
                          }))
                        }
                        className="bg-game-card border border-white/10 text-white text-xs rounded-lg px-2 py-1"
                      >
                        <option value="all">All countries</option>
                        {allCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-1 text-gray-300">
                      <input
                        type="checkbox"
                        checked={universityFilters.freeTuitionOnly}
                        onChange={(e) =>
                          setUniversityFilters((prev) => ({
                            ...prev,
                            freeTuitionOnly: e.target.checked
                          }))
                        }
                        className="rounded border-gray-400"
                      />
                      Free tuition only
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 hidden sm:inline">Min match</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={universityFilters.minMatch}
                        onChange={(e) =>
                          setUniversityFilters((prev) => ({
                            ...prev,
                            minMatch: Number(e.target.value)
                          }))
                        }
                      />
                      <span className="text-gray-200 text-xs">
                        {universityFilters.minMatch}%
                      </span>
                    </div>
                  </div>
                </div>
                {filteredUniversities.length === 0 ? (
                  <p className="text-gray-400 text-sm mb-4">
                    No universities match your filters. Try lowering the minimum match or removing
                    some filters.
                  </p>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUniversities.map((uni, index) => {
                    const isShortlisted = shortlistedUniversities.includes(uni.name)
                    return (
                      <motion.div
                        key={uni.name || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GameCard className="h-full">
                          <div className="flex items-center justify-between mb-4">
                            <GraduationCap className="w-8 h-8 text-blue-400" />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleShortlistUni(uni.name)}
                                className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition"
                              >
                                <Heart
                                  className={`w-5 h-5 ${
                                    isShortlisted
                                      ? 'text-pink-400 fill-pink-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Match {uni.matchPercentage || uni.match || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <h3 className="font-bold text-white text-lg mb-1">{uni.name}</h3>
                          <p className="text-gray-300 mb-3">
                            {uni.city}, {uni.country}
                          </p>
                          <div className="space-y-2 mb-4 text-sm text-gray-300">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>{uni.tuition}</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              <span>{uni.scholarships}</span>
                            </div>
                            {uni.deadline && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Deadline: {uni.deadline}</span>
                              </div>
                            )}
                          </div>
                          {uni.reason && (
                            <p className="text-sm text-gray-400 mb-4">{uni.reason}</p>
                          )}
                          <div className="space-y-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                window.open(uni.websiteUrl || uni.mainUrl || '#', '_blank')
                              }
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                            >
                              <ExternalLink className="inline w-4 h-4 mr-2" />
                              {resultsButtons.visitWebsite}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                window.open(uni.applicationUrl || uni.applyUrl || '#', '_blank')
                              }
                              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                            >
                              <FileText className="inline w-4 h-4 mr-2" />
                              {resultsButtons.applyNow}
                            </motion.button>
                          </div>
                        </GameCard>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Scholarships Filters & Section */}
            {scholarships.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <h2 className="game-font text-2xl font-bold text-white">
                    {resultsSections.scholarships || 'Scholarships'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-gray-300" />
                    <select
                      value={scholarshipFilters.probability}
                      onChange={(e) =>
                        setScholarshipFilters({ probability: e.target.value })
                      }
                      className="bg-game-card border border-white/10 text-white text-xs rounded-lg px-2 py-1"
                    >
                      <option value="all">All chances</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                {filteredScholarships.length === 0 ? (
                  <p className="text-gray-400 text-sm mb-4">
                    No scholarships match your filter selection. Try switching back to “All
                    chances”.
                  </p>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredScholarships.map((scholarship, index) => {
                    const isShortlisted = shortlistedScholarships.includes(scholarship.name)
                    return (
                      <motion.div
                        key={scholarship.name || index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <GameCard className="h-full">
                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                              {scholarship.amount}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleShortlistScholarship(scholarship.name)}
                                className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition"
                              >
                                <Heart
                                  className={`w-5 h-5 ${
                                    isShortlisted
                                      ? 'text-pink-400 fill-pink-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  scholarship.probability === 'Very High'
                                    ? 'bg-green-500 text-white'
                                    : scholarship.probability === 'High'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-yellow-500 text-black'
                                }`}
                              >
                                Chance: {scholarship.probability}
                              </div>
                            </div>
                          </div>
                          <h3 className="font-bold text-white text-lg mb-2">{scholarship.name}</h3>
                          <p className="text-blue-400 mb-2">{scholarship.provider}</p>
                          <div className="flex items-center text-sm text-gray-300 mb-4">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Deadline: {scholarship.deadline}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{scholarship.description}</p>
                          {scholarship.eligibility && (
                            <p className="text-xs text-gray-400 mb-4">
                              Eligibility: {scholarship.eligibility}
                            </p>
                          )}
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
                            {resultsButtons.applyNow}
                          </motion.button>
                        </GameCard>
                      </motion.div>
                    )
                  })}
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
                  {resultsSections.resources || 'Helpful Resources'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: resultsResources.sop || 'SOP Tools',
                      icon: FileText,
                      color: 'bg-blue-500',
                      list: resourceGroups.sopTools
                    },
                    {
                      name: resultsResources.resume || 'Resume Builders',
                      icon: User,
                      color: 'bg-green-500',
                      list: resourceGroups.resumeBuilders
                    },
                    {
                      name: resultsResources.testPrep || 'Test Prep',
                      icon: BookOpen,
                      color: 'bg-purple-500',
                      list: resourceGroups.testPrep
                    },
                    {
                      name: resultsResources.forums || 'Forums',
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
                        <h3 className="text-white font-semibold text-sm">{resource.name}</h3>
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
                  {resultsSections.timeline || '📅 Your Roadmap'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {timelinePhases.map((phase, index) => (
                    <GameCard key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{phase.phase}</p>
                      <p className="text-white text-xl font-bold">{phase.duration}</p>
                    </GameCard>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <GameCard className="text-center">
              <h3 className="game-font text-xl font-bold text-white mb-4">
                {resultsActions.title || 'Next Actions'}
              </h3>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center"
                >
                  <Rocket className="inline w-5 h-5 mr-2" />
                  {resultsActions.startNew || 'Start a new quest'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPdf}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center"
                >
                  <Download className="inline w-5 h-5 mr-2" />
                  Download PDF report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEmailMe}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center"
                >
                  <Mail className="inline w-5 h-5 mr-2" />
                  Email me my roadmap
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (aiResults?.redirectUrl) {
                      window.open(aiResults.redirectUrl, '_blank')
                    }
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center"
                >
                  <ExternalLink className="inline w-5 h-5 mr-2" />
                  {resultsActions.viewGuide || 'View full guide'}
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
          quest: t('progress.quest', { current: currentStep, total: steps.length - 1 })
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

      {/* Resume modal */}
      <AnimatePresence>
        {showResumePrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism rounded-2xl p-6 max-w-md w-full border border-white/20"
            >
              <h2 className="game-font text-xl text-white font-bold mb-2">
                Continue your quest?
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                We found saved answers from your last session. Would you like to continue where you
                left off, or start a brand new quest?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20"
                  onClick={() => setShowResumePrompt(false)}
                >
                  Continue
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold"
                  onClick={() => {
                    window.localStorage.removeItem(FORM_STORAGE_KEY)
                    window.localStorage.removeItem(STEP_STORAGE_KEY)
                    window.localStorage.removeItem(UNI_SHORTLIST_KEY)
                    window.localStorage.removeItem(SCH_SHORTLIST_KEY)
                    setFormData({ ...defaultFormData, languagePreference: language })
                    jumpToStep(0)
                    setShowResumePrompt(false)
                  }}
                >
                  Start new
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 py-20 lg:flex lg:space-x-6">
        <div className="flex-1">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
        <div className="hidden lg:block w-80">
          <SummarySidebar
            formData={formData}
            parsedResults={parsedResults}
            successProbability={successProbability}
          />
        </div>
      </div>
    </div>
  )
}

export default App
