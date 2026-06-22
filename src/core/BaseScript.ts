import { io, Socket } from "socket.io-client";
import PlayerActions from "./PlayerActions";
import PlayerState from "./PlayerState";
import PacketIngestor from "./PacketIngestor";

function createWsConn(user: string, world: number, loginToken: any, playerState: PlayerState, packetIngestor: PacketIngestor): Socket {
    const socket = io(`https://server${world}.highspell.com:8888`, {
        path: "/socket.io",
        transports: ["websocket"],
        forceNew: true,
        reconnection: false,
    });

    socket
        .on("connect", () => {
            socket.emit("13", [
                user,
                loginToken,
                61
            ]);
            console.log('logged in...')
        })
        .on("connect_error", (err: any) => {
            // console.log("connect_error message:", err.message);
            // console.log("connect_error description:", err.description);
            // console.log("connect_error context:", err.context);
        })
        .on("error", (err) => {
            // console.log("engine error:", err);
        })
        .on("close", (reason) => {
            // console.log("engine close:", reason);
        })

        // Game packet
        .onAny((event, ...args) => {
            if (event === "15") {
                console.log("Found login packet, starting script");
                // console.log(JSON.stringify(args));

                // TODO refactor apply (which was login even handler), should be processed like normal packet and cause user status to be logged in and script tickable
                playerState.apply(args);
            } else if (event === "0") {
                packetIngestor.process(args)
            } else {
                //   console.log("[IN EVENT]", event, JSON.stringify(args));
            }
        })



    return socket;
}

export default abstract class BaseScript {
    // TODO can get rid of undefined if we remove login/out control from within script
    protected socket: Socket | undefined;
    protected playerState: PlayerState = new PlayerState();
    protected playerActions: PlayerActions | undefined;
    protected packetIngestor: PacketIngestor | undefined;

    constructor() {
        // this.playerActions = new PlayerActions(this.socket, this.playerState)
        // this.packetIngestor = new PacketIngestor(this.socket, this.playerState)
    }

    isLoggedIn(): boolean {
        return !!this.socket
    }

    // TODO where do we want to manage login? Should script be able to control? or should login happen on script init?
    async login(username: string, world: number, loginToken: any) {
        if (![1, 2].includes(world)) {
            throw new Error(`World ${world} is not valid`)
        }

        this.playerState = new PlayerState();
        this.packetIngestor = new PacketIngestor(this.playerState)
        this.playerActions = new PlayerActions(this.socket, this.playerState)
        this.socket = createWsConn(username, world, loginToken, this.playerState, this.packetIngestor);
    }

    async logout() {
        // if (!this.isLoggedIn()) return;
        if (!this.playerActions) return
        // TODO - we have some scripts that need to wait to go to a safe place/checkpoint before log out. 
        // thus we will need to have an abstract method that the script implements that will tell us if we are capable of logout or should wait
        await this.playerActions.logout(); // TODO handle closing properly, could be edge cases since moved from separate processes
        this.socket = undefined;
    }

    protected sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // this will be called once every 600ms, it must be stateless. It should read player state and emit exactly one action. No wait, sleep, etc
    abstract tick(): Promise<void>;
}