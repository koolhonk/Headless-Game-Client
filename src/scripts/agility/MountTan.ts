import BaseScript from "../../core/BaseScript";

export default class MountTan extends BaseScript {
    async tick() {
        if (!this.playerActions || !this.socket) return // TODO move logout control
        console.log(new Date());
        // go to hell
        this.playerActions.walkTo(666,-666);
        // calculator stuff
        this.socket.emit("8008135");
    }
}