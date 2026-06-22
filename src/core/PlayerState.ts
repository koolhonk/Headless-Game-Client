enum State { Idle, Interacting, }

type InventoryItem = [itemId: number, count: number, isIou: 0 | 1];

type NpcInstance = { id: number; instanceId: number; x: number; y: number; };

type PlayerData = {
    loggedIn: boolean;
    npcById: Map<number, Set<number>>;
    npcByInstanceId: Map<number, NpcInstance>;
    resources: Map<number, boolean>;
    isInDungeon: boolean,
    openShop: number,
    isShopping: boolean,
    health: number,
    selectedSpell: number,
    state: State,
    target: number,
    playerId: number
    name: string;
    x: number;
    y: number;
    level: number;
    inventory: (InventoryItem | null)[];
    isBanking: boolean;
};

export default class PlayerState {
    isInDungeon() {
        return this.playerData.isInDungeon;
    }
    setIsInDungeon(isInDungeon: boolean) {
      this.playerData.isInDungeon = isInDungeon;
    }
    isAt(x: number, y: number): boolean {
        return this.playerData.x === x && this.playerData.y === y;
    }
    getOpenShop() {
      return this.playerData.openShop;
    }
    setOpenShop(shopId: number) {
      this.playerData.openShop = shopId;
    }
    isShopping() {
      return this.playerData.isShopping;
    }
    setIsShopping(isShopping: boolean) {
        this.playerData.isShopping = isShopping
    }
    getResources(): Map<number, boolean> { return this.playerData.resources; }
    addResource(resourceId: number) {
        if (resourceId == 10630 || resourceId == 10631) {
            // console.log(`adding resource ${resourceId}`);
        }
        this.playerData.resources.set(resourceId, true);
    }
    removeResource(resourceId: number) {
        if (resourceId == 10630 || resourceId == 10631) {
            // console.log(`removing resource ${resourceId}`);
        }
        this.playerData.resources.delete(resourceId);
    }
    setHp(hp: number) {
        this.playerData.health = hp;
    } 
    
    getHp():number {
        return this.playerData.health;
    }

    setPlayerId(pid: number) {
        this.playerData.playerId = pid;
    }

    getUniqueNpcId(npcId: number): number {
        let set = this.playerData.npcById.get(npcId);
        if (set && set.size > 0) {
            const first = set.values().next().value;
            return first ?? -1;
        } else {
            return -1;
        }
    }
    addNpc(npcId: number, instanceId: number, x: number, y: number) {
        let set = this.playerData.npcById.get(npcId);
        if (!set) {
            set = new Set<number>();
            this.playerData.npcById.set(npcId, set);
        }
        set.add(instanceId);

        this.playerData.npcByInstanceId.set(instanceId, {
            id: npcId,
            instanceId,
            x,
            y,
        });
    }

    removeNpc(instanceId: number) {
        const npc = this.playerData.npcByInstanceId.get(instanceId);
        if (!npc) return;

        this.playerData.npcById.get(npc.id)?.delete(instanceId);
        this.playerData.npcByInstanceId.delete(instanceId);
    }
    setSpell(spellId: number) {
      this.playerData.selectedSpell = spellId;
    }
    getSelectedSpell() {
        return this.playerData.selectedSpell;
    }
    updateInventoryItem(index: number, itemId: number, itemQty: number) {
        this.playerData.inventory[index] = [itemId, itemQty, 0]; // TODO handle iou? we need to investigate packet
    }

    removeInventoryItem(index: number) {
        this.playerData.inventory[index] = null
    }
    private playerData: PlayerData;

    constructor() {
        this.playerData = {
            loggedIn: false,
            isInDungeon: false,
            openShop: -1,
            isShopping: false,
            health: -1,
            resources: new Map(),
            npcById: new Map(),
            npcByInstanceId: new Map(),
            selectedSpell: -1,
            isBanking: false,
            target: -1,
            state: State.Idle,
            playerId: -1,
            name: "",
            x: -1,
            y: -1,
            level: -1,
            inventory: [],
            /**
             * inventory is [itemid,itemcount,isIou] for example [378,1,0] is unnoted flax
             */
        };
    }

    apply(data: any[]) {
        this.playerData = {
            loggedIn: true,
            isInDungeon: (data[0][4] === 0) ,
            openShop: -1,
            isShopping: false,
            resources: new Map(),
            // todo discover npcs
            health: data[0][25],
            npcById: new Map(),
            npcByInstanceId: new Map(),
            selectedSpell: -1,
            isBanking: false,
            target: -1, // do not set initial interacting
            state: this.playerData.state, // do not update with state from 15 yet, we dont know if there is initial state value 
            playerId: data[0][0],
            name: data[0][3],
            x: data[0][5],
            y: data[0][6],
            level: data[0][4],
            inventory: data[0][7] as (InventoryItem | null)[],
            /**
             * inventory is [itemid,itemcount,isIou] for example [378,1,0] is unnoted flax
             */
        };
    }


    getInventorySlotWithItem(itemId: number) {
        return this.playerData.inventory.findIndex((item) => {
            return item &&  item[0] == itemId
        })
    }


    isBanking() {
        return this.playerData.isBanking;
    }


    setIsBanking(isBanking: boolean) {
        this.playerData.isBanking = isBanking;
    }

    setLocation(x: number, y:number) {
        this.playerData.x = x;
        this.playerData.y = y;
    }

    

    getTarget() {
        return this.playerData.target;
    }



    setInteraction(entityId: number, state: number) {
        this.playerData.state = State.Interacting;
        this.playerData.target = entityId;
        // TODO do we need the state?
    }

    setIdle() {
        // console.log('player now idle');
        this.playerData.state = State.Idle;
        this.playerData.target = -1;
    }

    isIdle() {
        return this.playerData.state === State.Idle;
    }

    getPlayerId() {
        return this.playerData.playerId;
    }

    getPlayerPosition(): [number,number] {
        if (!this.playerData) return [-1,-1];
        return [this.playerData.x, this.playerData.y];
    }
    isInventoryFull() {
        return !this.playerData.inventory.includes(null)
    }

    inventoryContains(itemId: number) {
        return this.playerData.inventory.find(item => {
            return item && item[0] == itemId;
        })
    }

    isSkilling(): boolean {
        const skillingStates = [
            7,  // FishingState
            8,  // CookingState
            13, // WoodcuttingState
            14, // MiningState
            15, // HarvestingState
            16, // TreeShakingState
            17, // SmeltingState
            18, // SmithingState
            19, // CraftingState
            23, // EnchantingState
            28, // PotionMakingState
            30, // UsingSpinningWheelState
            32, // SmeltingKilnState
            34, // PickpocketingState
            36, // PicklockingState
        ];
        return false;
        // return skillingStates.includes(this.getState());
    }
}



