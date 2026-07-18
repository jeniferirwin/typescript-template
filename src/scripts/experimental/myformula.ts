import { NS, Server } from "@ns";
import { getAllServers, ListServerStats } from "../libserver";

export function CreateTestServer(ns: NS): Server {
    var server = ns.formulas.mockServer();
    return server;
}

export function main(ns: NS) {
    ListServerStats(ns, ns.getServer("joesguns"));
}