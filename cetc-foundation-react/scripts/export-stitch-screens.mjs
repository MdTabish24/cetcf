import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const projectId = process.argv[2] || '11788332174175301539';
const outputDirArg = process.argv[3] || '.stitch/designs';
const outputDir = resolve(process.cwd(), outputDirArg);

function extractJsonObjects(text) {
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objects;
}

async function waitForServePayload(child, timeoutMs = 45000) {
  return await new Promise((resolvePayload, rejectPayload) => {
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      rejectPayload(new Error('Timed out waiting for Stitch serve JSON payload.'));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      const candidates = extractJsonObjects(stdout);
      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(candidate);
          if (parsed?.success && Array.isArray(parsed?.screens) && parsed?.url) {
            clearTimeout(timeout);
            resolvePayload(parsed);
            return;
          }
        } catch {
          // Ignore non-JSON or partial JSON chunks.
        }
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('exit', (code) => {
      clearTimeout(timeout);
      rejectPayload(
        new Error(`Stitch serve exited before JSON payload was ready (code: ${code ?? 'unknown'}). stderr: ${stderr.trim()}`)
      );
    });
  });
}

async function fetchHtml(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}. HTTP ${response.status}`);
  }
  return await response.text();
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const serveProcess = spawn(
    'cmd.exe',
    ['/c', 'npx', '@_davideast/stitch-mcp', 'serve', '--json', '-p', projectId],
    {
      cwd: process.cwd(),
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  let payload;
  try {
    payload = await waitForServePayload(serveProcess);

    for (const screen of payload.screens) {
      const html = await fetchHtml(screen.url);
      const filePath = resolve(outputDir, `${screen.screenId}.html`);
      await writeFile(filePath, html, 'utf8');
      console.log(`Exported ${screen.screenId} -> ${filePath}`);
    }

    console.log(`Export complete. Files saved in: ${outputDir}`);
  } finally {
    serveProcess.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
