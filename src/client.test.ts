import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TixteClient, ENDPOINTS } from "./client";

describe("TixteClient", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function ok(data: unknown) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(data),
    });
  }

  it("sends Authorization header on every request", async () => {
    mockFetch.mockReturnValue(ok({ success: true, data: {} }));

    await new TixteClient("my-api-key").accountInfo();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "my-api-key" }),
      }),
    );
  });

  it("accountInfo() calls GET /users/@me", async () => {
    const expected = { success: true, data: { username: "testuser" } };
    mockFetch.mockReturnValue(ok(expected));

    const result = await new TixteClient("key").accountInfo();

    expect(mockFetch).toHaveBeenCalledWith(
      `${ENDPOINTS.BASE_URL}${ENDPOINTS.ACCOUNT_ENDPOINT}`,
      expect.anything(),
    );
    expect(result).toEqual(expected);
  });

  it("domains() calls GET /users/@me/domains", async () => {
    const expected = {
      success: true,
      data: { domains: [{ name: "my.domain.com", owner: "user1", uploads: 5 }] },
    };
    mockFetch.mockReturnValue(ok(expected));

    const result = await new TixteClient("key").domains();

    expect(mockFetch).toHaveBeenCalledWith(
      `${ENDPOINTS.BASE_URL}${ENDPOINTS.DOMAINS_ENDPOINT}`,
      expect.anything(),
    );
    expect(result).toEqual(expected);
  });

  it("size() calls GET /users/@me/uploads/size", async () => {
    const expected = {
      success: true,
      data: { user: 1024, limit: 10240, premium_tier: 0 },
    };
    mockFetch.mockReturnValue(ok(expected));

    const result = await new TixteClient("key").size();

    expect(mockFetch).toHaveBeenCalledWith(
      `${ENDPOINTS.BASE_URL}${ENDPOINTS.SIZE_ENDPOINT}`,
      expect.anything(),
    );
    expect(result).toEqual(expected);
  });

  describe("uploadFile()", () => {
    it("throws when no domain and no defaultURL", async () => {
      await expect(
        new TixteClient("key").uploadFile(new Uint8Array([1, 2, 3])),
      ).rejects.toThrow("No domain provided and no default URL set");
    });

    it("uses defaultURL when no domain option provided", async () => {
      const expected = { success: true, data: { url: "https://example.com/file.png" } };
      mockFetch.mockReturnValue(ok(expected));

      const result = await new TixteClient("key", {
        defaultURL: "my.domain.com",
      }).uploadFile(new Uint8Array([1, 2, 3]));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(ENDPOINTS.UPLOAD_ENDPOINT),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ domain: "my.domain.com" }),
        }),
      );
      expect(result).toEqual(expected);
    });

    it("uses provided domain option over defaultURL", async () => {
      const expected = { success: true, data: { url: "https://override.com/file.png" } };
      mockFetch.mockReturnValue(ok(expected));

      const result = await new TixteClient("key", {
        defaultURL: "default.domain.com",
      }).uploadFile(new Uint8Array([1, 2, 3]), { domain: "override.domain.com" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(ENDPOINTS.UPLOAD_ENDPOINT),
        expect.objectContaining({
          headers: expect.objectContaining({ domain: "override.domain.com" }),
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  it("updateFile() calls PATCH /users/@me/uploads/:id", async () => {
    const expected = { success: true, data: { asset_id: "abc123" } };
    mockFetch.mockReturnValue(ok(expected));

    const result = await new TixteClient("key").updateFile("abc123", {
      name: "new-name",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${ENDPOINTS.BASE_URL}${ENDPOINTS.FILE_ENDPOINT}/abc123`,
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(result).toEqual(expected);
  });

  it("uploads() calls GET with page and amount query params", async () => {
    const expected = {
      success: true,
      data: { uploads: [], page: 2, total_pages: 5, total: 15 },
    };
    mockFetch.mockReturnValue(ok(expected));

    const result = await new TixteClient("key").uploads(2, 10);

    expect(mockFetch).toHaveBeenCalledWith(
      `${ENDPOINTS.BASE_URL}${ENDPOINTS.FILE_ENDPOINT}?page=2&amount=10`,
      expect.anything(),
    );
    expect(result).toEqual(expected);
  });

  it("deleteFile() calls DELETE /users/@me/uploads/:id", async () => {
    const expected = { success: true, data: { message: "File deleted" } };
    mockFetch.mockReturnValue(ok(expected));

    const result = await new TixteClient("key").deleteFile("file-id-42");

    expect(mockFetch).toHaveBeenCalledWith(
      `${ENDPOINTS.BASE_URL}${ENDPOINTS.FILE_ENDPOINT}/file-id-42`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(result).toEqual(expected);
  });

  it("throws on non-2xx response", async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({}),
      }),
    );

    await expect(new TixteClient("bad-key").accountInfo()).rejects.toThrow(
      "HTTP 401: Unauthorized",
    );
  });
});
