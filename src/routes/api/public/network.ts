import { createFileRoute } from "@tanstack/react-router";
import { localNetworkIps, localNetworkPort } from "@/lib/desktopNetwork";

// Returns this PC's local Wi-Fi/LAN IPv4 address so the register can build the waiter QR code automatically.
// Only private network addresses are returned; nothing leaves the shop network.

export const Route = createFileRoute("/api/public/network")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let ips: string[] = [];
        try {
          const os = await import("node:os");
          ips = localNetworkIps(os.networkInterfaces());
        } catch { /* not running on a PC (no network access) */ }
        const port = localNetworkPort(request.url);
        return Response.json({ ips, port }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
