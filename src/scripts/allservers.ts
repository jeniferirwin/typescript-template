export function getAllServers(ns: NS) {
  // const bundle = ["scripts/cloud.ts", "scripts/allservers.ts", "scripts/AttackAnalysis.ts", "scripts/atk_grow.ts", "scripts/atk_weaken.ts", "scripts/atk_hack.ts"];
  ns.ui.clearTerminal();
  var servers = new Set<Server>();
  servers.add(ns.getServer());
  var added = true;
  while (added == true) {
    for (var server of servers) {
      added = false;
      var results = ns.scan(server.hostname);
      for (var result of results) {
        var found = ns.getServer(result);
        if (servers.has(found)) {
          ns.tprint(`Server '${result}' already exists in set, not adding`);
          continue;
        }
        ns.tprint(`Adding server '${result}' to set.`);
        added = true;
        servers.add(found);
      }
    }
  }
  for (var cloudServer of ns.cloud.getServerNames()) {
    servers.add(ns.getServer(cloudServer));
  }
}

export function putBundle(ns: NS, server: Server): boolean {
  if (server.hostname === "home") {
    ns.tprint("skipping home");
    return false;
  }
  return true;
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