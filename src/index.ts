import {userMapping} from './loadUserConfig'
import { getLoginToken } from './login';
import { initScript } from './loadScripts';
import BaseScript from './core/BaseScript';

// TODO on process kill, log out each user

const bots: Map<String, BaseScript> = new Map();

process.on("SIGTERM", () => {
    bots.forEach((bot) => bot.logout())
    process.exit(0);
});

process.on("SIGINT", () => {
    bots.forEach((bot) => bot.logout())
    process.exit(0);
});

userMapping.forEach(async (userConfig, userName) => {
    // TODO proxy configs...
    const userPassword = userConfig[0]
    const world = userConfig[1]
    const scriptName = userConfig[2]
    const params = userConfig[3]


    const botInstance = initScript(scriptName)

    if (!botInstance) return; // TODO we should crash all accounts here until they fix the user config?? otherwise would be hard to notice an acc failure in logs

    const loginToken = await getLoginToken(userName, userPassword, world);

    botInstance.login(userName, world, loginToken)
    bots.set(userName, botInstance)
})

function sleep(ms: number) {
  console.log("starting sleep");
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function processGameTicks() {
    await sleep(600)
    bots.forEach((bot) => {
        // TODO move socket creation and login/logout to bot layer to remove this handling, the map
        // disable now, so we possibly cant handle some dc issues atm
        // if (!bot.isLoggedIn()) {
        //     bot.login();
        // }
        bot.tick();
    })
}
