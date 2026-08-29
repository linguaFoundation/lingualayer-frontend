import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NetworkMismatchModal } from "./network-mismatch-modal";
import { useWallet } from "@/contexts/WalletContext";
import * as freighter from "@stellar/freighter-api";

jest.mock("@/contexts/WalletContext", () => ({
  useWallet: jest.fn(),
}));
jest.mock("@stellar/freighter-api", () => ({
  getNetwork: jest.fn(),
}));
jest.mock("@/lib/stellar-network", () => ({
  stellarNetworkConfig: { network: "testnet" },
}));

const mockUseWallet = useWallet as jest.Mock;
const mockGetNetwork = freighter.getNetwork as jest.Mock;

describe("NetworkMismatchModal", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders nothing when no wallet is connected", () => {
    mockUseWallet.mockReturnValue({ connection: null });
    render(<NetworkMismatchModal />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("renders nothing when the wallet's network matches the app's", async () => {
    mockUseWallet.mockReturnValue({ connection: { address: "GABC" } });
    mockGetNetwork.mockResolvedValue({ network: "TESTNET", error: undefined });

    render(<NetworkMismatchModal />);

    // Give the dynamic import + getNetwork() promise chain a tick to settle.
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("warns when the wallet is on a different network, and can be dismissed", async () => {
    mockUseWallet.mockReturnValue({ connection: { address: "GABC" } });
    mockGetNetwork.mockResolvedValue({ network: "PUBLIC", error: undefined });

    render(<NetworkMismatchModal />);

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/mainnet/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
