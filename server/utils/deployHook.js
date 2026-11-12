/**
 * server/utils/deployHook.js
 *
 * Debounced trigger for Vercel Deploy Hook.
 * Automatically triggered when content, settings, or blog posts are
 * published, edited, or deleted in the admin CMS.
 */

let deployHookTimer = null;

export function triggerDeployHook() {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl || !hookUrl.trim()) {
    return;
  }

  if (deployHookTimer) {
    clearTimeout(deployHookTimer);
  }

  deployHookTimer = setTimeout(async () => {
    deployHookTimer = null;
    try {
      console.log('🚀 Triggering Vercel deploy hook for site rebuild…');
      const res = await fetch(hookUrl, { method: 'POST' });
      if (!res.ok) {
        console.error(`Vercel deploy hook request failed with status: ${res.status}`);
      } else {
        console.log('✅ Vercel deploy hook triggered successfully.');
      }
    } catch (err) {
      console.error(`Vercel deploy hook request failed: ${err.message}`);
    }
  }, 5000);
}

