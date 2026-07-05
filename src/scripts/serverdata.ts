import {NS} from "@ns";
import { getAllServers } from "./libserver";

export function main(ns: NS) {
    var servers = getAllServers(ns);
    for (var server of servers.values()) {
        var admin = server.hasAdminRights;
        var hackSkill = server.requiredHackingSkill;
        var money = server.moneyMax;
        var ports = server.numOpenPortsRequired;
        var ram = server.maxRam;
        var hackTime = Math.ceil(ns.getHackTime(server.hostname) / 1000 / 60);
        var growTime = Math.ceil(ns.getGrowTime(server.hostname) / 1000 / 60);
        var weakenTime = Math.ceil(ns.getWeakenTime(server.hostname) / 1000 / 60);
        if (money !== undefined && money > 0 && hackSkill !== undefined && ns.getPlayer().skills.hacking >= hackSkill) {
            ns.tprint(`[${server.hostname}] ADMIN: ${admin} SKILL: ${hackSkill} MONEY: ${ns.format.number(money)} RAM: ${ram} REQPORTS: ${ports} WEAKEN: ${weakenTime} GROW: ${growTime} HACK: ${hackTime}`);
        }
    }
}