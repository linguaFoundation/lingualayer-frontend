import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatasetDetail } from "./dataset-detail";
import { useWallet } from "@/contexts/WalletContext";
import { signTransaction } from "@/lib/wallets-kit";
import { pollTransactionStatus } from "@/lib/tx-status";

jest.mock("@/contexts/WalletContext", () => ({
  useWallet: jest.fn(),
}));
jest.mock("@/lib/wallets-kit", () => ({
  signTransaction: jest.fn(),
}));
jest.mock("@/lib/tx-status", () => {
  const actual = jest.requireActual("@/lib/tx-status");
  return { ...actual, pollTransactionStatus: jest.fn() };
});

const mockUseWallet = useWallet as jest.Mock;
const mockSignTransaction = signTransaction as jest.Mock;
const mockPollTransactionStatus = pollTransactionStatus as jest.Mock;

const DATASET = {
  dataset_id: "ds-1",
  name: "Yoruba Proverbs",
  language_code: "yor",
  version: "2.1",
  state: "active",
  description: "Oral proverbs collected from native speakers.",
  sample_count: 500,
  hours_of_audio: 12.5,
  collection_method: "Field recordings, community-submitted",
  owner: "GABC...OWNER",
  contributors: [
    { address: "GAAA1111AAAA1111AAAA1111AAAA1111AAAA1111AAAA1111AAAA", share_bps: 6000 },
    { address: "GBBB2222BBBB2222BBBB2222BBBB2222BBBB2222BBBB2222BBBB", share_bps: 4000 },
  ],
};

const QUALITY = { tier: "Gold", score: 82, multiplier: 1.2, curator_count: 5 };

function mockFetch() {
  global.fetch = jest.fn((url: unknown, init?: RequestInit) => {
    const u = String(url);
    const method = init?.method ?? "GET";
    if (u.endsWith("/quality")) {
      return Promise.resolve({ json: () => Promise.resolve(QUALITY) });
    }
    if (u.includes("/tx/prepare/issue-license") && method === "POST") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ xdr: "unsigned-xdr" }),
      });
    }
    if (u.includes("/tx/submit") && method === "POST") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            hash: "tx-hash-abc",
            license_id: "lic-1",
            expires_at: new Date(Date.now() + 86_400_000).toISOString(),
          }),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve(DATASET) });
  }) as jest.Mock;
}

function renderPage() {
  return render(<DatasetDetail id="ds-1" />);
}

describe("DatasetDetailPage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders header badges, metadata, and contributor shares from basis points", async () => {
    mockFetch();
    mockUseWallet.mockReturnValue({ connection: null, connect: jest.fn() });
    renderPage();

    expect(await screen.findByText("Yoruba Proverbs")).toBeInTheDocument();
    expect(screen.getByLabelText("Version 2.1")).toHaveTextContent("v2.1");
    expect(screen.getByLabelText("State: active")).toHaveTextContent("active");

    expect(screen.getByText(DATASET.description)).toBeInTheDocument();
    expect(screen.getByText("12.5h")).toBeInTheDocument();
    expect(screen.getByText(DATASET.collection_method)).toBeInTheDocument();

    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("renders all three license options with correct pricing", async () => {
    mockFetch();
    mockUseWallet.mockReturnValue({ connection: null, connect: jest.fn() });
    renderPage();
    await screen.findByText("Yoruba Proverbs");

    expect(screen.getByText("Research")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("NonProfit")).toBeInTheDocument();
    expect(screen.getByText("$0.10")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("prompts a wallet connection instead of purchasing when no wallet is connected", async () => {
    mockFetch();
    const connect = jest.fn();
    mockUseWallet.mockReturnValue({ connection: null, connect });
    renderPage();
    await screen.findByText("Yoruba Proverbs");

    const button = screen.getByRole("button", { name: "Connect wallet to purchase" });
    await userEvent.click(button);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("completes the full purchase flow: prepare → sign → submit → confirm → success with expiry countdown", async () => {
    mockFetch();
    mockUseWallet.mockReturnValue({
      connection: { address: "GBUYER...", walletId: "freighter" },
      connect: jest.fn(),
    });
    mockSignTransaction.mockResolvedValue("signed-xdr");
    mockPollTransactionStatus.mockResolvedValue({ status: "confirmed", hash: "tx-hash-abc", ledger: 42 });

    renderPage();
    await screen.findByText("Yoruba Proverbs");

    await userEvent.click(screen.getByRole("button", { name: /Purchase Research License/ }));

    expect(await screen.findByText(/License purchased — ID lic-1/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view transaction on stellar\.expert/i })).toHaveAttribute(
      "href",
      expect.stringContaining("tx-hash-abc"),
    );
    // CountdownTimer renders an expiry string once expiresAt is set.
    expect(screen.getByText(/remaining|expires in/i)).toBeInTheDocument();

    expect(mockSignTransaction).toHaveBeenCalledWith("unsigned-xdr", "GBUYER...");
  });

  it("shows a friendly message when the wallet rejects the signature request", async () => {
    mockFetch();
    mockUseWallet.mockReturnValue({
      connection: { address: "GBUYER...", walletId: "freighter" },
      connect: jest.fn(),
    });
    mockSignTransaction.mockRejectedValue(new Error("User declined access"));

    renderPage();
    await screen.findByText("Yoruba Proverbs");

    await userEvent.click(screen.getByRole("button", { name: /Purchase Research License/ }));

    expect(await screen.findByText("You declined the transaction in your wallet.")).toBeInTheDocument();
  });

  it("surfaces a failed on-chain result instead of silently succeeding", async () => {
    mockFetch();
    mockUseWallet.mockReturnValue({
      connection: { address: "GBUYER...", walletId: "freighter" },
      connect: jest.fn(),
    });
    mockSignTransaction.mockResolvedValue("signed-xdr");
    mockPollTransactionStatus.mockResolvedValue({
      status: "failed",
      hash: "tx-hash-abc",
      errorMessage: "Source account balance is too low to cover the fee and operations.",
    });

    renderPage();
    await screen.findByText("Yoruba Proverbs");

    await userEvent.click(screen.getByRole("button", { name: /Purchase Research License/ }));

    expect(
      await screen.findByText("Source account balance is too low to cover the fee and operations."),
    ).toBeInTheDocument();
  });
});
