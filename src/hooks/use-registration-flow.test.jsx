import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useRegistrationFlow } from "./use-registration-flow";

const mockPostRegister = vi.fn();

vi.mock("@/api", () => ({
  postRegister: (...args) => mockPostRegister(...args),
}));

const buildWasmMock = () => {
  class TxBuilder {
    constructor() {}
    simpleSpend() {}
    build() {
      return {
        id: { value: "tx123" },
        toRawTx: () => ({
          toProtobuf: () => "raw-tx",
        }),
      };
    }
    allNotes() {
      return { notes: ["note1"], spendConditions: ["sc1"] };
    }
  }

  class Digest {
    constructor(value) {
      this.value = value;
    }
  }

  return {
    Pkh: {
      single: (addr) => ({ value: addr }),
    },
    SpendCondition: {
      newPkh: (pkh) => ({
        value: `sc-${pkh.value}`,
        firstName: () => ({ value: pkh.value }),
      }),
    },
    Note: {
      fromProtobuf: (note) => ({
        value: note,
        assets: BigInt(1_000_000),
      }),
    },
    TxBuilder,
    Digest,
  };
};

describe("useRegistrationFlow", () => {
  const provider = {
    signRawTx: vi.fn(async () => "signed"),
  };
  const rpcClient = {
    getBalanceByFirstName: vi.fn(async () => ({
      notes: [{ note: "note" }],
    })),
    sendTransaction: vi.fn(async () => ({ ok: true })),
  };
  const wasm = buildWasmMock();

  beforeEach(() => {
    mockPostRegister.mockReset();
    provider.signRawTx.mockClear();
    rpcClient.getBalanceByFirstName.mockClear();
    rpcClient.sendTransaction.mockClear();
  });

  it("fails validation when name is invalid", async () => {
    const { result } = renderHook(() =>
      useRegistrationFlow({ provider, rpcClient, wasm })
    );

    await act(async () => {
      await result.current.registerDomain("BadName", "addr");
    });

    expect(result.current.status).toBe("failed");
    expect(result.current.statusText).toContain("alphanumeric lowercase");
  });

  it("fails when address is missing", async () => {
    const { result } = renderHook(() =>
      useRegistrationFlow({ provider, rpcClient, wasm })
    );

    await act(async () => {
      await result.current.registerDomain("good.nock", null);
    });

    expect(result.current.status).toBe("failed");
    expect(result.current.statusText).toContain("connect your wallet");
  });

  it("sets pending status after successful send", async () => {
    mockPostRegister.mockResolvedValue({ key: "pending:good.nock" });

    const { result } = renderHook(() =>
      useRegistrationFlow({ provider, rpcClient, wasm })
    );

    await act(async () => {
      await result.current.registerDomain("good.nock", "addr123");
    });

    expect(mockPostRegister).toHaveBeenCalledWith("good.nock", "addr123");
    expect(result.current.status).toBe("pending");
    expect(result.current.transactionHash).toBe("tx123");
  });
});

