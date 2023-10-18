const mineflayer = require("mineflayer")
const { pathfinder, Movements } = require("mineflayer-pathfinder")
const Vec3 = require("vec3").Vec3
const Item = require("prismarine-item")("1.20.1")
const { Goal, GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals

const schematic = require("./data.json")

var bot = mineflayer.createBot({
    host: "localhost",
    username: "JuzzyShop",
    version: "1.20.1",
    viewDistance: "tiny"
})

bot.loadPlugin(pathfinder)

const settings = {
    range: 4,
    start: {
        x: 0,
        z: 0, // This should be the right bottom corner of the image or idfk anywhere
    }
}

let currentBlock = { x: 0, z: 0 }
let nextPosition = { x: 0, z: 0 }

function difference(a, b) { return Math.abs(a - b); }

function nearbyBlocks(pos, blocks) {

    var nearbyBlocks = []

    blocks.flat().forEach(element => {
        if (difference(element.x + settings.start.x, pos.x) < settings.range - 1 && difference(element.z + settings.start.z, pos.z) < settings.range - 1) {
            nearbyBlocks.push(element)

        }
    })

    return nearbyBlocks

}

process.stdin.on("data", async (data) => {
    data = data.toString().trim()

    try {
        var evaled = await eval(data)
        console.log(evaled);
    } catch (e) {
        console.log(e.message);
    }
})

let data = {
    row: 0
}

/*
            let moveTo = new Vec3(nextPosition.x, bot.player.entity.position.y, nextPosition.z)

            
            console.log(`On my way to ${moveTo}, Next position is ${new Vec3(nextPosition.x, bot.player.entity.position.y, nextPosition.z)}`);
            await bot.pathfinder.goto(new GoalNear(moveTo.x, moveTo.y, moveTo.z, 1))
            if (data.row % 2 == 0) {
                nextPosition.x = nextPosition.x + 1
            } else {
                nextPosition.x = nextPosition.x - 1
            }
            */

bot.on("spawn", async () => {

    const defaultMove = new Movements(bot)
    bot.pathfinder.setMovements(defaultMove)

    await bot.pathfinder.goto(new GoalNear(settings.start.x, bot.player.entity.position.y, settings.start.z, 0))

    for (const z in schematic) {

        for (let x = 0; x <= (schematic[z].length / 2) - 1; x++) {

            var block = schematic[z][x]

            currentBlock.x = block.x
            currentBlock.z = block.z

            if (data.row % 2 == 0) {
                nextPosition.x = nextPosition.x + 2
            } else if (block.x !== 0) {
                nextPosition.x = nextPosition.x - 2
            }

            console.log(x, z);

            let moveTo = new Vec3(nextPosition.x, bot.player.entity.position.y, nextPosition.z)
            await bot.pathfinder.goto(new GoalNear(moveTo.x, moveTo.y, moveTo.z, 0))

            const blocksNear = nearbyBlocks(bot.player.entity.position, schematic)

            if (blocksNear.length <= 0) continue;
            for (const nearbyBlock of blocksNear) {

                const refBlock = bot.blockAt(new Vec3(nearbyBlock.x, bot.player.entity.position.y - 1, nearbyBlock.z))
                const blockExist = bot.blockAt(new Vec3(nearbyBlock.x, bot.player.entity.position.y, nearbyBlock.z))

                if (blockExist.name !== "air") continue
                if (refBlock.name == "dispenser") bot.setControlState("sneak", true)

                bot.lookAt(new Vec3(nearbyBlock.x, bot.player.entity.position.y, nearbyBlock.z), true)
                var item = bot.inventory.items().find(item => item.name === nearbyBlock.block)
                if (!item) {
                    console.log(`Missing ${nearbyBlock.block}`);
                    continue
                }

                if (blockExist.position.equals(bot.player.entity.position.floor())) {
                    bot.setControlState("jump", true)
                    bot.setControlState("jump", false)
                }

                await bot.equip(item, "hand")
                await new Promise((resolve, reject) => {
                    setTimeout(resolve, 50)
                })
                await bot.placeBlock(refBlock, new Vec3(0, 1, 0)).catch((r) => console.log(r))
                bot.setControlState("sneak", false)
            }



        }
        data.row = data.row + 1;
        nextPosition.z = nextPosition.z + 4

    }






})