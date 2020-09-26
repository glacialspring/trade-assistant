const { app, BrowserWindow } = require('electron')
 
let mainWindow
 
function createWindow() {
    mainWindow = new BrowserWindow({
        width:800,
        height:600,
        show: false
    })
    mainWindow.loadURL('http://localhost:3000')
 
    mainWindow.once('ready-to-show', () => mainWindow.show())
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}
app.on('ready', createWindow)
