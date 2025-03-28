// Modules
const {app, BrowserWindow, session, webContents} = require('electron')
const windowStateKeeper = require('electron-window-state')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, secondaryWindow

// Create a new BrowserWindow when `app` is ready
function createWindow () {

  let customSes = session.fromPartition('persist:part1');

  let winState = windowStateKeeper({
    defaultWidth: 1000, defaultHeight: 800
  })

  mainWindow = new BrowserWindow({
    width: winState.width, height: winState.height,
    x: winState.x, y: winState.y,
    minWidth: 300, minHeight: 150,
    //frame: false,
    //titleBarStyle: 'hidden',
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true,
      session: customSes
    },
    // show: false,
    backgroundColor: '#2B2E3B'
  })

  secondaryWindow = new BrowserWindow({
    width: 600, height: 300,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true
      partition: 'persist:part1'
    },
    // show: false,
    parent: mainWindow,
    modal: true,
    show: false,
    frame: false, // Additional: hide window frame and title bar
    titleBarStyle: 'hidden' // Additional: hide title bar (macOS)
  })

  let ses = mainWindow.webContents.session;
  let ses2 = secondaryWindow.webContents.session;
  let defaultSes = session.defaultSession;

  ses.clearStorageData();

  console.log(Object.is(ses, ses2));
  console.log(Object.is(ses, defaultSes));
  console.log(Object.is(ses, customSes));

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('index.html')
  // mainWindow.loadURL('https://www.google.com/')

  winState.manage(mainWindow)

  secondaryWindow.loadFile('secondary.html')

  setTimeout( () => {
    secondaryWindow.show();
    setTimeout( () => {
      secondaryWindow.close();
      secondaryWindow = null;
    }, 3000)
  }, 2000);

  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools();
  // secondaryWindow.webContents.openDevTools();

  let wc = mainWindow.webContents;

  wc.on('context-menu', (e, params) => {
    // console.log(`Context menu opened on: ${params.mediaType} at x:${params.x}, y:${params.y}`);
    // console.log(`User selected text: ${params.selectionText}`);
    // console.log(`Selection can be copied: ${params.editFlags.canCopy}`);
    let selectedText = params.selectionText;
    wc.executeJavaScript(`alert("${selectedText}")`)
  })

  //console.log(webContents.getAllWebContents());

  /*
  wc.on('media-started-playing', () => {
    console.log('Video Started')
  })

  wc.on('media-paused', () => {
    console.log('Video Paused')
  })
  
  mainWindow.loadURL('https://httpbin.org/basic-auth/user/passwd')
  wc.on('login', (e, request, authInfo, callback) => {
    console.log('Logging in:');
    callback('user', 'passwd')
  })

  wc.on('did-navigate', (e, url, statusCode, message) => {
    console.log(`Navigated to: ${url}`);
    console.log(statusCode);
  })

  /*
  wc.on('before-input-event', (e, input) => {
    console.log(`${input.key} : ${input.type}`)
  })

  wc.on('new-window', (e, url) => {
    e.preventDefault()
    console.log(`Preventing new window for: ${url}`)
  })

  wc.on('did-finish-load', () => {
    console.log('Content fully loaded')
  })

  wc.on('dom-ready', () => {
    console.log('DOM Ready')
  })
  */

  // mainWindow.once('ready-to-show', mainWindow.show);

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}

// https://www.electronjs.org/docs/latest/api/app
app.on('browser-window-blur', e => {
  console.log('App unfocused');
  // setTimeout(app.quit, 3000);
});

app.on('browser-window-focus', e => {
  console.log('App focused');
});

app.on('before-quit', e => {
  console.log('Before quitting!');
  // e.preventDefault();
});

// Electron `app` is ready
app.on('ready', () => {
  console.log(app.getPath('desktop'));
  console.log(app.getPath('music'));
  console.log(app.getPath('temp'));
  console.log(app.getPath('userData')); // store app resources here

  createWindow();
})

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
