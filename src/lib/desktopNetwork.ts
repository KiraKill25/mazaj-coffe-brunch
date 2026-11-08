// Pure helpers shared by desktop discovery and its regression tests.
type NetworkAddress = { family: string | number; internal: boolean; address: string };
const SKIP = /(vethernet|virtual|vmware|vbox|wsl|docker|hyper-v|loopback|bluetooth|tailscale|zerotier|hamachi)/i;
const PREFER = /(wi-?fi|wlan|wireless|sans[ -]fil)/i;
const isPrivate = (ip: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);

export function localNetworkIps(interfaces: Record<string, NetworkAddress[] | undefined>): string[] {
  const found: { name: string; ip: string }[] = [];
  for (const [name, list] of Object.entries(interfaces)) {
    if (SKIP.test(name)) continue;
    for (const address of list ?? []) {
      if ((address.family === "IPv4" || address.family === 4) && !address.internal && isPrivate(address.address)) {
        found.push({ name, ip: address.address });
      }
    }
  }
  found.sort((a, b) => Number(PREFER.test(b.name)) - Number(PREFER.test(a.name)) || Number(b.ip.startsWith("192.168.")) - Number(a.ip.startsWith("192.168.")));
  return [...new Set(found.map(({ ip }) => ip))];
}

export function localNetworkPort(requestUrl: string): string {
  return new URL(requestUrl).port || "8080";
}