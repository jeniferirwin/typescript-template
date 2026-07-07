import { NS, Server } from "@ns";
import { getAllServers } from "./libserver";

export function main(ns: NS) {
    var servers = getAllServers(ns);
    for (var server of servers.values()) {
        if (server.backdoorInstalled || server.purchasedByPlayer) {
            continue;
        }
        ns.tprint(`No backdoor on ${server.hostname}`);
    }
}