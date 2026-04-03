Page({
  data: {
    theme: 'light'
  },

  onLoad() {
    const app = getApp()
    this.setData({
      theme: app.globalData.theme
    })
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})
