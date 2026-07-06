import { NS, Server } from "@ns";
import { getAllServers, startShareScript, canNuke, canCrackPorts, crackPorts, putBundle } from "./libserver.js";

export function main(ns: NS): void {
  var servers = getAllServers(ns);
  for (var server of servers.values()) {
    putBundle(ns, server.hostname);
  }
  startBotNet(ns, servers);
}

export function startBotNet(ns: NS, servers: Map<string, Server>): void {
  const attackScript = "scripts/AttackAnalysis.js";
  for (var server of servers.values()) {
    ns.tprint(`[${server.hostname}] ${server.maxRam} ${server.cpuCores}`);
    ns.killall(server.hostname);
    if (server.purchasedByPlayer) {
      continue;
    }
    if (!server.hasAdminRights && canCrackPorts(ns, server.hostname)) {
      crackPorts(ns, server);
      if (canNuke(server)) {
        ns.nuke(server.hostname);
      }
    }
    if (server.hasAdminRights && ns.getServerMaxRam(server.hostname) > 2) {
      startShareScript(ns, server.hostname);
      ns.tprint(`${server.hostname} starting share script`);
      continue;
    }
  }
  ns.exec("scripts/hacknet.js", "home");
  for (var hostname of getAllServers(ns).keys()) {
    if (hostname !== "home" && ns.getServerRequiredHackingLevel() < ns.getPlayer().skills.hacking * 0.30) {
      ns.exec(attackScript, "home", 1, hostname);
    }
  }
}
