const MetroCommon = require('../../utils/common')
const Firebase = require('../../utils/firebase')

const app = getApp()

Page({
  data: {
    theme: 'light',
    loggedIn: false,
    quiz: null,

    loginQuizId: '',
    loginUsername: '',
    loginPassword: '',

    editName: '',
    editDescription: '',
    editIsPublic: true,
    editHideTheme: false,
    editInviteCode: ''
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme
    })
  },

  onQuizIdInput(e) {
    this.setData({ loginQuizId: e.detail.value.toUpperCase() })
  },

  onUsernameInput(e) {
    this.setData({ loginUsername: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ loginPassword: e.detail.value })
  },

  async login() {
    const { loginQuizId, loginUsername, loginPassword } = this.data

    if (!loginQuizId.trim()) {
      MetroCommon.showToast('请输入题组ID', 'error')
      return
    }

    if (!loginUsername.trim() || !loginPassword.trim()) {
      MetroCommon.showToast('请输入管理凭证', 'error')
      return
    }

    MetroCommon.showLoading('验证中...')

    try {
      const quiz = await Firebase.getQuiz(loginQuizId.trim())

      if (!quiz) {
        MetroCommon.hideLoading()
        MetroCommon.showToast('题组不存在', 'error')
        return
      }

      const accessResult = await Firebase.validateManagerAccess(
        quiz,
        loginUsername.trim(),
        loginPassword.trim()
      )

      MetroCommon.hideLoading()

      if (!accessResult.valid) {
        MetroCommon.showToast(accessResult.error, 'error')
        return
      }

      this.setData({
        loggedIn: true,
        quiz,
        editName: quiz.name,
        editDescription: quiz.description || '',
        editIsPublic: quiz.isPublic,
        editHideTheme: quiz.hideTheme,
        editInviteCode: quiz.inviteCode || ''
      })

      MetroCommon.showToast('登录成功', 'success')
    } catch (e) {
      MetroCommon.hideLoading()
      console.error('Failed to login:', e)
      MetroCommon.showToast('登录失败', 'error')
    }
  },

  onEditNameInput(e) {
    this.setData({ editName: e.detail.value })
  },

  onEditDescriptionInput(e) {
    this.setData({ editDescription: e.detail.value })
  },

  toggleEditPublic() {
    this.setData({ editIsPublic: !this.data.editIsPublic })
  },

  toggleEditHideTheme() {
    this.setData({ editHideTheme: !this.data.editHideTheme })
  },

  onEditInviteCodeInput(e) {
    this.setData({ editInviteCode: e.detail.value.toUpperCase() })
  },

  async saveChanges() {
    const { quiz, editName, editDescription, editIsPublic, editHideTheme, editInviteCode } = this.data

    if (!editName.trim()) {
      MetroCommon.showToast('请输入题组名称', 'error')
      return
    }

    MetroCommon.showLoading('保存中...')

    try {
      const updates = {
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editIsPublic,
        hideTheme: editHideTheme,
        inviteCode: editInviteCode.trim() || null
      }

      await Firebase.updateQuiz(quiz.id, updates)

      const updatedQuiz = await Firebase.getQuiz(quiz.id)

      MetroCommon.hideLoading()
      this.setData({ quiz: updatedQuiz })
      MetroCommon.showToast('保存成功', 'success')
    } catch (e) {
      MetroCommon.hideLoading()
      console.error('Failed to save changes:', e)
      MetroCommon.showToast('保存失败', 'error')
    }
  },

  copyQuizId() {
    wx.setClipboardData({
      data: this.data.quiz.id,
      success: () => {
        MetroCommon.showToast('已复制', 'success')
      }
    })
  },

  shareQuiz() {
    const { quiz } = this.data
    const shareText = MetroCommon.generateShareText(quiz)

    wx.setClipboardData({
      data: shareText,
      success: () => {
        MetroCommon.showToast('已复制分享内容', 'success')
      }
    })
  },

  deleteQuiz() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个题组吗？',
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          this.doDelete()
        }
      }
    })
  },

  async doDelete() {
    MetroCommon.showLoading('删除中...')

    try {
      await Firebase.deleteQuiz(this.data.quiz.id)

      MetroCommon.hideLoading()
      MetroCommon.showToast('已删除', 'success')

      setTimeout(() => {
        this.logout()
      }, 1500)
    } catch (e) {
      MetroCommon.hideLoading()
      console.error('Failed to delete quiz:', e)
      MetroCommon.showToast('删除失败', 'error')
    }
  },

  logout() {
    this.setData({
      loggedIn: false,
      quiz: null,
      loginQuizId: '',
      loginUsername: '',
      loginPassword: '',
      editName: '',
      editDescription: '',
      editIsPublic: true,
      editHideTheme: false,
      editInviteCode: ''
    })
  },

  getDifficultyLabel(difficulty) {
    return MetroCommon.getDifficultyLabel(difficulty)
  },

  formatTime(timestamp) {
    if (!timestamp) return '未知'
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }
})
