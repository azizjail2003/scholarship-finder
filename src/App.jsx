import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useTranslation } from 'react-i18next'
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
  Edit3
} from 'lucide-react'

const languageOptions = ['en', 'fr', 'es', 'ar']

const degreeOptionValues = {
  bachelor: "Bachelor's",
  master: "Master's",
  phd: "PhD",
  diploma: "Diploma"
}

const budgetOptionValues = {
  full: 'Full scholarship needed',
  partial: 'Partial scholarship (50-75%)',
  contribute: 'Can pay 25-50%',
  selfFund: 'Can self-fund'
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
      className={`${primaryClassName} px-6 py-3 rounded-xl font-bold text-center flex items-center justify-center ${primaryDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
      {stars.map(star => (
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
    <div className="fixed top-4 left-4 right-4 z-50">
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

const GameCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`glass-morphism rounded-2xl p-8 border border-white/20 ${className}`}
  >
    {children}
  </motion.div>
)

const GameInput = ({ icon: Icon, label, type = "text", value, onChange, options, required = false, placeholder, selectPlaceholder = "Select..." }) => (
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
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
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

const computeProgress = (targetIndex) => {
  const boundedIndex = Math.min(Math.max(targetIndex, 0), steps.length - 1)
  const xpValue = calculateXpForStep(boundedIndex)
  const levelValue = getLevelFromXp(xpValue)
  return { boundedIndex, xpValue, levelValue }
}

const safeParseJSON = (value, fallback) => {
  if (value == null) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (error) {
      console.warn('Failed to parse JSON value', value, error)
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

function App() {
  const { t, i18n } = useTranslation()
  const storedFormData = useMemo(() => getStoredFormData(), [])
  const storedStep = useMemo(() => getStoredStep(), [])
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

  const [formData, setFormData] = useState(() => ({
    ...storedFormData,
    languagePreference: initialLanguage
  }))
  const parsedResults = ensureObject(aiResults?.data, {})
  const recommendationData = ensureObject(parsedResults.recommendations, {})
  const linkData = ensureObject(parsedResults.linksData, {})
  const checklistItems = ensureArray(recommendationData.checklist)
  const timelinePhases = ensureArray(recommendationData.timeline)
  const universities = ensureArray(linkData.universities)
  const scholarships = ensureArray(linkData.scholarships)
  const resourceGroups = ensureObject(linkData.resources)

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

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setFormData(prev => ({ ...prev, languagePreference: lang }))
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
  const resultsChecklist = resultsCopy.checklist || {}

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          t('achievement.stepCompleteDescription', { stepTitle: t(`steps.${completedStep.id}.title`), xp: completedStep.xpReward }),
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

  const submitForm = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:5680/webhook/scholarship-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        const responseData = Array.isArray(result) ? result[0] : result
        
        if (responseData.success) {
          // Store the AI results
          setAiResults(responseData)
          showAchievementPopup(
            t('achievement.questCompleteTitle'),
            t('achievement.questCompleteDescription'),
            Trophy
          )
          setShowConfetti(true)
          
          // Instead of redirecting, show results in the app
          setTimeout(() => {
            nextStep()
          }, 2000)
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert(t('alerts.questFailed'))
      setCurrentStep(currentStep - 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigationCopy = t('navigation', { returnObjects: true })
  const renderStepContent = () => {
    const step = steps[currentStep]
    const stepCopy = stepsCopy?.[step.id] || {}

    switch (step.id) {
      case 'welcome':
        return (
          <GameCard className="text-center max-w-2xl mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              <Rocket className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="game-font text-4xl font-bold text-white mb-4">
              {stepCopy.headline}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {stepCopy.description}
            </p>
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
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
                    animate={{ width: ["0%", "100%"] }}
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
        const heroTitle = recommendationData.hero?.title || t('results.hero.title', { name: formData.name })
        const heroDescription = recommendationData.hero?.description || resultsCopy.hero.description
        const heroLevel = t('results.hero.level', { level })
        const heroXp = t('results.hero.xp', { xp })

        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <GameCard className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Star className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="game-font text-4xl font-bold text-white mb-4">{heroTitle}</h1>
              <p className="text-xl text-gray-300 mb-6">{heroDescription}</p>
              {checklistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className={`w-5 h-5 mt-1 ${item.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`} />
                      <div>
                        <p className="text-white font-semibold">{item.item}</p>
                        <p className="text-sm text-gray-300">
                          {t('results.checklist.status', { status: item.status })} • {t('results.checklist.urgency', { urgency: item.urgency })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mb-6">
                  {resultsCopy.checklist?.empty || t('results.checklist.empty', 'No checklist items yet')}
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
              </div>
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
                  window.location.reload()
                }}
                primaryClassName="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              />
            </GameCard>

            {/* Universities Section - From AI Results */}
            {universities.length > 0 && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsCopy.sections.universities}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {universities.map((uni, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <GameCard className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <GraduationCap className="w-8 h-8 text-blue-400" />
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {t('results.universities.match', { value: uni.matchPercentage || uni.match })}
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2">{uni.name}</h3>
                        <p className="text-gray-300 mb-4">{uni.country}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {uni.tuition}
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Award className="w-4 h-4 mr-2" />
                            {uni.scholarships}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{uni.reason}</p>
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(uni.websiteUrl || uni.mainUrl || '#', '_blank')}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          >
                            <ExternalLink className="inline w-4 h-4 mr-2" />
                            {resultsCopy.buttons.visitWebsite}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(uni.applicationUrl || uni.applyUrl || '#', '_blank')}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                          >
                            <FileText className="inline w-4 h-4 mr-2" />
                            {resultsCopy.buttons.applyNow}
                          </motion.button>
                        </div>
                      </GameCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Scholarships Section - From AI Results */}
            {scholarships.length > 0 && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsCopy.sections.scholarships}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scholarships.map((scholarship, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.3 }}
                    >
                      <GameCard className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                            {scholarship.amount}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            scholarship.probability === 'Very High' ? 'bg-green-500 text-white' :
                            scholarship.probability === 'High' ? 'bg-blue-500 text-white' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {t('results.scholarships.chance', { probability: scholarship.probability })}
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2">{scholarship.name}</h3>
                        <p className="text-blue-400 mb-2">{scholarship.provider}</p>
                        <div className="flex items-center text-sm text-gray-300 mb-4">
                          <Clock className="w-4 h-4 mr-2" />
                          {t('results.scholarships.deadline', { date: scholarship.deadline })}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{scholarship.description}</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const url = scholarship.applicationUrl || scholarship.applyUrl || scholarship.url || '#'
                            window.open(url, '_blank')
                          }}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-semibold transition-all cursor-pointer"
                        >
                          <Award className="inline w-4 h-4 mr-2" />
                          {resultsCopy.buttons.applyNow}
                        </motion.button>
                      </GameCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            {(resourceGroups?.sopTools?.length || resourceGroups?.resumeBuilders?.length || resourceGroups?.testPrep?.length || resourceGroups?.forums?.length) && (
              <div>
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">
                  {resultsCopy.sections.resources}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: resultsCopy.resources.sop, icon: FileText, color: 'bg-blue-500', list: resourceGroups.sopTools },
                    { name: resultsCopy.resources.resume, icon: User, color: 'bg-green-500', list: resourceGroups.resumeBuilders },
                    { name: resultsCopy.resources.testPrep, icon: BookOpen, color: 'bg-purple-500', list: resourceGroups.testPrep },
                    { name: resultsCopy.resources.forums, icon: Users, color: 'bg-orange-500', list: resourceGroups.forums }
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
                        <div className={`w-12 h-12 mx-auto mb-3 ${resource.color} rounded-full flex items-center justify-center`}>
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
                <h2 className="game-font text-2xl font-bold text-white mb-6 text-center">{t('results.sections.timeline', '📅 Your Roadmap')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {timelinePhases.map((phase, index) => (
                    <GameCard key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-sm text-gray-400">{phase.phase}</p>
                      <p className="text-white text-xl font-bold">{phase.duration}</p>
                    </GameCard>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <GameCard className="text-center">
              <h3 className="game-font text-xl font-bold text-white mb-4">{resultsCopy.actions.title}</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold"
                >
                  <Rocket className="inline w-5 h-5 mr-2" />
                  {resultsCopy.actions.startNew}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (aiResults?.redirectUrl) {
                      window.open(aiResults.redirectUrl, '_blank')
                    }
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold"
                >
                  <ExternalLink className="inline w-5 h-5 mr-2" />
                  {resultsCopy.actions.viewGuide}
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

  useEffect(() => {
    if (currentStep === steps.length - 2 && !isSubmitting) {
      // Auto-submit when reaching the 'complete' step (second to last)
      // Results step is the last step
    }
  }, [currentStep])

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

      <LanguageSwitcher currentLanguage={language} onChange={handleLanguageChange} t={t} />

      <Achievement
        {...achievementData}
        show={showAchievement}
        onHide={() => setShowAchievement(false)}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
