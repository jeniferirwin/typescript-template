import { NS, Server } from "@ns";

export function main(ns: NS) {
    var threads = 1;
    var cores = 1;
    var growth = 0;
    if (ns.args.length > 0 && typeof(ns.args[0]) === "number") {
        threads = ns.args[0];
    }
    if (ns.args.length > 1 && typeof(ns.args[1]) === "number") {
        cores = ns.args[1];
    }
    if (ns.args.length > 2 && typeof(ns.args[2]) === "number") {
        growth = ns.args[2];
    }
    var server = ns.formulas.mockServer();
    var person = ns.formulas.mockPerson();
    /*
    var player = ns.getPlayer();
    person.city = player.city;
    person.exp = player.exp;
    person.hp = player.hp;
    person.skills = player.skills;
    person.mults = player.mults;
    */
    server.hostname = "theorycraft";
    server.cpuCores = 1;
    server.maxRam = 2;
    server.minDifficulty = 0;
    server.baseDifficulty = 0;
    server.hackDifficulty = 10;
    server.requiredHackingSkill = 1000;
    server.moneyAvailable = 10;
    server.moneyMax = 100000000;
    server.serverGrowth = growth;
    ns.tprint(`Theory Server | CPU: ${server.cpuCores} RAM: ${server.maxRam} ReqSkill: ${server.requiredHackingSkill}`);
    ns.tprint(`                Growth: ${server.serverGrowth} MinDiff: ${server.minDifficulty} BaseDiff: ${server.baseDifficulty} CurDiff: ${server.hackDifficulty}`)
    var growthCalc = ns.formulas.hacking.growAmount(server, person, threads, cores);
    ns.tprint(`Growth from ${server.moneyAvailable} money with ${cores} cores, ${threads} threads, ${growth} growth: ${growthCalc} / ${server.moneyMax}`);
}