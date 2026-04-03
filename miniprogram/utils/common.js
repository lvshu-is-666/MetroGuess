const MetroCommon = {
  CITIES: [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉',
    '西安', '重庆', '天津', '苏州', '郑州', '长沙', '沈阳', '青岛',
    '大连', '宁波', '厦门', '无锡', '福州', '合肥', '昆明', '哈尔滨',
    '济南', '佛山', '长春', '石家庄', '南宁', '贵阳', '兰州', '太原'
  ],

  LETTER_FREQUENCY: {
    superCommon: ['a', 'e', 'i', 'n', 'o', 's', 'u'],
    common: ['g', 'h', 't', 'l', 'r', 'd', 'c'],
    medium: ['y', 'j', 'x', 'z', 'p', 'm', 'w', 'b'],
    rare: ['q', 'f', 'k', 'v']
  },

  DIFFICULTY_SETTINGS: {
    easy: { stationCount: 3, hints: 5, timeBonus: 180, multiplier: 1, difficultyLevel: 'easy' },
    normal: { stationCount: 4, hints: 3, timeBonus: 300, multiplier: 1.5, difficultyLevel: 'normal' },
    hard: { stationCount: 6, hints: 2, timeBonus: 480, multiplier: 2, difficultyLevel: 'hard' }
  },

  allStations: null,

  formatTimeAgo(timestamp) {
    if (!timestamp) return '未知'
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  calculateStationDifficulty(station) {
    const name = (typeof station === 'string' ? station : station.station_en).toLowerCase()
    let score = 0

    const length = name.replace(/[^a-z]/g, '').length
    if (length <= 5) score += 1
    else if (length <= 8) score += 2
    else if (length <= 12) score += 3
    else score += 4

    const specialChars = (name.match(/['().]/g) || []).length
    score += specialChars * 1.5

    const letters = name.replace(/[^a-z]/g, '')
    const uniqueLetters = new Set(letters.split(''))

    this.LETTER_FREQUENCY.rare.forEach(letter => {
      if (uniqueLetters.has(letter)) score += 1.5
    })

    this.LETTER_FREQUENCY.medium.forEach(letter => {
      if (uniqueLetters.has(letter)) score += 0.5
    })

    const letterCounts = {}
    letters.split('').forEach(l => letterCounts[l] = (letterCounts[l] || 0) + 1)
    const repeatCount = Object.values(letterCounts).filter(c => c > 1).length
    score -= repeatCount * 0.2

    const commonLetterCount = this.LETTER_FREQUENCY.common.filter(l => uniqueLetters.has(l)).length
    score -= commonLetterCount * 0.2

    const superCommonLetterCount = this.LETTER_FREQUENCY.superCommon.filter(l => uniqueLetters.has(l)).length
    score -= superCommonLetterCount * 0.3

    const superCommonRatio = superCommonLetterCount / uniqueLetters.size
    if (superCommonRatio > 0.6) score -= 1

    if (typeof station === 'string') {
      return score
    }

    if (score <= 1.5) return 'easy'
    if (score <= 3) return 'normal'
    return 'hard'
  },

  getDifficultyLabel(difficulty) {
    const labels = {
      easy: '简单',
      normal: '普通',
      hard: '困难'
    }
    return labels[difficulty] || '普通'
  },

  getDifficultyColor(difficulty) {
    const colors = {
      easy: 'quiz-tag-difficulty-easy',
      normal: 'quiz-tag-difficulty-normal',
      hard: 'quiz-tag-difficulty-hard'
    }
    return colors[difficulty] || 'quiz-tag-difficulty-normal'
  },

  generateUniqueId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let id = ''
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
  },

  generatePlayerId() {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  },

  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration
    })
  },

  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  },

  hideLoading() {
    wx.hideLoading()
  },

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func.apply(this, args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  formatNumber(num) {
    return num.toLocaleString('zh-CN')
  },

  setClipboardData(text) {
    return new Promise((resolve, reject) => {
      wx.setClipboardData({
        data: text,
        success: () => {
          this.showToast('已复制', 'success')
          resolve(true)
        },
        fail: (err) => {
          this.showToast('复制失败', 'error')
          reject(err)
        }
      })
    })
  },

  saveToStorage(key, data) {
    try {
      wx.setStorageSync(key, data)
      return true
    } catch (e) {
      console.error('Failed to save to storage:', e)
      return false
    }
  },

  loadFromStorage(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key)
      return data || defaultValue
    } catch (e) {
      console.error('Failed to load from storage:', e)
      return defaultValue
    }
  },

  removeFromStorage(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (e) {
      console.error('Failed to remove from storage:', e)
      return false
    }
  },

  getDisplayText(stationEn, revealedLetters, isSolved, revealedSpecialChars = new Set()) {
    if (isSolved) {
      return stationEn.split('').map(char => {
        const lowerChar = char.toLowerCase()
        if (/[a-z]/.test(lowerChar)) {
          return { char, revealed: true, solved: true }
        }
        return { char, revealed: false, solved: true }
      })
    }

    return stationEn.split('').map(char => {
      const lowerChar = char.toLowerCase()
      if (/[a-z]/.test(lowerChar)) {
        if (revealedLetters && revealedLetters.has(lowerChar)) {
          return { char, revealed: true, solved: false }
        }
        return { char: '*', revealed: false, solved: false }
      } else if ([' ', "'", '(', ')', '.', '-', '/'].includes(char)) {
        if (revealedSpecialChars && revealedSpecialChars.has(char)) {
          return { char, revealed: true, solved: false }
        }
        return { char, revealed: false, solved: false }
      }
      return { char, revealed: false, solved: false }
    })
  },

  normalizeStationName(name) {
    return name.toLowerCase()
      .replace(/['']/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  },

  compareStationNames(input, target) {
    const normalizedInput = this.normalizeStationName(input)
    const normalizedTarget = this.normalizeStationName(target)
    return normalizedInput === normalizedTarget
  },

  decryptData(encryptedBase64, key) {
    try {
      const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))
      const keyBytes = new TextEncoder().encode(key)
      const decrypted = new Uint8Array(encrypted.length)
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length]
      }
      return new TextDecoder().decode(decrypted)
    } catch (e) {
      console.error('Decrypt failed:', e)
      return null
    }
  },

  parseCSV(data) {
    const lines = data.trim().split('\n')
    const result = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = []
      let current = ''
      let inQuotes = false

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length >= 4) {
        result.push({
          city_cn: values[0],
          city_en: values[1],
          station_cn: values[2],
          station_en: values[3]
        })
      }
    }
    return result
  },

  async loadStationData() {
    if (this.allStations) {
      return this.allStations
    }

    try {
      const fs = wx.getFileSystemManager()
      const data = fs.readFileSync('/data/encrypted_data.js', 'utf-8')

      const match = data.match(/ENCRYPTED_DATA\s*=\s*"([^"]+)"/)
      const keyMatch = data.match(/DECRYPT_KEY\s*=\s*"([^"]+)"/)

      if (match && keyMatch) {
        const encryptedData = match[1]
        const decryptKey = keyMatch[1]
        const decryptedCSV = this.decryptData(encryptedData, decryptKey)

        if (decryptedCSV) {
          this.allStations = this.parseCSV(decryptedCSV)
          return this.allStations
        }
      }

      console.error('Failed to parse encrypted data')
      return []
    } catch (e) {
      console.error('Failed to load station data:', e)
      return []
    }
  },

  calculateQuizDifficulty(questions) {
    if (!questions || questions.length === 0) return { score: 0, level: 'normal' }

    let totalScore = 0
    questions.forEach(q => {
      const station = { station_en: q.station_en }
      const diff = this.calculateStationDifficulty(station)
      if (diff === 'easy') totalScore += 1
      else if (diff === 'normal') totalScore += 2
      else totalScore += 3
    })

    const avgScore = totalScore / questions.length

    let level
    if (avgScore <= 1.3) level = 'easy'
    else if (avgScore <= 2.3) level = 'normal'
    else level = 'hard'

    return { score: avgScore.toFixed(1), level }
  },

  generateShareText(quiz) {
    let text = `【地铁站名猜谜 - 自定义题组】\n`
    text += `题组名称：${quiz.hideTheme ? '神秘题组' : quiz.name}\n`
    text += `题目数量：${quiz.questions.length}题\n`
    text += `综合难度：${this.getDifficultyLabel(quiz.difficultyLevel)}\n`

    if (quiz.inviteCode) {
      text += `邀请码：${quiz.inviteCode}\n`
    }

    return text
  },

  vibrateShort() {
    const app = getApp()
    if (app.globalData.soundEnabled) {
      wx.vibrateShort({
        type: 'light'
      })
    }
  },

  vibrateLong() {
    const app = getApp()
    if (app.globalData.soundEnabled) {
      wx.vibrateLong()
    }
  },

  playSound(type) {
    const app = getApp()
    if (!app.globalData.soundEnabled) return

    const sounds = {
      correct: '/assets/sounds/correct.mp3',
      wrong: '/assets/sounds/wrong.mp3',
      hint: '/assets/sounds/hint.mp3',
      win: '/assets/sounds/win.mp3',
      reveal: '/assets/sounds/reveal.mp3'
    }

    if (sounds[type]) {
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.src = sounds[type]
      innerAudioContext.play()
      innerAudioContext.onEnded(() => {
        innerAudioContext.destroy()
      })
    }
  }
}

module.exports = MetroCommon
