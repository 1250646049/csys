// 监控窗口全屏
export function windowFullListener(win) {
  // 监听页面全屏
  win.on('enter-full-screen', () => {
    win.webContents.send('window-is-full', true)
  })
  win.on('leave-full-screen', () => {
    win.webContents.send('window-is-full', false)
  })
}


