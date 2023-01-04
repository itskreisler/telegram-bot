const lang = {
  welcome: '',
  error: '',
  lang: '',
  setError (txt) {
    this.error = txt
  },
  setWellcome (txt) {
    this.welcome = txt
  },
  setLang (txt) {
    this.lang = txt
  },
  cb: function (val = 'en') {
    switch (val) {
      case 'es':
        this.setWellcome(`
        🥳 Bienvenido\n\n*Comandos disponibles:*\n/start - Iniciar el bot\n/lang - Cambiar el idioma\n/help - Mostrar la ayuda\n/ping - Pong
          `)
        this.setError('Lo siento, este link NO es de tiktok.😢')
        this.setLang('Selecciona el idioma!')
        this.msgLang = 'Cambiaste el idioma del bot a Español'

        break
      default:
        this.setWellcome(
          '🥳 Welcome, to start the bot send me a the tiktok link, please!! ✅ \n \n /lang - change language'
        )
        this.setError('Sorry this link is not a tiktok link.😢')
        this.setLang('Select your favorite Language!')
        this.msgLang = 'Change language to English'
        break
    }
  }
}

export { lang }
