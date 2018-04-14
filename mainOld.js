const {app, BrowserWindow, ipcMain, webContents} = require('electron');
  const path = require('path');
  const url = require('url');

  const batFilePath = "D:\\Nagarro_COE\\OpenConnect\\ElectronIPC\\test.bat";

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win;

  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg)  // prints "ping"
    event.sender.send('asynchronous-reply', 'Deepak asynch')
  })
  
  ipcMain.on('invoke-bat', (event, arg) => {
    console.log(arg);
    var str;
    win.webContents.send("custom-message-dj", {msg:"this is my message"});
    const spawn = require('child_process').spawn;
    const bat = spawn('cmd.exe', ['/c', batFilePath]);
    // Handle normal output
    bat.stdout.on('data', (data) => {
        // As said before, convert the Uint8Array to a readable string.
        str = String.fromCharCode.apply(null, data);
        console.info(str, " Received from the output stream", str);
        event.sender.send('response-bat', str)
    });
    // Handle error output
    bat.stderr.on('data', (data) => {
        // As said before, convert the Uint8Array to a readable string.
        str = String.fromCharCode.apply(null, data);
        console.error(str, " Received from the error stream");
        event.sender.send('response-bat', str)
    });
    
  })

  ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg)  // prints "ping"
    event.returnValue = 'Deepak synch'
  })

  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})
  
    // and load the index.html of the app.
    win.loadURL(url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true
    }))
  
    // Open the DevTools.
    win.webContents.openDevTools()
  
    // Emitted when the window is closed.
    
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  
  
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    } 
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.