const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Gardez une référence globale de l'objet fenêtre, sinon, la fenêtre
// sera automatiquement fermée lorsque l'objet JavaScript est récupéré.
let win

function createWindow () {
  // Créer la fenêtre du navigateur.
  win = new BrowserWindow({width: 800, height: 600})

  // charger index.html de l'application.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Ouvrir DevTools.
  win.webContents.openDevTools()

  // Émis lorsque la fenêtre est fermée.
  win.on('closed', () => {
    // Déréférencer l'objet fenêtre, habituellement vous stocker des fenêtres
    // dans un tableau si votre application prend en charge plusieurs fenêtres,
    // c'est l'heure où vous devez supprimer l'élément correspondant.
    win = null
  })
}

// Cette méthode sera appelée lorsque Electron aura terminé l'initialisation
// et est prét à créer des fenêtres de navigation. Certaines API ne peuvent
// être utilisées qu'après le lancement de cet événement.
app.on('ready', createWindow)

// Quittez lorsque toutes les fenêtres sont fermées.
app.on('window-all-closed', () => {
  // Sur macOS, il est fréquent que les applications et leur barre de menus
  // restent actives jusqu'à ce que l'utilisateur quitte explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Sur macOS, il est fréquent de recréer une fenêtre dans l'application lorsque
  // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
  if (win === null) {
    createWindow()
  }
})

// Dans ce fichier, vous pouvez inclure le reste du code du processus principal
// spécifique de votre application. Vous pouvez également les mettres dans des
// fichiers distincts et les écrire ici.
