import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { localNetworkIps, localNetworkPort } from "@/lib/desktopNetwork";

const ipv4 = (address: string) => ({ family: "IPv4", internal: false, address });

describe("desktop network discovery", () => {
  it("prioritizes French Wi-Fi over Ethernet and excludes virtual interfaces", () => {
    expect(localNetworkIps({
      Ethernet: [ipv4("192.168.1.8")],
      "Connexion réseau sans fil": [ipv4("10.0.0.9")],
      "vEthernet (WSL)": [ipv4("172.20.0.1")],
    })).toEqual(["10.0.0.9", "192.168.1.8"]);
  });

  it("supports private LAN and hotspot ranges but excludes public, loopback and IPv6 addresses", () => {
    expect(localNetworkIps({ "Wi-Fi": [
      ipv4("192.168.43.2"), ipv4("10.12.0.3"), ipv4("172.16.0.4"), ipv4("172.31.0.5"),
      ipv4("172.32.0.6"), ipv4("8.8.8.8"),
      { ...ipv4("127.0.0.1"), internal: true },
      { family: "IPv6", internal: false, address: "fe80::1" },
    ] })).toEqual(["192.168.43.2", "10.12.0.3", "172.16.0.4", "172.31.0.5"]);
  });

  it("recalculates addresses when the PC changes networks", () => {
    expect(localNetworkIps({ "Wi-Fi": [ipv4("192.168.1.2")] })).toEqual(["192.168.1.2"]);
    expect(localNetworkIps({ "Wi-Fi": [ipv4("192.168.50.7")] })).toEqual(["192.168.50.7"]);
  });

  it("uses port 8080 when the request omits its port", () => {
    expect(localNetworkPort("http://localhost/api/public/network")).toBe("8080");
  });

  it("preserves an explicit request port", () => {
    expect(localNetworkPort("http://localhost:9090/api/public/network")).toBe("9090");
  });

  it("allows all Windows profiles only for local-subnet TCP 8080 and replaces the previous rule", () => {
    const installer = readFileSync("windows/Mazaj-Setup.iss", "utf8");
    const run = installer.split("[Run]")[1]?.split("[UninstallRun]")[0] ?? "";
    expect(run).toContain("profile=any protocol=TCP localport=8080 remoteip=LocalSubnet");
    expect(run.indexOf("firewall delete rule")).toBeGreaterThanOrEqual(0);
    expect(run.indexOf("firewall delete rule")).toBeLessThan(run.indexOf("firewall add rule"));
  });
});