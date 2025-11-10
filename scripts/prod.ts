#!/usr/bin/env bun

// Function to check if a port is in use
async function isPortInUse(port: number): Promise<boolean> {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      const result = await Bun.$`lsof -ti:${port}`.quiet();
      return result.stdout.length > 0;
    } else if (process.platform === 'win32') {
      const result = await Bun.$`netstat -ano | findstr :${port}`.quiet();
      return result.stdout.length > 0;
    }
    return false;
  } catch (error) {
    return false;
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
    } else {
      console.log(`\x1b[${color}m[${name}]\x1b[0m Process completed successfully`);
    }
  });
  
  return process;
}

// Main function
async function main() {
  console.log('🚀 Starting production build...');
  
  // Check if ports are available (production might use different ports)
  const backendPort = process.env.BACKEND_PORT || 5050;
  const frontendPort = process.env.FRONTEND_PORT || 5170; // Different from dev
  
  console.log('🔧 Checking port availability...');
  const backendInUse = await isPortInUse(Number(backendPort));
  const frontendInUse = await isPortInUse(Number(frontendPort));
  
  if (backendInUse) {
    console.log(`⚠️  Backend port ${backendPort} is in use - you may need to stop existing process`);
  }
  if (frontendInUse) {
    console.log(`⚠️  Frontend port ${frontendPort} is in use - you may need to stop existing process`);
  }
  
  // Build frontend for production
  console.log('🔧 Building frontend for production...');
  const frontendProcess = startProcess('bun', ['run', 'build'], 'Frontend Build', '32', 'frontend'); // Green
  
  await new Promise((resolve) => {
    frontendProcess.exited.then(resolve);
  });
  
  // Start backend in production mode
  console.log('🔧 Starting backend in production mode...');
  const backendProcess = startProcess('bun', ['run', 'start'], 'Backend', '36', 'backend'); // Cyan
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down production environment...');
    backendProcess.kill();
    process.exit(0);
  });
  
  console.log('✅ Production environment started!');
  console.log(`   Backend API & Frontend: http://localhost:${backendPort}`);
  console.log('   Press Ctrl+C to stop all processes');
  
  // Wait for backend process (it will serve both API and frontend)
  await new Promise((resolve) => {
    backendProcess.exited.then(resolve);
  });
}

// Run the main function
main().catch((error) => {
  console.error('Error starting production environment:', error);
  process.exit(1);
});