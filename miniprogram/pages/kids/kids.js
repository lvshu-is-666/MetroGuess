const MetroCommon = require('../../utils/common')
const MetroGameLogic = require('../../utils/game-logic')

const app = getApp()

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

const KIDS_DIFFICULTY = {
  stationCount: 3,
  hints: 5,
  timeBonus: 300,
  multiplier: 1
}

Page({
  data: {
    theme: 'light',
    soundEnabled: true,
    gameStarted: false,
    gameWon: false,
    selectedCityIndex: 0,
    cities: MetroCommon.CITIES,
    keyboardRows: KEYBOARD_ROWS,

    stations: [],
    usedLetters: [],
    foundLetters: [],
    score: 0,
    elapsedTime: 0,
    solvedCount: 0,
    hintsLeft: 5,
    guessInput: '',
    guessHistory: [],
    guessCount: 0,
    progress: 0,
    finalScore: 0,

    timer: null,
    gameState: null,
    dataLoaded: false
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme,
      soundEnabled: app.globalData.soundEnabled
    })
    this.loadStationData()
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  async loadStationData() {
    MetroCommon.showLoading('加载数据...')
    try {
      const stations = await MetroCommon.loadStationData()
      this.allStations = stations
      this.setData({ dataLoaded: true })
      MetroCommon.hideLoading()
    } catch (e) {
      console.error('Failed to load station data:', e)
      MetroCommon.hideLoading()
      MetroCommon.showToast('数据加载失败', 'error')
    }
  },

  onCityChange(e) {
    this.setData({
      selectedCityIndex: parseInt(e.detail.value)
    })
  },

  startGame() {
    if (!this.data.dataLoaded) {
      MetroCommon.showToast('数据正在加载中', 'error')
      return
    }

    const { selectedCityIndex } = this.data

    const selectedCity = MetroCommon.CITIES[selectedCityIndex]
    let availableStations = this.allStations.filter(s => s.city_cn === selectedCity)

    if (availableStations.length < KIDS_DIFFICULTY.stationCount) {
      availableStations = [...this.allStations]
    }

    if (availableStations.length < KIDS_DIFFICULTY.stationCount) {
      MetroCommon.showToast('站点数据不足', 'error')
      return
    }

    const shuffled = availableStations.sort(() => Math.random() - 0.5)
    const selectedStations = shuffled.slice(0, KIDS_DIFFICULTY.stationCount)

    const gameState = MetroGameLogic.initGameState(selectedStations, 'easy')

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
      hintsLeft: KIDS_DIFFICULTY.hints,
      guessInput: '',
      guessHistory: [],
      guessCount: 0,
      progress: 0,
      gameState
    })

    this.startTimer()
  },

  startTimer() {
    const timer = setInterval(() => {
      this.setData({
        elapsedTime: this.data.elapsedTime + 1
      })
    }, 1000)
    this.setData({ timer })
  },

  revealLetter(e) {
    const letter = e.currentTarget.dataset.letter.toLowerCase()
    const { gameState, usedLetters } = this.data

    if (usedLetters.includes(letter)) {
      return
    }

    const result = MetroGameLogic.revealLetter(gameState, letter)

    if (result.alreadyUsed) {
      return
    }

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

      autoSolved.forEach(item => {
        MetroCommon.showToast(`太棒了！解锁: ${item.station.station_cn}`, 'success')
      })
    }
  },

  useHint() {
    const { gameState, hintsLeft } = this.data

    if (hintsLeft <= 0) {
      MetroCommon.showToast('没有提示次数了', 'error')
      return
    }

    const result = MetroGameLogic.useHint(gameState)

    if (result.noHintsLeft) {
      MetroCommon.showToast('没有提示次数了', 'error')
    } else if (result.allSolved) {
      MetroCommon.showToast('所有站点已解决', 'success')
    } else if (result.noLettersToReveal) {
      MetroCommon.showToast('没有可揭示的字母', 'error')
    } else if (result.success) {
      MetroCommon.vibrateShort()
      this.updateStationDisplays()
      this.setData({
        hintsLeft: gameState.hintsLeft,
        score: gameState.score,
        usedLetters: gameState.usedLetters,
        foundLetters: gameState.foundLetters
      })
      this.checkAutoSolved()
    }
  },

  onGuessInput(e) {
    this.setData({ guessInput: e.detail.value })
  },

  submitGuess() {
    const { guessInput, gameState } = this.data

    if (!guessInput.trim()) {
      return
    }

    const result = MetroGameLogic.guessStation(gameState, guessInput.trim())

    const historyItem = {
      guess: guessInput.trim(),
      correct: result.correct
    }

    const newHistory = [historyItem, ...this.data.guessHistory].slice(0, 20)

    if (result.correct) {
      MetroCommon.vibrateShort()
      this.updateStationDisplays()
      this.updateProgress()

      this.setData({
        guessInput: '',
        guessHistory: newHistory,
        score: gameState.score,
        guessCount: gameState.guessCount,
        solvedCount: gameState.solvedStations.length
      })

      this.checkWinCondition()
    } else {
      MetroCommon.vibrateShort()
      this.setData({
        guessInput: '',
        guessHistory: newHistory,
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
    const { gameState } = this.data
    const result = MetroGameLogic.checkWinCondition(gameState, 'easy')

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

  restartGame() {
    this.startGame()
  },

  backToMenu() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
    this.setData({
      gameStarted: false,
      gameWon: false,
      stations: [],
      usedLetters: [],
      foundLetters: [],
      score: 0,
      elapsedTime: 0,
      solvedCount: 0,
      hintsLeft: 5,
      guessInput: '',
      guessHistory: [],
      guessCount: 0,
      progress: 0,
      finalScore: 0,
      gameState: null
    })
  },

  toggleTheme() {
    const newTheme = app.toggleTheme()
    this.setData({ theme: newTheme })
  },

  toggleSound() {
    const newSoundEnabled = app.toggleSound()
    this.setData({ soundEnabled: newSoundEnabled })
  }
})
