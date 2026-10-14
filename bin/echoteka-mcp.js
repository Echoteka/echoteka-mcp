#!/usr/bin/env node
// Thin stdio bridge: clients that cannot speak streamable HTTP reach the hosted
// Echoteka MCP server through mcp-remote. The default is the anonymous endpoint
// (https://echoteka.ai/mcp): analysis, artifact cleanup, previews, job status and
// the free daily master work without an account. Set ECHOTEKA_MCP_URL to
// https://echoteka.ai/mcp/oauth to use your account's masters instead; that
// endpoint signs you in through a browser page (OAuth 2.1 with PKCE), so the
// bridge never handles a password or an API key.
//
// mcp-remote is a real dependency, so the copy next to us is used when it is
// installed (`npm i -g echoteka-mcp`, container builds). Only when it is missing,
// as with a bare `npx -y echoteka-mcp`, do we fall back to fetching it from the
// registry: a container must not depend on the registry being reachable at run time.
const { spawn } = require('child_process');

const url = process.env.ECHOTEKA_MCP_URL || 'https://echoteka.ai/mcp';

let cmd;
let args;
try {
  cmd = process.execPath;
  args = [require.resolve('mcp-remote/dist/proxy.js'), url];
} catch (_) {
  cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  args = ['-y', 'mcp-remote', url];
}

const child = spawn(cmd, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
