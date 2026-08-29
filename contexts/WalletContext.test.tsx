import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletProvider, useWallet } from "./WalletContext";
import { openWalletModal, disconnectWallet } from "@/lib/wallets-kit";
import { sep010Auth, storeToken, loadToken, clearToken } from "@/lib/sep010";
import { fetchAccountBalances } from "@/lib/balances";

jest.mock("@/lib/wallets-kit", () => ({
  openWalletModal: jest.fn(),
  disconnectWallet: jest.fn(),
}));
jest.mock("@/lib/sep010", () => ({
  sep010Auth: jest.fn(),
  storeToken: jest.fn(),
  loadToken: jest.fn(),
  clearToken: jest.fn(),
}));
jest.mock("@/lib/balances", () => ({
  fetchAccountBalances: jest.fn(),
}));

const mockOpenWalletModal = openWalletModal as jest.Mock;
const mockDisconnectWallet = disconnectWallet as jest.Mock;
const mockSep010Auth = sep010Auth as jest.Mock;
const mockLoadToken = loadToken as jest.Mock;
const mockFetchAccountBalances = fetchAccountBalances as jest.Mock;

function Probe() {
  const { connection, balances, error, connect, disconnect } = useWallet();
  return (
    <div>
      <p data-testid="address">{connection?.address ?? "none"}</p>
      <p data-testid="balances">{balances ? `${balances.xlm} XLM` : "no balances"}</p>
      <p data-testid="error">{error ?? "no error"}</p>
      <button onClick={() => void connect()}>connect</button>
      <button onClick={disconnect}>disconnect</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <WalletProvider>
      <Probe />
    </WalletProvider>,
  );
}

describe("WalletContext", () => {
  beforeEach(() => {
    mockLoadToken.mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("connects, fetches balances, and exposes the connection", async () => {
    mockOpenWalletModal.mockResolvedValue({ address: "GABC", walletId: "freighter" });
    mockSep010Auth.mockResolvedValue({ token: "jwt", expiresAt: 0, address: "GABC" });
    mockFetchAccountBalances.mockResolvedValue({ xlm: 100, usdc: 5 });

    renderProbe();
    await userEvent.click(screen.getByText("connect"));

    expect(await screen.findByText("GABC")).toBeInTheDocument();
    expect(await screen.findByText("100 XLM")).toBeInTheDocument();
  });

  it("surfaces a connect failure as an error without setting a connection", async () => {
    mockOpenWalletModal.mockRejectedValue(new Error("user closed the modal"));

    renderProbe();
    await userEvent.click(screen.getByText("connect"));

    expect(await screen.findByText("user closed the modal")).toBeInTheDocument();
    expect(screen.getByTestId("address")).toHaveTextContent("none");
  });

  it("clears the connection, token, and balances on disconnect", async () => {
    mockOpenWalletModal.mockResolvedValue({ address: "GABC", walletId: "freighter" });
    mockSep010Auth.mockResolvedValue({ token: "jwt", expiresAt: 0, address: "GABC" });
    mockFetchAccountBalances.mockResolvedValue({ xlm: 100, usdc: null });

    renderProbe();
    await userEvent.click(screen.getByText("connect"));
    await screen.findByText("GABC");

    await userEvent.click(screen.getByText("disconnect"));

    expect(screen.getByTestId("address")).toHaveTextContent("none");
    expect(screen.getByTestId("balances")).toHaveTextContent("no balances");
    expect(mockDisconnectWallet).toHaveBeenCalledTimes(1);
  });

  it("restores a persisted session and its balances on mount", async () => {
    mockLoadToken.mockReturnValue({ token: "jwt", expiresAt: 9_999_999_999, address: "GRESTORED" });
    mockFetchAccountBalances.mockResolvedValue({ xlm: 7, usdc: null });

    renderProbe();

    expect(await screen.findByText("GRESTORED")).toBeInTheDocument();
    expect(await screen.findByText("7 XLM")).toBeInTheDocument();
  });

  it("keeps the connection when a balance refresh fails, just without balances", async () => {
    mockOpenWalletModal.mockResolvedValue({ address: "GABC", walletId: "freighter" });
    mockSep010Auth.mockResolvedValue({ token: "jwt", expiresAt: 0, address: "GABC" });
    mockFetchAccountBalances.mockRejectedValue(new Error("horizon down"));

    renderProbe();
    await userEvent.click(screen.getByText("connect"));

    expect(await screen.findByText("GABC")).toBeInTheDocument();
    expect(screen.getByTestId("balances")).toHaveTextContent("no balances");
  });
});
