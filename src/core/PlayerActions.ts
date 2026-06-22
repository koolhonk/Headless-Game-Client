import type PlayerState from "./PlayerState.js";

export default class PlayerActions {
    private _socket: any;
    private _playerState: PlayerState;
    constructor(socket: any, playerState: PlayerState) {
        this._socket = socket;
        this._playerState = playerState;
    }
    walkTo(x: number, y: number) {
        this._socket.emit("1", [10, [x, y]]);
    }
    buy(itemId: number, slotId: number) {
        this._socket.emit("1", [89,[12,2,slotId,itemId,99,0]]);
    }
    interactWith(actionId: number, entityId: number) {
        this._socket.emit("1", [42, [actionId, 0, entityId]]);
    }
    tradeWith(npcId: number) {
        const uniqueId = this._playerState.getUniqueNpcId(npcId);
        // console.log(`trading ${npcId} ::  ${uniqueId}`);
        this._socket.emit("1", [42, [2, 2, uniqueId]]);
    }
    thieve(npcId: number) {
        const uniqueId = this._playerState.getUniqueNpcId(npcId);
        if (uniqueId !== -1) {
            console.log(`thieving ${uniqueId}`);
            this._socket.emit("1",[42,[4,2,uniqueId]]);
        }
    }

    eat(itemId: number) {
        const slotId = this._playerState.getInventorySlotWithItem(itemId);
        this._socket.emit("1",[89,[3,0,slotId,itemId,1,0]]);
    }

    selectSpell(spellIndex: number) {
        this._socket.emit(["1",[69,[spellIndex]]]);
    }
    useItemOnEntity(itemId: number, entityId: number) {
        this._socket.emit("1", [29, [itemId, entityId, 0]]);
    }
    useItemOnItem(itemId: number, itemId2: number) {
        const item1Slot = this._playerState.getInventorySlotWithItem(itemId);
        const item2Slot = this._playerState.getInventorySlotWithItem(itemId2);

        console.log(`Using ${itemId} at slot ${item1Slot} on ${itemId2} at slot ${item2Slot}`)
        this._socket.emit("1", [60, [0, item1Slot, itemId, 0, item2Slot, itemId2, 0, 0, 99]]);
    }

    logout() {
        // 42["1", [16, [4820269]]]
        if (this._playerState.getPlayerId() > 0) {
            this._socket.emit("1", [16, this._playerState.getPlayerId()])
            this._playerState.setPlayerId(-1);
        }
    }


    dropItem(itemId: number) {
        const slotId = this._playerState.getInventorySlotWithItem(itemId);
        if (slotId >= 0) {
            this._socket.emit("1", [89,[2,0,slotId,itemId,1,0]]);
        }
    }


    openBank(bankId: number) {
        // console.log('opening bank');
        console.log(JSON.stringify([42,[5,0,bankId]]));
        this._socket.emit("1", [42,[5,0,bankId]]);
    }
    depositAllItem(itemId: number) {
        // console.log(`deposing all ${itemId}`);
        /// deposit all string [89, [9, 0, 1, 352, 28, 0]]
        this._socket.emit("1", [89, [9, 0, 1, itemId, 28, 0]]);

    }
    withdrawItem(itemId: number, count: number) {
        // TODO
        const bankSlot = 0; // this.getBankSlotWithItem(itemId);
        this._socket.emit("1", [89, [7, 1, bankSlot, itemId, count, 0]]);
    }
}