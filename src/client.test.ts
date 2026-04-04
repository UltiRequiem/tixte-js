import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockInstance } from "vitest";

vi.mock("axios");

describe("TixteClient", () => {
  let mockGet: MockInstance;
  let mockPost: MockInstance;
  let mockPatch: MockInstance;
  let mockDelete: MockInstance;
  let mockCreate: MockInstance;

  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();

    const axios = await import("axios");
    const axiosMock = vi.mocked(axios.default);

    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPatch = vi.fn();
    mockDelete = vi.fn();

    const instance = {
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      defaults: { headers: { common: {} as Record<string, string> } },
    };

    mockCreate = vi.fn().mockReturnValue(instance);
    axiosMock.create = mockCreate;
  });

  async function makeClient(options?: { defaultURL?: string }) {
    const { TixteClient } = await import("./client");
    return new TixteClient("test-api-key", options);
  }

  it("constructor sets Authorization header", async () => {
    const axios = await import("axios");
    const instance = {
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      defaults: { headers: { common: {} as Record<string, string> } },
    };
    vi.mocked(axios.default).create = vi.fn().mockReturnValue(instance);

    const { TixteClient } = await import("./client");
    new TixteClient("my-secret-key");

    expect(instance.defaults.headers.common["Authorization"]).toBe(
      "my-secret-key",
    );
  });

  it("accountInfo() calls GET /users/@me", async () => {
    const expected = { success: true, data: { username: "testuser" } };
    mockGet.mockResolvedValue({ data: expected });

    const client = await makeClient();
    const result = await client.accountInfo();

    expect(mockGet).toHaveBeenCalledWith("/users/@me");
    expect(result).toEqual(expected);
  });

  it("domains() calls GET /users/@me/domains", async () => {
    const expected = {
      success: true,
      data: { domains: [{ name: "my.domain.com", owner: "user1", uploads: 5 }] },
    };
    mockGet.mockResolvedValue({ data: expected });

    const client = await makeClient();
    const result = await client.domains();

    expect(mockGet).toHaveBeenCalledWith("/users/@me/domains");
    expect(result).toEqual(expected);
  });

  it("size() calls GET /users/@me/uploads/size", async () => {
    const expected = {
      success: true,
      data: { user: 1024, limit: 10240, premium_tier: 0 },
    };
    mockGet.mockResolvedValue({ data: expected });

    const client = await makeClient();
    const result = await client.size();

    expect(mockGet).toHaveBeenCalledWith("/users/@me/uploads/size");
    expect(result).toEqual(expected);
  });

  describe("uploadFile()", () => {
    it("throws when no domain and no defaultURL", async () => {
      const client = await makeClient();
      await expect(
        client.uploadFile(new Uint8Array([1, 2, 3])),
      ).rejects.toThrow("No domain provided and no default URL set");
    });

    it("uses defaultURL when no domain option provided", async () => {
      const expected = {
        success: true,
        data: { url: "https://example.com/file.png" },
      };
      mockPost.mockResolvedValue({ data: expected });

      const client = await makeClient({ defaultURL: "my.domain.com" });
      const result = await client.uploadFile(Buffer.from([1, 2, 3]));

      expect(mockPost).toHaveBeenCalledWith(
        "/upload",
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({ domain: "my.domain.com" }),
        }),
      );
      expect(result).toEqual(expected);
    });

    it("uses provided domain option over defaultURL", async () => {
      const expected = {
        success: true,
        data: { url: "https://override.com/file.png" },
      };
      mockPost.mockResolvedValue({ data: expected });

      const client = await makeClient({ defaultURL: "default.domain.com" });
      const result = await client.uploadFile(Buffer.from([1, 2, 3]), {
        domain: "override.domain.com",
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/upload",
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({ domain: "override.domain.com" }),
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  it("updateFile() calls PATCH /users/@me/uploads/:id", async () => {
    const expected = { success: true, data: { asset_id: "abc123" } };
    mockPatch.mockResolvedValue({ data: expected });

    const client = await makeClient();
    const result = await client.updateFile("abc123", { name: "new-name" });

    expect(mockPatch).toHaveBeenCalledWith("/users/@me/uploads/abc123", {
      name: "new-name",
    });
    expect(result).toEqual(expected);
  });

  it("uploads() calls GET with page and amount query params", async () => {
    const expected = {
      success: true,
      data: { uploads: [], page: 2, total_pages: 5, total: 15 },
    };
    mockGet.mockResolvedValue({ data: expected });

    const client = await makeClient();
    const result = await client.uploads(2, 10);

    expect(mockGet).toHaveBeenCalledWith(
      "/users/@me/uploads?page=2&amount=10",
    );
    expect(result).toEqual(expected);
  });

  it("deleteFile() calls DELETE /users/@me/uploads/:id", async () => {
    const expected = { success: true, data: { message: "File deleted" } };
    mockDelete.mockResolvedValue({ data: expected });

    const client = await makeClient();
    const result = await client.deleteFile("file-id-42");

    expect(mockDelete).toHaveBeenCalledWith("/users/@me/uploads/file-id-42");
    expect(result).toEqual(expected);
  });
});
