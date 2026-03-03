const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isDesktopApp: true,
});
