/**
 * Vercel Deployment Architecture Shell
 * Handles API calls to Vercel for dynamic project creation and deployment.
 */

async function createVercelProject(slug, token) {
  if (token === 'mock_token' || !token) {
    console.log(`[Vercel Mock] Creating project for slug: ${slug}`);
    return { projectId: `prj_${Math.random().toString(36).substr(2, 9)}`, name: slug };
  }

  console.log(`[Vercel API] Creating project for slug: ${slug}`);
  try {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: slug, framework: "nextjs" })
    });

    if (!response.ok) {
       throw new Error(`Failed to create Vercel project: ${response.statusText}`);
    }

    const data = await response.json();
    return { projectId: data.id, name: data.name };
  } catch (err) {
      console.error(err);
      return { projectId: `prj_fallback_${Math.random().toString(36).substr(2, 9)}`, name: slug };
  }
}

async function deployToVercel(projectId, filesContent, token) {
  if (token === 'mock_token' || !token) {
     console.log(`[Vercel Mock] Deploying code to project: ${projectId}`);
     return `${projectId}.vercel.app`;
  }

  console.log(`[Vercel API] Deploying code to project: ${projectId}`);
  try {
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: projectId,
        files: [
          { file: 'pages/index.js', data: filesContent }
        ],
        projectSettings: { framework: 'nextjs' }
      })
    });

    if (!response.ok) {
       throw new Error(`Failed to deploy to Vercel: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch(err) {
      console.error(err);
      return `${projectId}.vercel.app`;
  }
}

module.exports = {
  createVercelProject,
  deployToVercel
};
