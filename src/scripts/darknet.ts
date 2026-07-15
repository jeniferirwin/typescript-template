import {NS} from "@ns";

export async function main(ns: NS) {
    var darkservers = ns.dnet.probe();
    for (var server of darkservers) {
        if (!ns.dnet.isDarknetServer) {
            continue;
        }
    }
}