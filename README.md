# echoteka-mcp: AI audio mastering for your assistant

[Echoteka](https://echoteka.ai) runs a remote [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server. Connect it to Claude, Cursor, OpenAI Codex or any MCP client, and the assistant can measure a track's loudness, clean the marks an AI generator leaves in the audio, compare presets by ear and master the track to a streaming target.

- Server: `https://echoteka.ai/mcp` (streamable HTTP, no key, no account needed)
- Website and web lab: <https://echoteka.ai>
- MCP page with setup notes: <https://echoteka.ai/mcp>
- Machine-readable description: <https://echoteka.ai/mcp.json>

Nothing has to be installed for the hosted server. This package is a small stdio bridge for clients that cannot speak HTTP, and it reaches the same server.

## Connect

### Claude Code

```bash
claude mcp add --transport http echoteka https://echoteka.ai/mcp
```

### Claude Desktop

Option A, custom connector: open Settings, then Connectors, choose *Add custom connector* and paste `https://echoteka.ai/mcp`.

Option B, config file (`claude_desktop_config.json`), for versions that only accept local servers:

```json
{
  "mcpServers": {
    "echoteka": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://echoteka.ai/mcp"]
    }
  }
}
```

Restart the app after editing the file.

### Cursor

Add this to `~/.cursor/mcp.json`, or to `.cursor/mcp.json` inside a project:

```json
{
  "mcpServers": {
    "echoteka": {
      "url": "https://echoteka.ai/mcp"
    }
  }
}
```

### OpenAI Codex

```bash
codex mcp add echoteka --url https://echoteka.ai/mcp
```

Or add this to `~/.codex/config.toml`:

```toml
[mcp_servers.echoteka]
url = "https://echoteka.ai/mcp"
```

### Any other stdio client

```json
{
  "mcpServers": {
    "echoteka": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://echoteka.ai/mcp"]
    }
  }
}
```

### Using your account's masters

The anonymous endpoint is enough to try everything. To use the masters of your own Echoteka account, connect to the sign-in endpoint instead. The client opens an Echoteka page in your browser, you sign in and press Allow, and the assistant receives a token limited to mastering. It never sees your password.

- Remote clients: use `https://echoteka.ai/mcp/oauth` as the URL, for example `claude mcp add --transport http echoteka https://echoteka.ai/mcp/oauth`.
- This package: set `ECHOTEKA_MCP_URL=https://echoteka.ai/mcp/oauth` in the environment of the process that starts it.

## Tools

The live `tools/list` response of `https://echoteka.ai/mcp` (checked 21 November 2026) contains nine tools:

| Tool | What it does | Cost |
|---|---|---|
| `get_service_info` | Profile of the service: which features run free, what one credit covers, and where the written rules are. | free |
| `list_presets` | Preset catalogue with each preset's loudness target in LUFS. These keys are the only style values `master_track` accepts. | free |
| `check_limits` | Free runs left today and when they reset, credit balance, upload cap, access to advanced modules. | free |
| `analyze_track` | Reads integrated loudness, sample peak, length, sample rate and stereo correlation from the file, without rendering. | free |
| `clean_ai_trace` | Removes the marks an AI generator leaves in the audio, such as narrow tones above 15 kHz and seams between generated blocks. Loudness and tone stay as they are. | free, no credit |
| `preview_styles` | Renders the central 24 seconds through two to six presets and returns each loudness and a listen link. | free, 6 per day |
| `master_track` | Renders one track, drawing a credit when the account has a balance and the free allowance otherwise. `dry_run` shows the planned charge first. | free daily master, then credits |
| `batch_master` | Runs up to 10 tracks with the same settings; album mode keeps the loudness balance between them. | one free run or a credit per track |
| `get_job` | Status, progress and result metrics. A finished master gets a signed download link valid for about an hour. | free |

Typical flow: `check_limits` → `analyze_track` → `clean_ai_trace` (optional, for AI-generated tracks) → `preview_styles` → `master_track` → poll `get_job`.

Audio is passed as a public https link. Echoteka fetches the file from the link; the assistant never uploads bytes through the protocol. Share links from Suno song pages, Google Drive and Dropbox are resolved to the file when possible.

## Pricing

- Analysis, artifact cleanup, previews and job status are free.
- One full master per day is free, with no account.
- Signing in adds a few welcome masters and a free master per day.
- Extra masters use credits. Credits are bought by a person on the website; the server has no payment tool and an assistant cannot pay.

Current details and prices: <https://echoteka.ai/pricing>.

## Honest limits

- Cleanup removes artifacts a generator leaves in the audio. It does not change where a track came from. If a platform or distributor asks you to disclose AI use, disclose it.
- Mastering is not mixing. It cannot fix a vocal that sits too low or a muddy mix.
- Free masters are not stored for long. Download the result when the job is done.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `ECHOTEKA_MCP_URL` | `https://echoteka.ai/mcp` | Server the bridge connects to. Use `https://echoteka.ai/mcp/oauth` for sign-in. |

The bridge needs Node.js 18 or newer and outbound HTTPS access to `echoteka.ai`.

## Docker

```bash
docker build -t echoteka-mcp .
docker run -i --rm echoteka-mcp
```

The image contains only the bridge. The server itself stays hosted at `https://echoteka.ai/mcp`.

## Privacy and terms

- Privacy policy: <https://echoteka.ai/privacy>
- Terms of service: <https://echoteka.ai/terms>
- Refunds: <https://echoteka.ai/refund>

## Support

Email <support@echoteka.ai>, or open an issue in this repository.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Echoteka.
