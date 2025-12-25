/**
 * Universal wallet hook that supports both Rose and legacy Iris wallets
 * - Prefers Rose wallet (modern, uses EIP-6963)
 * - Falls back to Iris wallet (legacy, uses window.nockchain)
 */

import { useEffect, useMemo, useState } from 'react';
import { NockchainProvider } from '@nockchain/sdk';
import * as wasm from '@nockchain/sdk/wasm';

const WASM_INIT_KEY = '__nockchain_wasm_init_promise__';
const PROVIDER_KEY = '__nockchain_provider__';
const WALLET_TYPE_KEY = '__nockchain_wallet_type__';

function ensureWasmInitializedOnce() {
  const g = globalThis;
  const existing = g[WASM_INIT_KEY];
  if (existing && existing instanceof Promise) {
    return existing.catch((err) => {
      if (g[WASM_INIT_KEY] === existing) {
        delete g[WASM_INIT_KEY];
      }
      throw err;
    });
  }

  const p = wasm.default().catch((err) => {
    if (g[WASM_INIT_KEY] === p) {
      delete g[WASM_INIT_KEY];
    }
    throw err;
  });

  g[WASM_INIT_KEY] = p;
  return p;
}

/**
 * Detect which wallet is available (synchronous check)
 */
function detectWalletType() {
  if (typeof window === 'undefined') return null;

  // Check for Rose using EIP-6963 (synchronous)
  if (NockchainProvider.isInstalled()) {
    return 'rose';
  }

  // Check for legacy Iris via window.nockchain injection
  if (window.nockchain && typeof window.nockchain.request === 'function') {
    return 'iris';
  }

  return null;
}

async function getProviderOnce() {
  const g = globalThis;
  const existing = g[PROVIDER_KEY];
  if (existing instanceof NockchainProvider) return existing;

  // Check for Rose wallet first (preferred) - quick EIP-6963 check
  const roseFound = await NockchainProvider.waitForInstallation(500);
  if (roseFound) {
    const provider = new NockchainProvider();
    g[PROVIDER_KEY] = provider;
    g[WALLET_TYPE_KEY] = 'rose';
    return provider;
  }

  // Check for legacy Iris wallet via window.nockchain
  if (typeof window !== 'undefined' && window.nockchain && typeof window.nockchain.request === 'function') {
    // For legacy Iris, we wrap window.nockchain to match the NockchainProvider interface
    const irisProvider = createIrisProviderWrapper(window.nockchain);
    g[PROVIDER_KEY] = irisProvider;
    g[WALLET_TYPE_KEY] = 'iris';
    return irisProvider;
  }

  throw new Error('No wallet found. Please install Rose or Iris wallet.');
}

/**
 * Create a provider wrapper for legacy Iris that matches the NockchainProvider interface
 */
function createIrisProviderWrapper(nockchain) {
  const eventListeners = new Map();
  let accounts = [];

  const wrapper = {
    _accounts: accounts,
    get accounts() { return [...accounts]; },
    get isConnected() { return accounts.length > 0; },
    
    async connect() {
      const result = await nockchain.request({ method: 'nock_connect' });
      accounts = result.pkh ? [result.pkh] : [];
      return result;
    },
    
    async request(args) {
      return nockchain.request(args);
    },
    
    async signRawTx(params) {
      return this.request({
        method: 'nock_signRawTx',
        params: [params],
      });
    },
    
    on(event, listener) {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event).add(listener);
    },
    
    off(event, listener) {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    },
    
    dispose() {
      eventListeners.clear();
    },
  };

  return wrapper;
}

export function useWallet({ rpcUrl = 'https://rpc.nockbox.org' } = {}) {
  const [provider, setProvider] = useState(null);
  const [rpcClient, setRpcClient] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const options = useMemo(() => ({ rpcUrl }), [rpcUrl]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('loading');
      setError(null);

      try {
        // First do a quick synchronous check for wallet type
        const detectedType = detectWalletType();
        if (!cancelled) setWalletType(detectedType);

        const [, provider] = await Promise.all([
          ensureWasmInitializedOnce(),
          getProviderOnce(),
        ]);

        if (cancelled) return;

        // Update wallet type from the async detection
        const g = globalThis;
        const asyncType = g[WALLET_TYPE_KEY] || detectedType;
        setWalletType(asyncType);

        setProvider(provider);
        const GrpcClientCtor = wasm.GrpcClient;
        setRpcClient(GrpcClientCtor ? new GrpcClientCtor(options.rpcUrl) : null);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setStatus('error');
      }
    })();

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
    walletType,
    isReady: status === 'ready',
  };
}

