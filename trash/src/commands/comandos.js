import { cmdLangFn, cmdLangRegExp } from './lang.js'
import { cmdPingFn, cmdPingRegExp } from './ping.js'
import { cmdStartFn, cmdStartRegExp } from './start.js'
import { cmdUrlTikTokFn, cmdUrlTikTokRegExp } from './urlTikTok.js'
import { cmdUrlYtFn, cmdUrlYtRegExp } from './urlYt.js'
import { cmdOffFn, cmdOffRegExp } from './off.js'
import { cmdUrlFbFn, cmdUrlFbRegExp } from './urlFb.js'
import { cmdAmaFn, cmdAmaRegExp } from './ama.js'
import { cmdTwitterFn, cmdTwitterRegExp } from './urlTwitter.js'

const cmds = []
cmds.push({ cmd: cmdStartRegExp, cb: cmdStartFn })
cmds.push({ cmd: cmdPingRegExp, cb: cmdPingFn })
cmds.push({ cmd: cmdLangRegExp, cb: cmdLangFn })
cmds.push({ cmd: cmdUrlTikTokRegExp, cb: cmdUrlTikTokFn })
cmds.push({ cmd: cmdUrlYtRegExp, cb: cmdUrlYtFn })
cmds.push({ cmd: cmdOffRegExp, cb: cmdOffFn })
cmds.push({ cmd: cmdUrlFbRegExp, cb: cmdUrlFbFn })
cmds.push({ cmd: cmdAmaRegExp, cb: cmdAmaFn })
cmds.push({ cmd: cmdTwitterRegExp, cb: cmdTwitterFn })

export { cmds }
