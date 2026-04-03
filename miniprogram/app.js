App({
  globalData: {
    userInfo: null,
    theme: 'light',
    soundEnabled: true
  },

  onLaunch() {
    const theme = wx.getStorageSync('theme') || 'light'
    const soundEnabled = wx.getStorageSync('soundEnabled')
    
    this.globalData.theme = theme
    this.globalData.soundEnabled = soundEnabled !== '' ? soundEnabled : true
    
    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    })
  },

  toggleTheme() {
    this.globalData.theme = this.globalData.theme === 'light' ? 'dark' : 'light'
    wx.setStorageSync('theme', this.globalData.theme)
    return this.globalData.theme
  },

  toggleSound() {
    this.globalData.soundEnabled = !this.globalData.soundEnabled
    wx.setStorageSync('soundEnabled', this.globalData.soundEnabled)
    return this.globalData.soundEnabled
  }
})
