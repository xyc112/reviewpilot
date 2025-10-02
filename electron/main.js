const { app, BrowserWindow } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 完全移除应用菜单
  mainWindow.setMenu(null);

  // 核心功能：加载前端
  mainWindow.loadURL('http://localhost:5173');

  // 窗口最大化并显示
  mainWindow.maximize();
  mainWindow.show();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});