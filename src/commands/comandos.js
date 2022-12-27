import { cmdLangFn, cmdLangRegExp } from "./lang.js";
import { cmdPingFn, cmdPingRegExp } from "./ping.js";
import { cmdStartFn, cmdStartRegExp } from "./start.js";
import { cmdUrlTikTokFn, cmdUrlTikTokRegExp } from "./urlTikTok.js";
import { cmdUrlYtFn, cmdUrlYtRegExp } from "./urlYt.js";

const cmds = [];
cmds.push({ cmd: cmdStartRegExp, cb: cmdStartFn });
cmds.push({ cmd: cmdPingRegExp, cb: cmdPingFn });
cmds.push({ cmd: cmdLangRegExp, cb: cmdLangFn });
cmds.push({ cmd: cmdUrlTikTokRegExp, cb: cmdUrlTikTokFn });
cmds.push({ cmd: cmdUrlYtRegExp, cb: cmdUrlYtFn });
export { cmds };
