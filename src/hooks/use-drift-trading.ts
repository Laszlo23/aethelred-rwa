import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getConnection } from "@/lib/solana/transactions";
import type { DriftPlaceOrderParams } from "@/lib/solana/integrations/drift";

export function useDriftTrading() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [ready, setReady] = useState(false);
  const clientRef = useRef<unknown>(null);

  useEffect(() => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setReady(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { createDriftClient } = await import("@/lib/solana/integrations/drift");
        const conn = connection ?? getConnection();
        const driftWallet = {
          publicKey: wallet.publicKey!,
          signTransaction: wallet.signTransaction!.bind(wallet),
          signAllTransactions: wallet.signAllTransactions!.bind(wallet),
        };
        clientRef.current = await createDriftClient(conn, driftWallet);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const placeOrder = useCallback(
    async (params: DriftPlaceOrderParams): Promise<string> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Connect wallet to trade");
      }
      const { buildPlacePerpOrderTx, sendSignedTransaction } = await import(
        "@/lib/solana/integrations/drift"
      );
      const conn = connection ?? getConnection();
      const driftWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction.bind(wallet),
        signAllTransactions: wallet.signAllTransactions!.bind(wallet),
      };
      const { transaction } = await buildPlacePerpOrderTx(conn, driftWallet, params);
      const signed = await wallet.signTransaction(transaction);
      return sendSignedTransaction(conn, signed);
    },
    [connection, wallet],
  );

  return { ready, placeOrder };
}
