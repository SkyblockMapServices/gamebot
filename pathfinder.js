const { Vec3 } = require("vec3");
const { Bot } = require("mineflayer");

/**
 * 
 * @param {Bot} bot 
 * @param {Vec3} goal 
 */
async function goTo(bot, goal) {
    return new Promise((resolve) => {
        bot.on("physicsTick", movement);

        async function movement() {

            const goalOffset = goal.clone().offset(0.5, 0, 0.5)

            const distance = bot.entity.position.xzDistanceTo(goalOffset)
            if (distance < 0.25) {
                bot.setControlState("forward", false);
                bot.removeListener("physicsTick", movement);
                resolve();
            } else {
                bot.lookAt(goalOffset, true);
                bot.setControlState("forward", true);
            }
        }
    });
}

module.exports = {
    goTo
}
