import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletConnectButton } from "./wallet-connect-button";
import { useWallet } from "@/contexts/WalletContext";

jest.mock("@/contexts/WalletContext", () => ({
  useWallet: jest.fn(),
}));

const mockUseWallet = useWallet as jest.Mock;

describe("WalletConnectButton", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows a Connect Wallet button when disconnected", async () => {
    const connect = jest.fn();
    mockUseWallet.mockReturnValue({
      connection: null,
      isConnecting: false,
      error: null,
      balances: null,
      connect,
      disconnect: jest.fn(),
    });

    render(<WalletConnectButton />);
    await userEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it("shows the truncated address and XLM/USDC balance when connected", () => {
    mockUseWallet.mockReturnValue({
      connection: { address: "GABCDEFGHIJKLMNOP", walletId: "freighter" },
      isConnecting: false,
      error: null,
      balances: { xlm: 120.5, usdc: 42.13 },
      connect: jest.fn(),
      disconnect: jest.fn(),
    });

    render(<WalletConnectButton />);

    expect(screen.getByText("GABC…MNOP")).toBeInTheDocument();
    expect(screen.getByText("120.5 XLM · 42.13 USDC")).toBeInTheDocument();
  });

  it("omits the USDC segment when there is no USDC trustline", () => {
    mockUseWallet.mockReturnValue({
      connection: { address: "GABCDEFGHIJKLMNOP", walletId: "freighter" },
      isConnecting: false,
      error: null,
      balances: { xlm: 10, usdc: null },
      connect: jest.fn(),
      disconnect: jest.fn(),
    });

    render(<WalletConnectButton />);

    expect(screen.getByText("10 XLM")).toBeInTheDocument();
    expect(screen.queryByText(/USDC/)).not.toBeInTheDocument();
  });

  it("disconnects when the connected button is clicked", async () => {
    const disconnect = jest.fn();
    mockUseWallet.mockReturnValue({
      connection: { address: "GABCDEFGHIJKLMNOP", walletId: "freighter" },
      isConnecting: false,
      error: null,
      balances: null,
      connect: jest.fn(),
      disconnect,
    });

    render(<WalletConnectButton />);
    await userEvent.click(screen.getByTitle(/click to disconnect/));

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("shows the connection error", () => {
    mockUseWallet.mockReturnValue({
      connection: null,
      isConnecting: false,
      error: "Failed to connect wallet",
      balances: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
    });

    render(<WalletConnectButton />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to connect wallet");
  });
});
