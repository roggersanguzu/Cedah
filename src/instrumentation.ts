export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { configureMongoDns } = await import("./instrumentation-node");
    configureMongoDns();
  }
}
