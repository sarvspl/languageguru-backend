const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function notifyFrontendRevalidate() {
  try {
    const url = `${FRONTEND_URL}/api/revalidate`;
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .catch(() => {});
  } catch (e) {
    // Non-blocking fire-and-forget
  }
}

module.exports = { notifyFrontendRevalidate };
