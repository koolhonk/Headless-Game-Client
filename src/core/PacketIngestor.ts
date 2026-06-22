import PlayerState from "./PlayerState";

export default class PacketIngestor {
    private playerState: PlayerState;

    constructor(playerState: PlayerState) {
        this.playerState = playerState;
    };

    process(args: any): void {
        const argSet = args[0];

        for (let i = 0; i < argSet.length; i++) {
            const code = argSet[i][0]
            // player arrived at location
            if (code == 2 && argSet[i][1][0] == this.playerState.getPlayerId()) { // [2, [4835947, 3, -75, 406]], [12, [4835947, 3]]]
                const x = argSet[i][1][2]
                const y = argSet[i][1][3]
                this.playerState.setLocation(x, y);
            }
            if (code == 34 && argSet[i][1][0] == this.playerState.getPlayerId()) {
                // console.log(`character is interacting with ${argSet[i][1][1]}`);
                const entityId = argSet[i][1][1]
                const state = argSet[i][1][2]
                this.playerState.setInteraction(entityId, state);
            }

            if (code == 44) {
                const isInDungeon = 0 === argSet[i][1][4]
                this.playerState.setIsInDungeon(isInDungeon);
            }

            if (code == 71) {
                const playerHp = argSet[i][1][1]
                this.playerState.setHp(playerHp);
            }
            if (code == 73) {
                const playerHp = argSet[i][1][3]
                this.playerState.setHp(playerHp);
            }
            if (code === 46) {
                // console.log('shop opened');
                const shopId = argSet[i][1][0]
                this.playerState.setIsShopping(true);
                this.playerState.setOpenShop(shopId)
            }
            if (code == 47 && this.playerState.isShopping()) {
                // console.log('shop closed');
                // todo do we need to entity check? cant imagine getting shop close packet for another shop that isnt open
                if (argSet[i][1][0] == this.playerState.getOpenShop()) {
                    this.playerState.setIsShopping(false);
                    this.playerState.setOpenShop(-1);
                }
            }
            // // damage taken
            // [8, [13922, 6027591, 2]]
            // if (code == 8 && argSet[i][1][1] == playerState.getPlayerId()) {
            //   console.log(`damage of ${argSet[i][1][2]} taken`);
            // }

            if (code == 4) {
                // console.log(`Npc: ${argSet[i][1][1]} has spawned`);
                const npcId = argSet[i][1][1]
                const instanceId = argSet[i][1][0]
                const x = argSet[i][1][3]
                const y = argSet[i][1][4]
                this.playerState.addNpc(npcId, instanceId, x, y) // todo we need to process npc update packets if we want to select closest npc correctly
            }

            if (code == 6) {
                // console.log(`Npc: ${argSet[i][1][0]} has despawned`);
                console.log();
                const uniqueNpcId = argSet[i][1][0];
                this.playerState.removeNpc(uniqueNpcId)
            }

            // spell  selected
            if (code == 70) {
                const selectedSpell = argSet[i][1][0];
                this.playerState.setSpell(selectedSpell)
            }

            if (code == 54) {
                const resourceId = argSet[i][1][0];
                // console.log(`Resource ${resourceId} has despawned`);
                if (resourceId == this.playerState.getTarget()) {
                    this.playerState.setIdle();
                }
                this.playerState.removeResource(resourceId);

            }

            if (code == 55) {
                const resourceId = argSet[i][1][0];
                // console.log(`Resource ${resourceId} has spawned`)
                this.playerState.addResource(resourceId)
            }

            if (code == 19 && argSet[i][1][0] == this.playerState.getPlayerId()) {
                this.playerState.setIsBanking(true);
            }

            if (code == 20 && argSet[i][1][0] == this.playerState.getPlayerId()) {
                this.playerState.setIsBanking(false);
            }

            if ([35, 12].includes(code) && argSet[i][1][0] == this.playerState.getPlayerId()) {
                // console.log('character is now idling');
                this.playerState.setIdle();
            }

            if (code == 95) {
                // index, newItemId, newItemQuantity
                if (argSet[i][1][0] === 0) {
                    // console.log('found item update');
                    this.playerState.updateInventoryItem(argSet[i][1][1], argSet[i][1][2], argSet[1][3]);
                } else {
                    // console.log('found bank item added');
                }
            }

            if (code == 94) {
                if (argSet[i][1][0] === 0) {
                    // console.log('found item removed');
                    const itemCount = argSet[i][1][5]
                    if (1 > itemCount) {
                        this.playerState.removeInventoryItem(argSet[i][1][1])
                    }
                } else {
                    // console.log('found bank item removed');
                }
            }
        }
    }
}
