import { generateExtractableKeyPairSigner } from "gill";
import { saveKeypairSignerToFile } from "gill/node";

const main = async () => {
  for (let i = 0; i < 20; i++) {
    const keypair = await generateExtractableKeyPairSigner();
    const fileName = i < 10 ? `keys\\key0${i}.json` : `keys\\key${i}.json`;
    await saveKeypairSignerToFile(keypair, fileName);
  }
};

main();
