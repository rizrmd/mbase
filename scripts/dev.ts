#!/usr/bin/env bun

// Function to kill processes on a specific port
async function killPort(port: number) {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      await Bun.$`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`;
    } else if (process.platform === 'win32') {
      await Bun.$`netstat -ano | findstr :${port} | for /f "tokens=5" %a in ('more') do taskkill /F /PID %a 2>nul || true`;
    }
    console.log(`✓ Killed processes on port ${port}`);
  } catch (error) {
    // Ignore errors if no process is running on the port
  }
}

// Function to start a process and log output
function startProcess(command: string, args: string[], name: string, color: string, cwd?: string) {
  const process = Bun.spawn([command, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    cwd: cwd,
  });
  
  const reader = process.stdout.getReader();
  const errorReader = process.stderr.getReader();
  
  // Read stdout
  (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = new TextDecoder().decode(value);
      console.log(`\x1b[${color}m[${name}]\x1b[0m ${text.trim()}`);
    }
  })();
  
  // Read stderr
  (async () => {
    while (true) {
      const { done, value } = await errorReader.read();
      if (done) break;
      const text = new TextDecoder().decode(value);
      console.error(`\x1b[${color}m[${name} ERROR]\x1b[0m ${text.trim()}`);
    }
  })();
  
  process.exited.then((code) => {
    if (code !== 0) {
      console.error(`\x1b[${color}m[${name}]\x1b[0m Process exited with code ${code}`);
    }
  });
  
  return process;
}

// Main function
async function main() {
  console.log('🚀 Starting development environment...');
  
  // Kill existing processes on ports
  console.log('🔧 Cleaning up existing processes...');
  await killPort(5050); // Backend port
  await killPort(5070); // Frontend port
  
  // Start backend
  console.log('🔧 Starting backend...');
  const backendProcess = startProcess('bun', ['run', 'dev'], 'Backend', '36', 'backend'); // Cyan
  
  // Give backend a moment to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Start frontend
  console.log('🔧 Starting frontend...');
  const frontendProcess = startProcess('npm', ['run', 'dev'], 'Frontend', '32', 'frontend'); // Green
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development environment...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
  
  console.log('✅ Development environment started!');
  console.log('   Backend: http://localhost:5050');
  console.log('   Frontend: http://localhost:5070');
  console.log('   Press Ctrl+C to stop all processes');
}

// Run the main function
main().catch((error) => {
  console.error('Error starting development environment:', error);
  process.exit(1);
});