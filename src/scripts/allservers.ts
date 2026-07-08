import { NS } from "@ns";
import { getAllServerNames, startShareScript, canNuke, canCrackPorts, crackPorts, putBundle } from "./libserver.js";

export function main(ns: NS): void {
  var servers = getAllServerNames(ns);
  for (var server of servers) {
    putBundle(ns, server);
  }
  startBotNet(ns, servers);
}

export function startBotNet(ns: NS, hostnames: Array<string>): void {
  const attackScript = "scripts/AttackAnalysis.js";
  for (var hostname of hostnames) {
    var server = ns.getServer(hostname);
    ns.killall(hostname);
    ns.tprint(`${hostname}`)
    if (server.purchasedByPlayer && hostname !== "home") {
      startShareScript(ns, server.hostname);
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
    }
    var isHackable = server.hasAdminRights && server.moneyMax !== undefined && server.moneyMax > 0 && server.requiredHackingSkill !== undefined && server.requiredHackingSkill <= ns.getPlayer().skills.hacking;
    if (isHackable === true) {
      ns.exec(attackScript, "home", 1, hostname);
    }
  }
}
