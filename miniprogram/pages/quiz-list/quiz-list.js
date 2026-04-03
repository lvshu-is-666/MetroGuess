const MetroCommon = require('../../utils/common')
const Firebase = require('../../utils/firebase')

const app = getApp()

Page({
  data: {
    theme: 'light',
    loading: true,
    quizzes: [],
    hasMore: true,
    page: 0,
    pageSize: 10,

    sortOptions: [
      { value: 'newest', label: '最新创建' },
      { value: 'popular', label: '最受欢迎' },
      { value: 'difficulty', label: '按难度' }
    ],
    sortIndex: 0,
    difficultyOptions: [
      { value: 'all', label: '全部难度' },
      { value: 'easy', label: '简单' },
      { value: 'normal', label: '普通' },
      { value: 'hard', label: '困难' }
    ],
    difficultyIndex: 0
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme
    })
    this.loadQuizzes()
  },

  onShow() {
    this.loadQuizzes(true)
  },

  onPullDownRefresh() {
    this.loadQuizzes(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadQuizzes(refresh = false) {
    if (refresh) {
      this.setData({
        page: 0,
        quizzes: [],
        hasMore: true
      })
    }

    this.setData({ loading: true })

    try {
      const sortBy = this.data.sortOptions[this.data.sortIndex].value
      const difficulty = this.data.difficultyOptions[this.data.difficultyIndex].value

      const allQuizzes = await Firebase.getQuizList({
        sortBy,
        difficulty: difficulty !== 'all' ? difficulty : null
      })

      const start = this.data.page * this.data.pageSize
      const end = start + this.data.pageSize
      const pageData = allQuizzes.slice(start, end)

      this.setData({
        quizzes: refresh ? pageData : [...this.data.quizzes, ...pageData],
        hasMore: end < allQuizzes.length,
        page: this.data.page + 1,
        loading: false
      })
    } catch (e) {
      console.error('Failed to load quizzes:', e)
      this.setData({ loading: false })
      MetroCommon.showToast('加载失败', 'error')
    }
  },

  onSortChange(e) {
    this.setData({ sortIndex: parseInt(e.detail.value) })
    this.loadQuizzes(true)
  },

  onDifficultyChange(e) {
    this.setData({ difficultyIndex: parseInt(e.detail.value) })
    this.loadQuizzes(true)
  },

  loadMore() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadQuizzes()
    }
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/quiz-create/quiz-create'
    })
  },

  goToManage() {
    wx.navigateTo({
      url: '/pages/quiz-manage/quiz-manage'
    })
  },

  goToPlay(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/quiz-play/quiz-play?id=${id}`
    })
  },

  getDifficultyLabel(difficulty) {
    return MetroCommon.getDifficultyLabel(difficulty)
  },

  formatTimeAgo(timestamp) {
    return MetroCommon.formatTimeAgo(timestamp)
  },

  toggleTheme() {
    const newTheme = app.toggleTheme()
    this.setData({ theme: newTheme })
  }
})
