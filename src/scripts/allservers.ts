import { NS, Server } from "@ns";

export function main(ns: NS): void {
  var servers = getAllServers(ns);
  for (var server of servers.values()) {
    putBundle(ns, server);
  }
  startBotNet(ns, servers);
}

export function getAllServers(ns: NS): Map<string, Server> {
  ns.ui.clearTerminal();
  var servers = new Map<string, Server>();
  var current = ns.getServer();
  servers.set(current.hostname, current);
  for (var server of servers.values()) {
    var results = ns.scan(server.hostname);
    for (var result of results) {
      var found = ns.getServer(result);
      if (!servers.has(found.hostname)) {
        servers.set(found.hostname, found);
      } 
    }
  }
  for (var cloudServer of ns.cloud.getServerNames()) {
    servers.set(cloudServer, ns.getServer(cloudServer));
  }
  return servers;
}

export function putBundle(ns: NS, server: Server): boolean {
  if (server.hostname === "home") {
    return false;
  }
  try {
    const bundle = ns.ls("home", "scripts");
    for (var file of bundle) {
      ns.rm(file, server.hostname);
    }
    ns.scp(bundle, server.hostname);
  }
  catch(error) {
    ns.tprint(`Bundle transfer to ${server.hostname} failed: ${error}`);
    return false;
  }
  ns.tprint(`Bundle transferred to ${server.hostname}.`);
  return true;
}

export function startBotNet(ns: NS, servers: Map<string, Server>): void {
  for (var server of servers.values()) {
    if (server.hasAdminRights && !server.purchasedByPlayer) {
      ns.exec("scripts/AttackAnalysis.js", server.hostname);
      continue;
    }
    if (!canCrackPorts(server)) {
      continue;
    } else {
      crackPorts(ns, server);
      if (canNuke(server)) {
        ns.nuke(server.hostname);
        ns.exec("scripts/AttackAnalysis.js", server.hostname);
      }
    }
  }
}

export function crackPorts(ns: NS, server: Server): boolean {
  if (!canCrackPorts(server)) {
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

export function canCrackPorts(server: Server): boolean {
  var reqPorts = server.numOpenPortsRequired;
  var curPorts = server.openPortCount;
  if (reqPorts === undefined || curPorts === undefined) {
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
      return false;
  }
  return true;
}
