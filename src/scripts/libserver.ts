import {NS, ProcessInfo, Server} from "@ns";

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

export function getAllProcesses(ns: NS): Map<string, ProcessInfo[]> {
    var servers = getAllServers(ns);
    var pids = new Map<string, ProcessInfo[]>;
    for (var server of servers.values()) {
        pids.set(server.hostname, ns.ps(server.hostname));
    }
    return pids;
}

export function crackPorts(ns: NS, server: Server): boolean {
  if (!canCrackPorts(ns, server)) {
    return false;
  }
  var anyCracked = false;
  if (!server.ftpPortOpen && ns.ftpcrack(server.hostname)) {
    anyCracked = true;
  }
  if (!server.sqlPortOpen && ns.sqlinject(server.hostname)) {
    anyCracked = true;
  }
  if (!server.sshPortOpen && ns.brutessh(server.hostname)) {
    anyCracked = true;
  }
  if (!server.httpPortOpen && ns.httpworm(server.hostname)) {
    anyCracked = true;
  }
  if (!server.smtpPortOpen && ns.relaysmtp(server.hostname)) {
    anyCracked = true;
  }
  return anyCracked;
}

export function canCrackPorts(ns: NS, server: Server): boolean {
  var reqPorts = server.numOpenPortsRequired;
  var curPorts = server.openPortCount;
  if (reqPorts === undefined || curPorts === undefined) {
    ns.tprint(`Ports on ${server.hostname} are undefined, cannot crack`);
    return false;
  }
  return true;
}

export function canNuke(server: Server): boolean {
  var reqPorts = server.numOpenPortsRequired;
  var curPorts = server.openPortCount;
  if (reqPorts === undefined || curPorts === undefined || curPorts < reqPorts) {
    return false;
  }
  return true;
}

export function haveSkill(ns: NS, server: Server): boolean {
  var skill = server.requiredHackingSkill;
  if (skill === undefined || skill > ns.getPlayer().skills.hacking) {
      ns.tprint(`[${server.hostname}] SKILL ISSUE: ${ns.getPlayer().skills.hacking} vs. ${server.requiredHackingSkill}`)
      return false;
  }
  return true;
}

export function putBundle(ns: NS, hostname: string): boolean {
  if (hostname === "home") {
    return false;
  }
  try {
    const bundle = ns.ls("home", "scripts");
    for (var file of bundle) {
      ns.rm(file, hostname);
    }
    ns.scp(bundle, hostname);
  }
  catch(error) {
    ns.tprint(`Bundle transfer to ${hostname} failed: ${error}`);
    return false;
  }
  ns.tprint(`Bundle transferred to ${hostname}.`);
  return true;
}