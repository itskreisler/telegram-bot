const lang = {
  welcome: "",
  error: "",
  lang: "",
  setError(_) {
    this.error = _;
  },
  setWellcome(_) {
    this.welcome = _;
  },
  setLang(_) {
    this.lang = _;
  },
  cb: function (val = "en") {
    switch (val) {
      case "es":
        this.setWellcome(
          `🥳 Bienvenido para iniciar el bot envia un link de tiktok \n \n /lang - cambiar idioma`
        );
        this.setError("Lo siento, este link NO es de tiktok.😢");
        this.setLang("Selecciona el idioma!");
        this.msgLang = "Cambiaste el idioma del bot a Español";

        break;
      default:
        this.setWellcome(
          `🥳 Welcome, to start the bot send me a the tiktok link, please!! ✅ \n \n /lang - change language`
        );
        this.setError("Sorry this link is not a tiktok link.😢");
        this.setLang("Select your favorite Language!");
        this.msgLang = "Change language to English";
        break;
    }
  },
};

export { lang };
