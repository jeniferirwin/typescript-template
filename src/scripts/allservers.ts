import { NS, Server } from "@ns";
import { getAllServers, startShareScript } from "./libserver.js";

export function main(ns: NS): void {
  var servers = getAllServers(ns);
  for (var server of servers.values()) {
    putBundle(ns, server.hostname);
  }
  startBotNet(ns, servers);
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

export function startBotNet(ns: NS, servers: Map<string, Server>): void {
  const attackScript = "scripts/AttackAnalysis.js";
  for (var server of servers.values()) {
    ns.tprint(`[${server.hostname}]`);
    ns.killall(server.hostname);
    if (server.hostname === "home") {
      // ns.exec("scripts/hacknet.js", server.hostname);
      ns.exec("scripts/autocloud.js", server.hostname, 1, "scripts");
      ns.exec(attackScript, server.hostname, 1, "foodnstuff");
      continue;
    }
    if (server.purchasedByPlayer) {
      continue;
    }
    if (!server.hasAdminRights && canCrackPorts(ns, server)) {
      crackPorts(ns, server);
      if (canNuke(server)) {
        ns.nuke(server.hostname);
      }
    }
    if (server.hasAdminRights && ns.getServerMaxRam(server.hostname) >= 4) {
      startShareScript(ns, server.hostname);
      ns.tprint(`${server.hostname} starting share script`);
      continue;
    }
    if (server.hasAdminRights) {
      var ram = ns.getServerMaxRam(server.hostname);
      ns.tprint(`[${server.hostname}] Skipped due to RAM constraints: ${ram}`);
    } else {
      ns.tprint(`[${server.hostname}] Skipped due to lack of admin rights`);
    }
  }
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
