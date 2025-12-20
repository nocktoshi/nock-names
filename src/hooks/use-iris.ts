import { useEffect, useMemo, useState } from 'react';
import { NockchainProvider } from '@nockbox/iris-sdk';
import wasm, { GrpcClient } from '@nockbox/iris-wasm';

const IRIS_SDK_INIT_KEY = '__nockbox_iris_sdk_init_promise__';

/**
 * Initialize Iris WASM + RPC client + wallet provider once per page load.
 * Uses globalThis so React StrictMode + Vite HMR won't accidentally re-init.
 */
type IrisInit = Promise<{ provider: NockchainProvider; rpcClient: GrpcClient }>;

function initWasmModules({ rpcUrl }: { rpcUrl: string }): IrisInit {
  const g = globalThis as typeof globalThis & Record<string, unknown>;
  if (!g[IRIS_SDK_INIT_KEY]) {
    g[IRIS_SDK_INIT_KEY] = (async () => {
      await wasm();
      return {
        rpcClient: new GrpcClient(rpcUrl),
        provider: new NockchainProvider(),
      };
    })();
  }
  return g[IRIS_SDK_INIT_KEY] as IrisInit;
}

export type UseIrisStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useIris({ rpcUrl = 'https://rpc.nockbox.org' }: { rpcUrl?: string } = {}) {
  const [provider, setProvider] = useState<NockchainProvider | null>(null);
  const [rpcClient, setRpcClient] = useState<GrpcClient | null>(null);
  const [status, setStatus] = useState<UseIrisStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  // Stable options key; prevents unnecessary re-inits
  const options = useMemo(() => ({ rpcUrl }), [rpcUrl]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    initWasmModules(options)
      .then(({ provider: p, rpcClient: c }) => {
        if (cancelled) return;
        setProvider(p);
        setRpcClient(c);
        setStatus('ready');
      })
      .catch(err => {
        if (cancelled) return;
        setError(err);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [options]);

  return {
    provider,
    rpcClient,
    wasm,
    status,
    error,
    isReady: status === 'ready',
  };
}
