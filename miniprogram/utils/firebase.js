const FirebaseConfig = {
  config: {
    apiKey: "AIzaSyDPs3vZRgXUCEYJ6qWJc69YYKVfRfj8PuM",
    authDomain: "metroguess-lvshu.firebaseapp.com",
    databaseURL: "https://metroguess-lvshu-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "metroguess-lvshu",
    storageBucket: "metroguess-lvshu.firebasestorage.app",
    messagingSenderId: "331461414999",
    appId: "1:331461414999:web:50beeb73a94ca4ba971312",
    measurementId: "G-YWSMLL0YNC"
  },

  getDatabaseURL() {
    return this.config.databaseURL
  },

  async hashPassword(password, salt = null) {
    if (!salt) {
      const randomBytes = new Uint8Array(16)
      crypto.getRandomValues(randomBytes)
      salt = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return { hash: hashHex, salt: salt }
  },

  async verifyPassword(password, storedHash, salt) {
    const { hash } = await this.hashPassword(password, salt)
    return hash === storedHash
  },

  async request(path, method = 'GET', data = null) {
    const url = `${this.getDatabaseURL()}${path}.json`

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data: data ? JSON.stringify(data) : null,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`Request failed: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  async createQuiz(quizData) {
    const MetroCommon = require('./common')
    const quizId = MetroCommon.generateUniqueId()
    const now = Date.now()

    let hashedPassword = null
    let passwordSalt = null
    if (quizData.managerPassword) {
      const hashResult = await this.hashPassword(quizData.managerPassword)
      hashedPassword = hashResult.hash
      passwordSalt = hashResult.salt
    }

    const quiz = {
      id: quizId,
      ...quizData,
      managerPassword: hashedPassword,
      passwordSalt: passwordSalt,
      createdAt: now,
      updatedAt: now,
      playCount: 0,
      likeCount: 0
    }

    await this.request(`/quizzes/${quizId}`, 'PUT', quiz)
    return quiz
  },

  async getQuiz(quizId) {
    const quiz = await this.request(`/quizzes/${quizId}`)
    return quiz
  },

  async updateQuiz(quizId, updates) {
    if (updates.managerPassword) {
      const hashResult = await this.hashPassword(updates.managerPassword)
      updates.managerPassword = hashResult.hash
      updates.passwordSalt = hashResult.salt
    }

    updates.updatedAt = Date.now()
    await this.request(`/quizzes/${quizId}`, 'PATCH', updates)
    return true
  },

  async deleteQuiz(quizId) {
    await this.request(`/quizzes/${quizId}`, 'DELETE')
    await this.request(`/quizLeaderboards/${quizId}`, 'DELETE')
    return true
  },

  async getQuizList(filters = {}) {
    let quizzes = await this.request('/quizzes')

    if (!quizzes) return []

    quizzes = Object.values(quizzes).filter(q => q.isPublic)

    if (filters.city && filters.city !== 'all') {
      quizzes = quizzes.filter(q => q.cityScope === filters.city || q.cityScope === 'all')
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      quizzes = quizzes.filter(q => q.difficultyLevel === filters.difficulty)
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'popular':
          quizzes.sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
          break
        case 'newest':
          quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          break
        case 'difficulty':
          const order = { easy: 1, normal: 2, hard: 3 }
          quizzes.sort((a, b) => (order[a.difficultyLevel] || 2) - (order[b.difficultyLevel] || 2))
          break
        default:
          quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      }
    } else {
      quizzes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    }

    if (filters.limit) {
      quizzes = quizzes.slice(0, filters.limit)
    }

    return quizzes
  },

  async incrementPlayCount(quizId) {
    const quiz = await this.getQuiz(quizId)
    if (quiz) {
      const newCount = (quiz.playCount || 0) + 1
      await this.request(`/quizzes/${quizId}/playCount`, 'PUT', newCount)
    }
  },

  async saveQuizScore(quizId, scoreData) {
    const scoreId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    const score = {
      id: scoreId,
      ...scoreData,
      createdAt: Date.now()
    }

    await this.request(`/quizLeaderboards/${quizId}/${scoreId}`, 'PUT', score)
    return score
  },

  async getQuizLeaderboard(quizId, limit = 10) {
    const scores = await this.request(`/quizLeaderboards/${quizId}`)

    if (!scores) return []

    const scoreList = Object.values(scores)
    scoreList.sort((a, b) => b.score - a.score)
    return scoreList.slice(0, limit)
  },

  validateQuizAccess(quiz, inviteCode = null) {
    if (!quiz) {
      return { valid: false, error: '题组不存在' }
    }

    if (!quiz.isPublic) {
      return { valid: false, error: '该题组为私有题组' }
    }

    if (quiz.inviteCode) {
      if (!inviteCode) {
        return { valid: false, error: '需要邀请码', needInviteCode: true }
      }
      if (inviteCode.toUpperCase() !== quiz.inviteCode.toUpperCase()) {
        return { valid: false, error: '邀请码错误' }
      }
    }

    return { valid: true }
  },

  async validateManagerAccess(quiz, username, password) {
    if (!quiz) {
      return { valid: false, error: '题组不存在' }
    }

    if (!quiz.managerUsername || !quiz.managerPassword) {
      return { valid: false, error: '该题组未设置管理凭证' }
    }

    if (username !== quiz.managerUsername) {
      return { valid: false, error: '用户名或密码错误' }
    }

    const isHashedPassword = quiz.managerPassword.length === 64 && quiz.passwordSalt

    if (isHashedPassword) {
      const isValid = await this.verifyPassword(password, quiz.managerPassword, quiz.passwordSalt)
      if (!isValid) {
        return { valid: false, error: '用户名或密码错误' }
      }
    } else {
      if (password !== quiz.managerPassword) {
        return { valid: false, error: '用户名或密码错误' }
      }
    }

    return { valid: true }
  },

  async getAllQuizzes() {
    const quizzes = await this.request('/quizzes')

    if (!quizzes) return []

    const quizList = Object.values(quizzes)
    quizList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    return quizList
  },

  async setFeatured(quizId, featured) {
    await this.request(`/quizzes/${quizId}/featured`, 'PUT', featured)
    return true
  }
}

module.exports = FirebaseConfig
