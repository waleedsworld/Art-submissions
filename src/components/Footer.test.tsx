import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("renders the brand name", () => {
    renderFooter();
    expect(screen.getByText("Art Submissions")).toBeInTheDocument();
  });

  it("shows the current year in the copyright line", () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`©\\s*${year}`))).toBeInTheDocument();
  });

  it("links to the primary navigation destinations", () => {
    renderFooter();
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));

    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/check");
    expect(hrefs).toContain("/api-test");
    expect(hrefs).toContain("/upload?type=handdrawn");
  });
});
