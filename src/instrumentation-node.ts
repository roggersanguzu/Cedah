import { setServers } from "node:dns";

export function configureMongoDns() {
  const servers = process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (!servers?.length) return;

  try {
    setServers(servers);
  } catch (error) {
    console.warn(
      "CEDAH could not apply custom MongoDB DNS resolvers",
      error instanceof Error ? error.message : "unknown error",
    );
  }
}
