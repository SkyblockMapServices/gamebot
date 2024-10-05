import 'dotenv/config'

import mineflayer from 'mineflayer'
const { pathfinder, Movements } = require("mineflayer-pathfinder")
import { Vec3 } from './node_modules/vec3/index'
const Item = require("prismarine-item")("1.20.1")
const { Goal, GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
import { parser } from 'mapartcraft-parser'
import { goTo } from './pathfinder'
import config from './config.json'
import { o, sleep } from './src/util'
import { loader as autoEat } from 'mineflayer-auto-eat'
import utilPlugin from '@nxg-org/mineflayer-util-plugin';
import { announceMilestonePlacing } from './src/reporting'

const nearbyBlocks = (pos: any, blocks: any): {
    pos: Vec3
    block: string,
}[] => {
    var block = blocks.filter(block => block.pos.xzDistanceTo(pos) < settings.range);
    return block
}


var bot = mineflayer.createBot({
    host: "skyblock.net",
    version: "1.20.1",
    viewDistance: "tiny",
    auth: "microsoft",
    profilesFolder: "profiles",
    username: process.env.ACCOUNT_EMAIL!,
    password: process.env.ACCOUNT_PASSWORD!,
})

const _bhp = bot.hasPlugin
bot.hasPlugin = (plugin: mineflayer.Plugin) => {
    if (!plugin) return true; // auto eat tries to load undefined
    else return _bhp(plugin)
}


const settings = {
    range: 4.5,
    //@ts-ignore
    start: new Vec3(...config.StartBox),
    //@ts-ignore
    end: new Vec3(...config.EndBox),
    moveBy: 1,
    moveRow: 8
}

let nextPosition = new Vec3(settings.start.x, 0, settings.start.z)
let currentPosition = new Vec3(0, 0, 0)


let data: any = {
    row: 0,
    startTime: undefined,
}

let blocksPlaced = {
    count: 0,
    coords: [] as [number, number, number][]
}

bot.on("spawn", async () => {
    console.log('Spawned!')
    bot.loadPlugin(utilPlugin)
    bot.loadPlugin(autoEat)
    bot.autoEat.enableAuto()
    bot.chat("/visit JuzzyShop")

    await goTo(bot, settings.start.offset(0, bot.player.entity.position.y, 0))
    data.startTime = Date.now()

    const schematic = (await parser(__dirname + "/map.nbt"))
        .simplify()
        .filter(data => 
            data.block !== "minecraft:none" && data.block !== "minecraft:cobblestone")
        .map(({ block, x, z }) => {
            return { pos: new Vec3(x + settings.start.x, bot.player.entity.position.y, z + settings.start.z - 1), block: block.replace("minecraft:", "") }
        })

    const blocks = [...new Set(schematic.map(a => a.block))]
    blocks.forEach(blockType => { // Console logs all necessary blocks

        console.log(`${schematic.filter(a => a.block === blockType).length}x ${blockType}`)

    })


    for (let index = 0; index < schematic.length; index++) {
        const block = schematic[index];

        nextPosition.y = bot.player.entity.position.y;
        currentPosition = bot.player.entity.position;


        await goTo(bot, nextPosition);

        if (data.row % 2 == 0) {
            nextPosition.z += settings.moveBy
            if (nextPosition.z >= settings.end.z) {
                nextPosition.z = settings.end.z;
                nextPosition.x += settings.moveRow; // Move 2 blocks to the left
                data.row++; // Update to the next row
            }
        } else {
            nextPosition.z -= settings.moveBy;
            if (nextPosition.z <= settings.start.z) {
                nextPosition.z = settings.start.z;
                nextPosition.x += settings.moveRow; // Move 2 blocks to the left
                data.row++; // Update to the next row
            }
        }




        const blocksNear = nearbyBlocks(currentPosition, schematic);



        if (blocksNear.length <= 0) continue;

        for (const nearbyBlock of blocksNear) { // Nearby block placement
            const refBlock = bot.blockAt(nearbyBlock.pos.offset(0, -1, 0));
            const blockExist = bot.blockAt(nearbyBlock.pos);

            

            if (blockExist?.name !== "air") continue;


            if (refBlock?.name == "dispenser") bot.setControlState("sneak", true);
            
            var item = bot.inventory.items().find(item => item.name === nearbyBlock.block);
            
            if (!item) {
                bot.setControlState("sneak", false);
                continue;
            }

            if (blockExist.position.xzDistanceTo(bot.player.entity.position) > settings.range) continue;

            bot.lookAt(nearbyBlock.pos, true);
            if (blockExist.position.xzDistanceTo(bot.player.entity.position) < 1) {
                bot.setControlState("jump", true);

                await new Promise((resolve, reject) => {
                    bot.setControlState("jump", false);
                    setTimeout(resolve, 75);

                });
            }

            await bot.equip(item, "hand");
            await new Promise<void>(async (outerResolve, reject) => {
                // setTimeout(resolve, 50);
                const slot = bot.getEquipmentDestSlot('hand')
                do {
                    sleep(50)
                } while (bot.inventory.slots[slot]?.stackId != item?.stackId) 
                outerResolve()                
            });

            
            await bot.placeBlock(refBlock!, new Vec3(0, 1, 0)).catch((r) => console.log(r));
            blocksPlaced.count++
            blocksPlaced.coords.push(nearbyBlock.pos.toArray())

            if (blocksPlaced.count % 128 == 0) {
                announceMilestonePlacing(blocksPlaced.count, blocksPlaced.coords, bot.inventory.slots.map(item => item == null ? null : 
                    o({
                        name: item.name,
                        count: item.count,
                    })
                ))
                blocksPlaced.coords = []
                blocksPlaced.count = 0
            }
            
            bot.setControlState("sneak", false);

            
        }

        
    }

    console.log(`Done at ${Date.now()}\n${Date.now() - data.startTime}ms elapsed.`);
});







process.stdin.on("data", async (data: any) => {
    data = data.toString().trim()

    try {
        var evaled = await eval(data)
        console.log(evaled);
    } catch (e) {
        console.log(e.message);
    }
})