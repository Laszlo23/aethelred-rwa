import { runIndexerCycle } from "../src/workers/chain-indexer";

runIndexerCycle()
  .then(() => {
    console.log("Indexer cycle complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
