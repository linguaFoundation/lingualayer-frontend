import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalletGuard } from "./wallet-guard";
import { useWallet } from "@/contexts/WalletContext";

jest.mock("@/contexts/WalletContext", () => ({
  useWallet: jest.fn(),
}));

const mockUseWallet = useWallet as jest.Mock;

describe("WalletGuard", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the connect prompt instead of children when no wallet is connected", async () => {
    const connect = jest.fn();
    mockUseWallet.mockReturnValue({
      connection: null,
      isConnecting: false,
      error: null,
      connect,
    });

    render(
      <WalletGuard message="Connect to purchase a license.">
        <p>Protected content</p>
      </WalletGuard>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Connect to purchase a license.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it("uses a default message when none is given", () => {
    mockUseWallet.mockReturnValue({ connection: null, isConnecting: false, error: null, connect: jest.fn() });

    render(
      <WalletGuard>
        <p>Protected content</p>
      </WalletGuard>,
    );

    expect(screen.getByText("Connect a wallet to continue.")).toBeInTheDocument();
  });

  it("renders children once a wallet is connected", () => {
    mockUseWallet.mockReturnValue({
      connection: { address: "GABC", walletId: "freighter" },
      isConnecting: false,
      error: null,
      connect: jest.fn(),
    });

    render(
      <WalletGuard>
        <p>Protected content</p>
      </WalletGuard>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Wallet" })).not.toBeInTheDocument();
  });

  it("shows a connection error inline", () => {
    mockUseWallet.mockReturnValue({
      connection: null,
      isConnecting: false,
      error: "Failed to connect wallet",
      connect: jest.fn(),
    });

    render(
      <WalletGuard>
        <p>Protected content</p>
      </WalletGuard>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to connect wallet");
  });
});
