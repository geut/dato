'use strict'

require('@electron/remote/main').initialize()
const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const debug = require('electron-debug')
const del = require('del')
const { once } = require('events')
const { promises: fs } = require('fs')
const { promisify } = require('util')
const Store = require('electron-store')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

debug({ isEnabled: true, showDevTools: false })
app.allowRendererProcessReuse = false
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

let mainWindow
let restarting = false
const store = new Store()

log.transports.file.level = 'debug'
log.transports.ipc.level = 'debug'
autoUpdater.logger = log
store.clear()
ipcMain.handle('getStoreValue', (_, key, defaultValue) => store.get(key, defaultValue))
ipcMain.handle('setStoreValue', (_, key, value) => store.set(key, value))

const withRestart = async (cb) => {
  restarting = true
  mainWindow.close()
  await once(mainWindow, 'closed')
  await cb()
  mainWindow = await createMainWindow()
  restarting = false
}

const updateMenu = () => {
  const isMac = process.platform === 'darwin'
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(isMac ? [{ role: 'appMenu' }] : []),
      {
        role: 'fileMenu',
        submenu: [
          {
            label: 'Add content',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              mainWindow.webContents.send('goto-create')
            },
          },
        ],
      },
      { role: 'windowMenu' },
      {
        role: 'edit',
        label: 'Edit',
        submenu: [
          {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          },
          {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste',
          },
        ],
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Reopen welcome screens',
            click: () => store.set('welcome', true),
          },
          {
            label: 'Learn More',
            click: () => shell.openExternal('https://geutstudio.com'),
          },
        ],
      },
    ])
  )
}

const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.name,
    show: false,
    width: 620,
    height: 620,
    minWidth: 620,
    minHeight: 620,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    titleBarStyle: 'hiddenInset',
  })
  updateMenu()

  win.on('ready-to-show', () => win.show())
  win.on('closed', () => (mainWindow = undefined))
  if (!app.isPackaged && !process.env.CI) win.webContents.openDevTools()
  if (app.isPackaged) {
    await win.loadFile('build/index.html')
  } else {
    await win.loadURL('http://localhost:1212/dist/index.html')
  }
  return win
}

if (!app.requestSingleInstanceLock()) app.quit()

app.on('second-instance', (_, argv) => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  const lastArg = argv[argv.length - 1]
  if (/^dato:\/\//.test(lastArg)) {
    const url = lastArg.replace(/\/$/, '')
    mainWindow.webContents.send('open', url)
  }
})
app.on('open-url', async (ev, url) => {
  ev.preventDefault()
  if (!mainWindow) mainWindow = await createMainWindow()
  mainWindow.webContents.send('open', url)
})
app.on('window-all-closed', () => {
  if (!restarting && (process.platform !== 'darwin' || process.env.CI)) {
    app.quit()
  }
})
app.on('activate', async () => {
  if (!mainWindow) mainWindow = await createMainWindow()
})

const main = async () => {
  await app.whenReady()
  mainWindow = await createMainWindow()
  app.setAsDefaultProtocolClient('dato')
  if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify()
}

main().catch((err) => console.log(err))
