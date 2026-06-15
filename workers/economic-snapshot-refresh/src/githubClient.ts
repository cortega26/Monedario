export interface GitHubContentsConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  authorName: string;
  authorEmail: string;
}

interface ContentsGetResponse {
  sha: string;
  content: string;
  encoding: "base64" | "none";
}

interface ContentsPutResponse {
  commit: { sha: string; html_url?: string };
}

const API_BASE = "https://api.github.com";

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "monedario-snapshot-bot",
  };
}

function decodeBase64Utf8(input: string): string {
  const clean = input.replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface CurrentFile {
  sha: string;
  content: string;
}

export async function getCurrentFile(
  config: GitHubContentsConfig
): Promise<CurrentFile> {
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(
    config.path
  ).replace(/%2F/g, "/")}?ref=${encodeURIComponent(config.branch)}`;

  const response = await fetch(url, {
    headers: authHeaders(config.token),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub GET contents failed (${response.status}): ${body.slice(0, 200)}`
    );
  }
  const payload = (await response.json()) as ContentsGetResponse;
  if (payload.encoding !== "base64") {
    throw new Error(`Unexpected encoding from GitHub Contents API: ${payload.encoding}`);
  }
  return {
    sha: payload.sha,
    content: decodeBase64Utf8(payload.content),
  };
}

export async function putFile(
  config: GitHubContentsConfig,
  args: { content: string; sha: string; message: string }
): Promise<ContentsPutResponse> {
  const url = `${API_BASE}/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(
    config.path
  ).replace(/%2F/g, "/")}`;

  const body = {
    message: args.message,
    content: encodeBase64Utf8(args.content),
    sha: args.sha,
    branch: config.branch,
    committer: { name: config.authorName, email: config.authorEmail },
    author: { name: config.authorName, email: config.authorEmail },
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(config.token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `GitHub PUT contents failed (${response.status}): ${text.slice(0, 200)}`
    );
  }
  return (await response.json()) as ContentsPutResponse;
}
