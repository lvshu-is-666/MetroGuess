const MetroCommon = require('../../utils/common')
const MetroGameLogic = require('../../utils/game-logic')
const Firebase = require('../../utils/firebase')

const app = getApp()

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

Page({
  data: {
    theme: 'light',
    loading: true,
    error: null,
    needInviteCode: false,
    inputInviteCode: '',
    quiz: null,
    quizId: '',

    gameStarted: false,
    gameWon: false,
    difficulty: 'normal',
    difficultySettings: MetroGameLogic.DIFFICULTY_SETTINGS.normal,
    keyboardRows: KEYBOARD_ROWS,

    stations: [],
    usedLetters: [],
    foundLetters: [],
    score: 0,
    elapsedTime: 0,
    solvedCount: 0,
    hintsLeft: 3,
    guessInput: '',
    guessCount: 0,
    progress: 0,
    finalScore: 0,

    timer: null,
    gameState: null
  },

  onLoad(options) {
    this.setData({
      theme: app.globalData.theme,
      quizId: options.id || ''
    })

    if (!this.data.quizId) {
      this.setData({
        loading: false,
        error: '缺少题组ID'
      })
      return
    }

    this.loadQuiz()
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  async loadQuiz() {
    try {
      const quiz = await Firebase.getQuiz(this.data.quizId)

      if (!quiz) {
        this.setData({
          loading: false,
          error: '题组不存在'
        })
        return
      }

      const accessResult = Firebase.validateQuizAccess(quiz)

      if (!accessResult.valid) {
        if (accessResult.needInviteCode) {
          this.setData({
            loading: false,
            needInviteCode: true,
            quiz
          })
        } else {
          this.setData({
            loading: false,
            error: accessResult.error
          })
        }
        return
      }

      this.setData({
        loading: false,
        quiz
      })
    } catch (e) {
      console.error('Failed to load quiz:', e)
      this.setData({
        loading: false,
        error: '加载失败'
      })
    }
  },

  onInviteCodeInput(e) {
    this.setData({ inputInviteCode: e.detail.value.toUpperCase() })
  },

  submitInviteCode() {
    const { inputInviteCode, quiz } = this.data

    if (!inputInviteCode.trim()) {
      MetroCommon.showToast('请输入邀请码', 'error')
      return
    }

    const accessResult = Firebase.validateQuizAccess(quiz, inputInviteCode.trim())

    if (!accessResult.valid) {
      MetroCommon.showToast(accessResult.error, 'error')
      return
    }

    this.setData({
      needInviteCode: false
    })
  },

  selectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty
    this.setData({
      difficulty,
      difficultySettings: MetroGameLogic.DIFFICULTY_SETTINGS[difficulty]
    })
  },

  startGame() {
    const { quiz, difficulty } = this.data
    const settings = MetroGameLogic.DIFFICULTY_SETTINGS[difficulty]

    const allQuestions = [...quiz.questions]
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    const selectedStations = shuffled.slice(0, Math.min(settings.stationCount, allQuestions.length))

    const gameState = MetroGameLogic.initGameState(selectedStations, difficulty)

    const stations = selectedStations.map((s, i) => ({
      ...s,
      index: i,
      solved: false,
      displayText: MetroCommon.getDisplayText(s.station_en, [], false)
    }))

    this.setData({
      gameStarted: true,
      gameWon: false,
      stations,
      usedLetters: [],
      foundLetters: [],
      score: 0,
      elapsedTime: 0,
      solvedCount: 0,
      hintsLeft: settings.hints,
      guessInput: '',
      guessCount: 0,
      progress: 0,
      gameState
    })

    this.startTimer()
    this.incrementPlayCount()
  },

  startTimer() {
    const timer = setInterval(() => {
      this.setData({
        elapsedTime: this.data.elapsedTime + 1
      })
    }, 1000)
    this.setData({ timer })
  },

  async incrementPlayCount() {
    try {
      await Firebase.incrementPlayCount(this.data.quizId)
    } catch (e) {
      console.error('Failed to increment play count:', e)
    }
  },

  revealLetter(e) {
    const letter = e.currentTarget.dataset.letter.toLowerCase()
    const { gameState, usedLetters } = this.data

    if (usedLetters.includes(letter)) return

    const result = MetroGameLogic.revealLetter(gameState, letter)
    if (result.alreadyUsed) return

    const newUsedLetters = [...usedLetters, letter]
    let newFoundLetters = [...this.data.foundLetters]

    if (result.found && !newFoundLetters.includes(letter)) {
      newFoundLetters.push(letter)
      MetroCommon.vibrateShort()
    } else {
      MetroCommon.vibrateShort()
    }

    this.updateStationDisplays()

    this.setData({
      usedLetters: newUsedLetters,
      foundLetters: newFoundLetters,
      score: gameState.score
    })

    this.checkAutoSolved()
  },

  updateStationDisplays() {
    const { gameState, stations } = this.data

    const updatedStations = stations.map((s, i) => {
      const isSolved = gameState.solvedStations.includes(i)
      const revealedLetters = gameState.revealedLetters[i] || []
      const displayText = MetroCommon.getDisplayText(
        s.station_en,
        revealedLetters,
        isSolved,
        gameState.revealedSpecialChars
      )
      return {
        ...s,
        solved: isSolved,
        displayText
      }
    })

    this.setData({ stations: updatedStations })
  },

  checkAutoSolved() {
    const { gameState } = this.data
    const autoSolved = MetroGameLogic.checkAutoSolved(gameState)

    if (autoSolved.length > 0) {
      this.updateStationDisplays()
      this.updateProgress()
    }
  },

  useHint() {
    const { gameState, hintsLeft } = this.data

    if (hintsLeft <= 0) {
      MetroCommon.showToast('没有提示次数了', 'error')
      return
    }

    const result = MetroGameLogic.useHint(gameState)

    if (result.success) {
      MetroCommon.vibrateShort()
      this.updateStationDisplays()
      this.setData({
        hintsLeft: gameState.hintsLeft,
        score: gameState.score,
        usedLetters: gameState.usedLetters,
        foundLetters: gameState.foundLetters
      })
      
      const hintMessages = {
        first_letter: `首字母 "${result.letter.toUpperCase()}" 已揭示！`,
        rare_letter: `稀有字母 "${result.letter.toUpperCase()}" 已揭示！`,
        medium_letter: `关键字母 "${result.letter.toUpperCase()}" 已揭示！`,
        common_letter: `字母 "${result.letter.toUpperCase()}" 已揭示！`
      }
      const message = hintMessages[result.hintType] || `字母 "${result.letter.toUpperCase()}" 已揭示！`
      const countText = result.revealedCount > 1 ? ` (${result.revealedCount}处)` : ''
      MetroCommon.showToast(message + countText, 'success')
      
      this.checkAutoSolved()
    }
  },

  onGuessInput(e) {
    this.setData({ guessInput: e.detail.value })
  },

  submitGuess() {
    const { guessInput, gameState } = this.data

    if (!guessInput.trim()) return

    const result = MetroGameLogic.guessStation(gameState, guessInput.trim())

    if (result.correct) {
      MetroCommon.vibrateShort()
      this.updateStationDisplays()
      this.updateProgress()

      this.setData({
        guessInput: '',
        score: gameState.score,
        guessCount: gameState.guessCount,
        solvedCount: gameState.solvedStations.length
      })

      this.checkWinCondition()
    } else {
      MetroCommon.vibrateShort()
      this.setData({
        guessInput: '',
        guessCount: gameState.guessCount
      })
    }
  },

  updateProgress() {
    const { gameState, stations } = this.data
    const progress = (gameState.solvedStations.length / stations.length) * 100
    this.setData({ progress })
  },

  checkWinCondition() {
    const { gameState, difficulty } = this.data
    const result = MetroGameLogic.checkWinCondition(gameState, difficulty)

    if (result.won) {
      clearInterval(this.data.timer)
      MetroCommon.vibrateLong()

      this.setData({
        gameWon: true,
        finalScore: result.finalScore
      })
    }
  },

  formatTime(seconds) {
    return MetroGameLogic.formatTime(seconds)
  },

  getDifficultyLabel(difficulty) {
    return MetroCommon.getDifficultyLabel(difficulty)
  },

  restartGame() {
    this.startGame()
  },

  goBack() {
    wx.navigateBack()
  }
})
