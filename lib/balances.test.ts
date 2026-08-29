import { fetchAccountBalances } from "./balances";

function mockFetchOnce(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: "mock",
    json: () => Promise.resolve(body),
  }) as jest.Mock;
}

describe("fetchAccountBalances", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the native balance and USDC trustline balance when both exist", async () => {
    mockFetchOnce(200, {
      balances: [
        { asset_type: "native", balance: "120.5000000" },
        { asset_type: "credit_alphanum4", asset_code: "USDC", balance: "42.1300000" },
        { asset_type: "credit_alphanum4", asset_code: "EURC", balance: "9.0000000" },
      ],
    });

    const result = await fetchAccountBalances("GABC");
    expect(result).toEqual({ xlm: 120.5, usdc: 42.13 });
  });

  it("reports usdc as null when there is no USDC trustline", async () => {
    mockFetchOnce(200, {
      balances: [{ asset_type: "native", balance: "5.0000000" }],
    });

    const result = await fetchAccountBalances("GABC");
    expect(result).toEqual({ xlm: 5, usdc: null });
  });

  it("treats an unfunded account (404) as zero balances rather than an error", async () => {
    mockFetchOnce(404, {});

    const result = await fetchAccountBalances("GABC");
    expect(result).toEqual({ xlm: 0, usdc: null });
  });

  it("throws for a non-404 error response", async () => {
    mockFetchOnce(500, {});

    await expect(fetchAccountBalances("GABC")).rejects.toThrow(/500/);
  });
});
