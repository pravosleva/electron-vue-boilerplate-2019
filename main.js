// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const path = require('path');
const dev = process.env.NODE_ENV === 'development';

const createPollingByConditions = require('./polling-to-frontend').createPollingByConditions;
const CONFIG = {
  FRONTEND_DEV_URL: 'http://localhost:3000',
  FRONTEND_FIRST_CONNECT_INTERVAL: 3000,
  FRONTERN_FIRST_CONNECT_METHOD: 'get'
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let connectedToFrontend = false;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    // show: false
  });

  if (dev) {
    if (process.env.LOCAL_INDEX_EXAMPLE) {
      mainWindow.loadFile('./index-example.html');
    } else {
      mainWindow.loadURL(CONFIG.FRONTEND_DEV_URL);
    }
    mainWindow.webContents.openDevTools();
  } else {
    // and load the index.html of the app.
    mainWindow.loadFile('./frontend/dist/index.html');
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// I'm gonna check if CONFIG.FRONTEND_DEV_URL resource available then create window...
app.on('ready', () => {
  if (dev) {
    if (process.env.LOCAL_INDEX_EXAMPLE) {
      createWindow();
    } else {
      createPollingByConditions ({
        url: CONFIG.FRONTEND_DEV_URL,
        method: CONFIG.FRONTERN_FIRST_CONNECT_METHOD,
        interval: CONFIG.FRONTEND_FIRST_CONNECT_INTERVAL,
        callbackAsResolve: () => {
          console.log(`SUCCESS! CONNECTED TO ${CONFIG.FRONTEND_DEV_URL}`);
          connectedToFrontend = true;
          createWindow();
        },
        toBeOrNotToBe: () => !connectedToFrontend, // Need to reconnect again
        callbackAsReject: () => {
          console.log(`FUCKUP! ${CONFIG.FRONTEND_DEV_URL} IS NOT AVAILABLE YET!`);
          console.log(`TRYING TO RECONNECT in ${CONFIG.FRONTEND_FIRST_CONNECT_INTERVAL / 1000} seconds...`);
        }
      });
    }
  } else {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
