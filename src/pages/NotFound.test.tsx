import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "./NotFound";

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <NotFound />
    </MemoryRouter>
  );
}

describe("NotFound", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    document.title = "";
  });

  it("renders the 404 heading and gallery link", () => {
    renderAt("/missing");
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });

  it("sets the document title", () => {
    renderAt("/missing");
    expect(document.title).toBe("404 Not Found - Art Submissions");
  });

  it("logs the attempted path", () => {
    const spy = vi.spyOn(console, "error");
    renderAt("/some/bad/path");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("404 Error"),
      "/some/bad/path"
    );
  });
});
