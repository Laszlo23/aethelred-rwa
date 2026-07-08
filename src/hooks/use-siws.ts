import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useState } from "react";
import bs58 from "bs58";
import { getAuthChallenge, verifyAuth } from "@/api/auth";

export function useSiwsSignIn() {
  const { publicKey, signMessage } = useWallet();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error("Connect a wallet that supports message signing");
    }
    setIsSigningIn(true);
    try {
      const wallet = publicKey.toBase58();
      const { message } = await getAuthChallenge({ data: { walletAddress: wallet } });
      const encoded = new TextEncoder().encode(message);
      const signature = await signMessage(encoded);
      await verifyAuth({
        data: {
          walletAddress: wallet,
          message,
          signature: bs58.encode(signature),
        },
      });
      setIsAuthenticated(true);
      return true;
    } finally {
      setIsSigningIn(false);
    }
  }, [publicKey, signMessage]);

  return { signIn, isSigningIn, isAuthenticated, wallet: publicKey?.toBase58() };
}
