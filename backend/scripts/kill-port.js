import { execSync } from 'child_process';

const port = process.env.PORT || 5000;

try {
  const pid = execSync(`netstat -ano | findstr :${port}`).toString().split('\n')[0].trim().split(/\s+/).pop();
  if (pid) {
    console.log(`Killing process ${pid} on port ${port}...`);
    execSync(`taskkill /F /PID ${pid}`);
  }
} catch (e) {
  console.log(`No process found on port ${port}.`);
}
