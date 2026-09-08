export default function antiCrash() {
    process.removeAllListeners()

    process.on('unhandledRejection', (reason, promise) => {
        console.log(' [ANTICRASH] - unhandledRejection')
        console.log(reason, String(promise))
    })
    process.on('uncaughtException', (error, origin) => {
        console.log(' [antiCrash] :: uncaughtException')
        console.log(error, String(origin))
    })
    process.on('uncaughtExceptionMonitor', (error, origin) => {
        console.log(' [antiCrash] :: uncaughtExceptionMonitor')
        console.log(error, String(origin))
    })
    process.on('multipleResolves', () => { })
    process.on('SIGINT', () => process.exit())
    process.on('SIGUSR1', () => process.exit())
    process.on('SIGUSR2', () => process.exit())
}
