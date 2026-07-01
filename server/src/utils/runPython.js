const { spawn } = require('child_process');
const path = require('path');

const ANALYTICS_DIR = path.join(__dirname, '..', '..', '..', 'analytics');

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RENDER;
const PYTHON_PATH = IS_PRODUCTION
  ? 'python3'
  : path.join(ANALYTICS_DIR, 'venv', 'bin', 'python3');

function runPython(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(ANALYTICS_DIR, scriptName);

    const cleanEnv = { ...process.env };
    delete cleanEnv.DATABASE_URL;

    const py = spawn(PYTHON_PATH, [scriptPath, ...args], {
      cwd: ANALYTICS_DIR,
      env: cleanEnv
    });

    let output = '';
    let errorOutput = '';

    py.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        const details = errorOutput || output || `Process exited with code ${code}`;
        return reject(new Error(`Python error: ${details.trim()}`));
      }

      try {
        const jsonStart = output.indexOf('{');
        const jsonStr = output.slice(jsonStart);
        const parsed = JSON.parse(jsonStr);
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${output}`));
      }
    });

    py.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
}

module.exports = { runPython };
