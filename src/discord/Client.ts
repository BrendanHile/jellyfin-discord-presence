import RPC from "discord-rpc"

const DiscordRPC = new RPC.Client({ transport: 'ipc' });

export default DiscordRPC