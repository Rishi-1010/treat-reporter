const repo = process.env.GITHUB_REPO || "Rishi-1010/treat-reporter";
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN;
const path = "deal-state.json";

function json(response, status, payload) {
  response.status(status);
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.json(payload);
}

async function githubRequest(url, options = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "treat-reporter"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers: { ...headers, ...options.headers } });
}

async function readState() {
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}&ts=${Date.now()}`;
  const response = await githubRequest(url);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub read failed: ${response.status}`);
  }

  const file = await response.json();
  return {
    sha: file.sha,
    state: JSON.parse(Buffer.from(file.content, "base64").toString("utf8"))
  };
}

async function writeState(payload) {
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await readState();

    const response = await githubRequest(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Update shared treat state (${payload.monthKey})`,
        content: Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, "utf8").toString("base64"),
        branch,
        ...(current ? { sha: current.sha } : {})
      })
    });

    if (response.ok) {
      return payload;
    }

    if (response.status !== 409 && response.status !== 422) {
      throw new Error(`GitHub write failed: ${response.status}`);
    }
  }

  throw new Error("GitHub write conflict after retries");
}

module.exports = async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  try {
    if (request.method === "GET") {
      const result = await readState();
      json(response, 200, result ? result.state : null);
      return;
    }

    if (request.method === "PUT") {
      const payload = request.body;
      if (!payload || typeof payload !== "object" || !payload.monthKey || !payload.state) {
        json(response, 400, { error: "Invalid deal state" });
        return;
      }

      json(response, 200, await writeState(payload));
      return;
    }

    json(response, 405, { error: "Method not allowed" });
  } catch (error) {
    json(response, 500, { error: error.message });
  }
};
