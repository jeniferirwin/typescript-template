import {NS, Server} from "@ns";


export class AttackAnalysis {
  ns: NS;
  attacker_hostname!: string;
  target_hostname!: string;
  attacker!: Server;
  target!: Server;
  weaken_script!: string;
  grow_script!: string;
  hack_script!: string;

  constructor(ns: NS, target_hostname: string = ns.getHostname(), attacker_hostname: string = ns.getHostname(), weaken_script: string = "scripts/atk_weaken.js", grow_script: string = "scripts/atk_grow.js", hack_script: string = "scripts/atk_hack.js") {
    this.ns = ns;
    this.target_hostname = target_hostname;
    this.attacker_hostname = attacker_hostname;
    this.weaken_script = weaken_script;
    this.grow_script = grow_script;
    this.hack_script = hack_script;
    
    const servers = [this.attacker_hostname, this.target_hostname];
    for (var hn of servers) {
      if (!this.ns.serverExists(hn)) {
        throw new Error(`[AnalysisData] Server does not exist: ${hn}`);
      }
    }

    const scripts = [this.weaken_script, this.grow_script, this.hack_script];
    for (var fn of scripts) {
      if (!this.ns.fileExists(fn, this.attacker_hostname)) {
        throw new Error((`[${this.attacker_hostname}] Script missing: ${fn}`));
      }
    }

    this.attacker = this.ns.getServer(this.attacker_hostname);
    this.target = this.ns.getServer(this.target_hostname);
  }

  getMoneyPercent() {
    var available = this.ns.getServerMoneyAvailable(this.target.hostname);
    var max = this.ns.getServerMaxMoney(this.target.hostname);
    // this.ns.tprint(`[${this.target.hostname}] Money: ${available} of ${max}`);
    return available / max * 100;
  }

  getSecurityDiff() {
    return this.ns.getServerSecurityLevel(this.target.hostname) - this.ns.getServerMinSecurityLevel(this.target.hostname);
  }

  getWeakenThreadCount() {
    var diff = this.getSecurityDiff();
    if (diff < 0) {
      return(0);
    }
    var ram_needed = this.ns.getScriptRam(this.weaken_script, this.attacker.hostname);
    var ram_avail = this.ns.getServerMaxRam(this.attacker.hostname) - this.ns.getServerUsedRam(this.attacker.hostname);
    var maxThreads = Math.floor(ram_avail / ram_needed);
    if (diff < maxThreads * 0.05) {
      return Math.ceil(diff / 0.05);
    }
    return maxThreads;
  }

  getGrowThreadCount() {
    var multNeeded = this.ns.getServerMaxMoney(this.target.hostname) / this.ns.getServerMoneyAvailable(this.target.hostname);
    var threads = Math.ceil(this.ns.growthAnalyze(this.target.hostname, multNeeded));
    var ram_needed = this.ns.getScriptRam(this.grow_script, this.attacker.hostname);
    var ram_avail = this.ns.getServerMaxRam(this.attacker.hostname) - this.ns.getServerUsedRam(this.attacker.hostname);
    var maxThreads = Math.floor(ram_avail / ram_needed);
    if (threads < maxThreads) {
      return threads;
    } else {
      return maxThreads;
    }
  }

  getHackThreadCount() {
    var ram_needed = this.ns.getScriptRam(this.hack_script, this.attacker.hostname);
    var ram_avail = this.ns.getServerMaxRam(this.attacker.hostname) - this.ns.getServerUsedRam(this.attacker.hostname);
    var maxThreads = Math.floor(ram_avail / ram_needed);
    var part = this.ns.hackAnalyze(this.target.hostname);
    var cap = Math.floor(0.5 / part);
    // this.ns.tprint(`Part: ${part} Max threads in RAM: ${maxThreads} Capped: ${cap}`);
    if (cap < maxThreads) {
      return(cap);
    } else {
      return(maxThreads);
    }
  }

  getNextMove() {
    var diff = this.getSecurityDiff();
    var pct = this.getMoneyPercent();
    var growTime = this.ns.getGrowTime(this.target.hostname);
    var weakenTime = this.ns.getWeakenTime(this.target.hostname);
    // this.ns.tprint(`[${this.target.hostname}] Diff: ${diff} Pct: ${pct} Grow: ${growTime} Weaken: ${weakenTime}`);
    if (diff > 1) {
      return("weaken");
    }
    if (pct < 55) {
      return("grow");
    }
    if (this.ns.getHackingLevel() >= this.ns.getServerRequiredHackingLevel(this.target.hostname)) {
      return("hack");
    }
    return("wait");
  }
}

export async function main(ns: NS, target: string = ns.getHostname(), attacker: string = ns.getHostname()) {
  if (ns.args.length > 0) {
    target = ns.args[0].toString();
  }
  var controller = new AttackAnalysis(ns, target, attacker);
  var pid;
  while (true) {
    if (pid && ns.isRunning(pid)) {
      await ns.sleep(1000);
      continue;
    }
    switch (controller.getNextMove()) {
      case "weaken":
        pid = ns.run(controller.weaken_script, controller.getWeakenThreadCount(), target);
        break;
      case "grow":
        pid = ns.run(controller.grow_script, controller.getGrowThreadCount(), target);
        break;
      case "hack":
        pid = ns.run(controller.hack_script, controller.getHackThreadCount(), target);
        break;
      case "wait":
        await ns.sleep(10000);
    }
    await ns.sleep(1000);
  }
}