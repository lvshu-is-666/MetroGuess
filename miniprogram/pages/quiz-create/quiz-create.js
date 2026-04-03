const MetroCommon = require('../../utils/common')
const Firebase = require('../../utils/firebase')

const app = getApp()

Page({
  data: {
    theme: 'light',
    creating: false,

    name: '',
    description: '',
    cityIndex: 0,
    cityOptions: ['全国', ...MetroCommon.CITIES],
    selectedStations: [],
    difficulty: 'normal',
    difficultyLabel: '普通',
    hideTheme: false,
    isPublic: true,
    inviteCode: '',
    managerUsername: '',
    managerPassword: '',

    showStationModal: false,
    searchKeyword: '',
    filteredStations: [],
    tempSelectedStations: [],

    allStations: [],
    dataLoaded: false
  },

  onLoad() {
    this.setData({
      theme: app.globalData.theme
    })
    this.loadStationData()
  },

  async loadStationData() {
    MetroCommon.showLoading('加载数据...')
    try {
      const stations = await MetroCommon.loadStationData()
      this.setData({
        allStations: stations,
        dataLoaded: true
      })
      MetroCommon.hideLoading()
    } catch (e) {
      console.error('Failed to load station data:', e)
      MetroCommon.hideLoading()
      MetroCommon.showToast('数据加载失败', 'error')
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value })
  },

  onCityChange(e) {
    this.setData({ cityIndex: parseInt(e.detail.value) })
  },

  selectStations() {
    if (!this.data.dataLoaded) {
      MetroCommon.showToast('数据正在加载中', 'error')
      return
    }

    const { cityIndex, cityOptions, allStations } = this.data
    let filtered = [...allStations]

    if (cityIndex > 0) {
      const selectedCity = cityOptions[cityIndex]
      filtered = filtered.filter(s => s.city_cn === selectedCity)
    }

    this.setData({
      showStationModal: true,
      filteredStations: filtered.slice(0, 100),
      tempSelectedStations: [...this.data.selectedStations],
      searchKeyword: ''
    })
  },

  closeStationModal() {
    this.setData({ showStationModal: false })
  },

  preventMove() {},

  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    const { cityIndex, cityOptions, allStations } = this.data

    let filtered = [...allStations]

    if (cityIndex > 0) {
      const selectedCity = cityOptions[cityIndex]
      filtered = filtered.filter(s => s.city_cn === selectedCity)
    }

    if (keyword) {
      filtered = filtered.filter(s =>
        s.station_cn.includes(keyword) ||
        s.station_en.toLowerCase().includes(keyword)
      )
    }

    this.setData({
      searchKeyword: e.detail.value,
      filteredStations: filtered.slice(0, 100)
    })
  },

  isStationSelected(station) {
    return this.data.tempSelectedStations.some(
      s => s.station_en === station.station_en
    )
  },

  toggleStation(e) {
    const station = e.currentTarget.dataset.station
    const { tempSelectedStations } = this.data

    const index = tempSelectedStations.findIndex(
      s => s.station_en === station.station_en
    )

    if (index > -1) {
      tempSelectedStations.splice(index, 1)
    } else {
      tempSelectedStations.push(station)
    }

    this.setData({ tempSelectedStations })
  },

  confirmStations() {
    this.setData({
      selectedStations: [...this.data.tempSelectedStations],
      showStationModal: false
    })
    this.updateDifficultyLabel()
  },

  removeStation(e) {
    const index = e.currentTarget.dataset.index
    const { selectedStations } = this.data
    selectedStations.splice(index, 1)
    this.setData({ selectedStations })
    this.updateDifficultyLabel()
  },

  selectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty
    this.setData({ difficulty })
  },

  updateDifficultyLabel() {
    const { selectedStations } = this.data
    if (selectedStations.length === 0) {
      this.setData({ difficultyLabel: '普通' })
      return
    }

    const result = MetroCommon.calculateQuizDifficulty(selectedStations)
    this.setData({ difficultyLabel: MetroCommon.getDifficultyLabel(result.level) })
  },

  toggleHideTheme() {
    this.setData({ hideTheme: !this.data.hideTheme })
  },

  toggleIsPublic() {
    this.setData({ isPublic: !this.data.isPublic })
  },

  onInviteCodeInput(e) {
    this.setData({ inviteCode: e.detail.value })
  },

  onManagerUsernameInput(e) {
    this.setData({ managerUsername: e.detail.value })
  },

  onManagerPasswordInput(e) {
    this.setData({ managerPassword: e.detail.value })
  },

  async createQuiz() {
    const {
      name,
      selectedStations,
      managerUsername,
      managerPassword,
      description,
      cityIndex,
      cityOptions,
      difficulty,
      hideTheme,
      isPublic,
      inviteCode
    } = this.data

    if (!name.trim()) {
      MetroCommon.showToast('请输入题组名称', 'error')
      return
    }

    if (selectedStations.length < 3) {
      MetroCommon.showToast('至少需要选择3个站点', 'error')
      return
    }

    if (!managerUsername.trim() || !managerPassword.trim()) {
      MetroCommon.showToast('请设置管理凭证', 'error')
      return
    }

    this.setData({ creating: true })

    try {
      const difficultyResult = MetroCommon.calculateQuizDifficulty(selectedStations)

      const quizData = {
        name: name.trim(),
        description: description.trim(),
        questions: selectedStations,
        cityScope: cityIndex > 0 ? cityOptions[cityIndex] : 'all',
        difficultyLevel: difficultyResult.level,
        hideTheme,
        isPublic,
        inviteCode: inviteCode.trim().toUpperCase() || null,
        managerUsername: managerUsername.trim(),
        managerPassword: managerPassword.trim()
      }

      await Firebase.createQuiz(quizData)

      MetroCommon.showToast('创建成功', 'success')

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (e) {
      console.error('Failed to create quiz:', e)
      MetroCommon.showToast('创建失败', 'error')
    } finally {
      this.setData({ creating: false })
    }
  },

  cancel() {
    wx.navigateBack()
  }
})
