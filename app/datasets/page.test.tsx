import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatasetsPage from "./page";

const YORUBA = {
  dataset_id: "1",
  name: "Yoruba Proverbs",
  description: "Oral proverbs collected from native speakers.",
  language_code: "yor",
  owner: "G...A",
  sample_count: 500, // small
  contributor_count: 12,
  license_offers: [{ type: "research", priceUsd: 0 }],
  license_count: 3,
  created_at: "2026-01-01T00:00:00.000Z",
};

const HAUSA = {
  dataset_id: "2",
  name: "Hausa News Corpus",
  description: "Transcribed radio news segments.",
  language_code: "hau",
  owner: "G...B",
  sample_count: 1200, // medium
  contributor_count: 40,
  license_offers: [
    { type: "research", priceUsd: 0 },
    { type: "commercial", priceUsd: 10 },
  ],
  license_count: 9,
  created_at: "2026-03-01T00:00:00.000Z",
};

const DATASETS = [YORUBA, HAUSA];

function mockFetchOnce(body: unknown) {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ json: () => Promise.resolve(body) }) as jest.Mock;
}

describe("DatasetsPage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows skeleton loaders, then renders fetched datasets", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    const { container } = render(<DatasetsPage />);

    expect(container.querySelectorAll(".skeleton-card").length).toBeGreaterThan(0);
    expect(await screen.findByText("Yoruba Proverbs")).toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();
  });

  it("renders the no-filters empty state when nothing comes back", async () => {
    mockFetchOnce({ datasets: [], next_cursor: null });
    render(<DatasetsPage />);

    expect(await screen.findByText("No datasets yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse bounties" })).toHaveAttribute("href", "/bounties");
  });

  it("falls back to an empty datasets array if the fetch rejects", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as jest.Mock;
    render(<DatasetsPage />);

    expect(await screen.findByText("No datasets yet")).toBeInTheDocument();
  });

  it("filters by search query across name and description, and clears", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.type(screen.getByLabelText(/search datasets by name/i), "radio");

    expect(screen.queryByText("Yoruba Proverbs")).not.toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/search datasets by name/i));
    await userEvent.type(screen.getByLabelText(/search datasets by name/i), "corpus xyz");
    expect(await screen.findByText("No datasets match your filters")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("Yoruba Proverbs")).toBeInTheDocument();
  });

  it("filters by language", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.selectOptions(screen.getByLabelText(/^filter datasets by language$/i), "hau");

    expect(screen.queryByText("Yoruba Proverbs")).not.toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();
  });

  it("filters by language family", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.selectOptions(
      screen.getByLabelText(/filter datasets by language family/i),
      "Afro-Asiatic",
    );

    expect(screen.queryByText("Yoruba Proverbs")).not.toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();
  });

  it("filters by license type", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.selectOptions(
      screen.getByLabelText(/filter datasets by license type/i),
      "commercial",
    );

    expect(screen.queryByText("Yoruba Proverbs")).not.toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();
  });

  it("filters by dataset size", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.selectOptions(screen.getByLabelText(/filter datasets by size/i), "small");

    expect(screen.getByText("Yoruba Proverbs")).toBeInTheDocument();
    expect(screen.queryByText("Hausa News Corpus")).not.toBeInTheDocument();
  });

  it("sorts by price, low to high", async () => {
    mockFetchOnce({ datasets: DATASETS, next_cursor: null });
    const { container } = render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.selectOptions(screen.getByLabelText(/sort datasets/i), "price_asc");

    const titles = Array.from(container.querySelectorAll(".card h3")).map((el) => el.textContent);
    // Yoruba has no paid offer (price 0) and sorts before Hausa's $10 commercial offer.
    expect(titles).toEqual(["Yoruba Proverbs", "Hausa News Corpus"]);
  });

  it("loads the next page via the Load more button and stops once exhausted", async () => {
    const THIRD = { ...HAUSA, dataset_id: "3", name: "Zulu Folktales", language_code: "zul" };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ datasets: DATASETS, next_cursor: "page-2" }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ datasets: [THIRD], next_cursor: null }),
      }) as jest.Mock;

    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    const loadMoreButton = screen.getByRole("button", { name: "Load more" });
    await userEvent.click(loadMoreButton);

    expect(await screen.findByText("Zulu Folktales")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const secondCallUrl = (global.fetch as jest.Mock).mock.calls[1][0] as string;
    expect(secondCallUrl).toContain("cursor=page-2");
  });
});
