import { describe, it, expect, vi, beforeEach } from "vitest";

// Shared mock instance returned by axios.create(). Created via vi.hoisted so it
// is initialized before the hoisted vi.mock factory references it.
const mockInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  interceptors: {
    response: { use: vi.fn() },
  },
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}));

// Imported after the mock is registered.
import { api } from "./api";

describe("api.getImageById", () => {
  it("builds an absolute image URL from an id", () => {
    expect(api.getImageById("abc123")).toBe(
      "https://imageprocessing.applytocollege.pk/image/abc123"
    );
  });

  it("interpolates the id verbatim", () => {
    expect(api.getImageById("42")).toContain("/image/42");
  });
});

describe("api async methods", () => {
  beforeEach(() => {
    mockInstance.get.mockReset();
    mockInstance.post.mockReset();
    mockInstance.put.mockReset();
  });

  it("uploadImage posts form data to /upload and returns response data", async () => {
    mockInstance.post.mockResolvedValue({ data: { id: "new-id" } });
    const fd = new FormData();
    fd.append("file", "x");

    const result = await api.uploadImage(fd);

    expect(mockInstance.post).toHaveBeenCalledWith(
      "/upload",
      fd,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "multipart/form-data",
        }),
      })
    );
    expect(result).toEqual({ id: "new-id" });
  });

  it("getUnmarkedImage requests /unmarked", async () => {
    mockInstance.get.mockResolvedValue({ data: { id: "u1" } });

    const result = await api.getUnmarkedImage();

    expect(mockInstance.get).toHaveBeenCalledWith("/unmarked");
    expect(result).toEqual({ id: "u1" });
  });

  it("markImage puts the marking flag to /mark/:id", async () => {
    mockInstance.put.mockResolvedValue({ data: { ok: true } });

    const result = await api.markImage("id-9", true);

    expect(mockInstance.put).toHaveBeenCalledWith("/mark/id-9", {
      marking: true,
    });
    expect(result).toEqual({ ok: true });
  });

  it("getImages passes the marking param when provided", async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: "1" }] });

    const result = await api.getImages("true");

    expect(mockInstance.get).toHaveBeenCalledWith("/images", {
      params: { marking: "true" },
    });
    expect(result).toEqual([{ id: "1" }]);
  });

  it("getImages omits params when no marking is given", async () => {
    mockInstance.get.mockResolvedValue({ data: [] });

    await api.getImages();

    expect(mockInstance.get).toHaveBeenCalledWith("/images", {
      params: undefined,
    });
  });

  it("getImages returns an empty array when the API does not return an array", async () => {
    mockInstance.get.mockResolvedValue({ data: { unexpected: true } });

    const result = await api.getImages();

    expect(result).toEqual([]);
  });

  it("getImages rethrows on request failure", async () => {
    mockInstance.get.mockRejectedValue(new Error("network down"));

    await expect(api.getImages()).rejects.toThrow("network down");
  });
});
