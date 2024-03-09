import { Tray, nativeImage, Menu } from 'electron'
import { join } from 'path'

var AppTray
export function createTray(mainWindow, app) {
  let pathIcon =join(__dirname, '../../resources/icon.png');
  AppTray = new Tray(nativeImage.createFromPath(pathIcon))
  AppTray.setToolTip('畅视盒子')
  AppTray.addListener('click', () => { 
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  // Make a change to the context menu
  // contextMenu.items[1].checked = false

  // Call this again for Linux because we modified the context menu
  AppTray.setContextMenu(contextMenu)
}
