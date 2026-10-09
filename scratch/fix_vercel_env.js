const { execSync } = require('child_process');

const envs = {
  NEXT_PUBLIC_APP_URL: "https://viralokit.vercel.app",
  NEXT_PUBLIC_SUPABASE_URL: "https://gvhmwqtcvtmzqddwfkid.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aG13cXRjdnRtenFkZHdma2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MjI5NjYsImV4cCI6MjEwNzA5ODk2Nn0.sWgTvRDfOS8jqKuwXnHhb13XnCCopsobFUxjU5e9iqE"
};

for (const [key, val] of Object.entries(envs)) {
  console.log(`Cleaning and resetting ${key}...`);
  try {
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'pipe' });
  } catch (e) {
    // ignore
  }

  // Pure ASCII buffer, no BOM, trailing newline
  const inputBuffer = Buffer.from(val.trim());
  execSync(`npx vercel env add ${key} production --type config`, {
    input: inputBuffer,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log(`Successfully added ${key} as pure ASCII without BOM!`);
}

console.log("All NEXT_PUBLIC env vars refreshed cleanly!");
