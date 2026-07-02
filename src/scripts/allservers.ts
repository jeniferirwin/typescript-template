import { NS, Server } from "@ns";

export function main(ns: NS): void {
  var servers = getAllServers(ns);
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
  return true;
}