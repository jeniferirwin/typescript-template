import {NS, Server} from "@ns";
import { canNuke, getGrowThreadCount } from "./libserver";

export async function main(ns: NS) {
    var hostname = "n00dles";
    if (ns.args.length > 0 && typeof(ns.args[0]) === "string") {
        hostname = ns.args[0];
        if (!ns.serverExists(hostname)) {
            ns.tprint(`No such server ${hostname}.`);
            return;
        }
    }
    if (!ns.hasRootAccess(hostname)) {
        if (canNuke(ns.getServer(hostname))) {
            ns.nuke(hostname);
        } else {
            ns.tprint(`Cannot nuke ${hostname}.`);
            return;
        }
    }
    
}