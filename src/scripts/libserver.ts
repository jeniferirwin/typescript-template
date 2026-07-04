import {NS, Server} from "@ns";

export function getServerFreeRam(ns: NS, hostname: string): number | undefined {
    if (ns.serverExists(hostname) && ns.hasRootAccess(hostname)) {
        return ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
    }
    return undefined;
}

export function getGrowThreadCount(ns: NS, hostname: string): number | undefined {
    if (ns.serverExists(hostname) && ns.hasRootAccess(hostname)) {
        var moneyDiffMult = ns.getServerMaxMoney(hostname) / ns.getServerMoneyAvailable(hostname);
        return ns.growthAnalyze(hostname, moneyDiffMult);
    }
    return undefined; 
}

export function getSecurityDiff(ns: NS, hostname: string): number | undefined {
    if (ns.serverExists(hostname) && ns.hasRootAccess(hostname)) {
        return ns.getServerSecurityLevel(hostname) - ns.getServerMinSecurityLevel(hostname);
    }
    return undefined;
}

export function getWeakenThreadCount(ns: NS, hostname: string): number | undefined {
    if (ns.serverExists(hostname) && ns.hasRootAccess(hostname)) {
        var diff = getSecurityDiff(ns, hostname);
        if (diff !== undefined) {
            return Math.ceil(diff / 0.05);
        }
    }
    return undefined;
}

export function startShareScript(ns: NS, hostname: string) {
    const shareScript = "scripts/sharing.js";
    var ram = ns.getServerMaxRam(hostname);
    if (ram !== undefined) {
        var threads = ram / ns.getScriptRam(shareScript, hostname);
        if (threads !== undefined && threads > 0) {
            ns.tprint(`[${hostname}] Starting sharing script with ${threads} threads.`);
            ns.exec(shareScript, hostname, threads);
        }
    }
}

export function getAllServers(ns: NS): Map<string, Server> {
  ns.ui.clearTerminal();
  var servers = new Map<string, Server>();
  servers.set("home", ns.getServer("home"));
  var changed = true;
  while (changed === true) {
    changed = false;
    for (var server of servers.values()) {
        var results = ns.scan(server.hostname);
        for (var result of results) {
            var found = ns.getServer(result);
            if (!servers.has(found.hostname)) {
                servers.set(found.hostname, found);
                changed = true;
            } 
        }
    }
  }
  for (var cloudServer of ns.cloud.getServerNames()) {
    servers.set(cloudServer, ns.getServer(cloudServer));
  }
  return servers;
}