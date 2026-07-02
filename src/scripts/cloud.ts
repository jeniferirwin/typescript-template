export async function main(ns: NS) {
  var gb = 2;
  var list = [];
  while (gb < 2 ** 20) {
    var cost = ns.cloud.getServerCost(gb);
    list.push([ gb, cost ]);
    gb = gb * 2; 
  }
  var options = [];
  for (var i = 0; i < list.length; i++) {
    var ram = ns.format.ram(list[i][0]);
    var money = ns.format.number(list[i][1]);
    var raw = list[i][0];
    var pct = (list[i][1] / ns.getPlayer().money * 100).toFixed(2);
    options.push(`${raw} (${ram}) - \$${money} (${pct}% of total money)`);
  }
  var servers = ns.cloud.getServerNames();
  const selectServer = await ns.prompt("Select a server to upgrade.", { type: "select", choices: servers });
  const selectUpgrade = await ns.prompt("Select an upgrade.", { type: "select", choices: options });
  const re = /^(?<baseRam>\d+) \(/g;
  const result = re.exec(selectUpgrade.toString());
  if (result !== null && result.groups !== undefined) {
    ns.cloud.upgradeServer(selectServer.toString(), parseInt(result.groups["baseRam"]));
  }
}