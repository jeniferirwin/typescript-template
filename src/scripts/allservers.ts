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
    ns.tprint(`[${server.hostname}]`);
    ns.killall(server.hostname);
    if (server.hostname === "home") {
      ns.exec("scripts/hacknet.js", server.hostname);
      ns.exec("scripts/autocloud.js", server.hostname, 1, "scripts");
      ns.exec(attackScript, server.hostname, 1, "n00dles");
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
