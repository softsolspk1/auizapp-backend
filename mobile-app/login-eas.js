const { spawn } = require('child_process');

// Step 1: Logout first
const logoutChild = spawn('npx.cmd', ['eas-cli', 'logout'], { shell: true, stdio: 'inherit' });

logoutChild.on('close', () => {
  // Step 2: Login
  const loginChild = spawn('npx.cmd', ['eas-cli', 'login'], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });

  loginChild.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    if (output.toLowerCase().includes('email or username')) {
      loginChild.stdin.write('softsols026\n');
    } else if (output.toLowerCase().includes('password')) {
      loginChild.stdin.write('Aakay@12345\n');
    } else if (output.toLowerCase().includes('already logged in')) {
      loginChild.stdin.write('y\n');
    }
  });

  loginChild.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  loginChild.on('close', (code) => {
    console.log(`\nLogin child process exited with code ${code}`);
    process.exit(code);
  });
});
