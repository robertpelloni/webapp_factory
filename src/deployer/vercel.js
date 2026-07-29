const fs = require('fs');
const path = require('path');
const logger = require('../logger');

async function createVercelProject(slug, token) {
  if (token === 'mock_token' || !token) {
    logger.info(`[Vercel Mock] Creating project for slug: ${slug}`);
    return { projectId: `prj_${Math.random().toString(36).substr(2, 9)}`, name: slug };
  }

  logger.info(`[Vercel API] Creating project for slug: ${slug}`);
  try {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: slug, framework: null })
    });

    if (!response.ok) {
       throw new Error(`Failed to create Vercel project: ${response.statusText}`);
    }

    const data = await response.json();
    return { projectId: data.id, name: data.name };
  } catch (err) {
      logger.error(err);
      return { projectId: `prj_fallback_${Math.random().toString(36).substr(2, 9)}`, name: slug };
  }
}

// Recursively reads a directory to build the file array Vercel expects
function getFilesForVercel(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      // Skip heavy/ignored folders
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
         results = results.concat(getFilesForVercel(file, baseDir));
      }
    } else {
      const relativePath = path.relative(baseDir, file);
      // Read file as base64 string
      const data = fs.readFileSync(file, 'base64');
      results.push({ file: relativePath, data, encoding: 'base64' });
    }
  }
  return results;
}

async function assignDomainToProject(projectId, domain, token) {
  if (token === 'mock_token' || !token) {
    logger.info(`[Vercel Mock] Assigned domain ${domain} to project ${projectId}`);
    return true;
  }

  logger.info(`[Vercel API] Assigning domain ${domain} to project ${projectId}`);
  try {
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: domain })
    });

    if (!response.ok) {
      throw new Error(`Failed to assign domain: ${response.statusText}`);
    }
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

async function deployToVercel(projectId, tempWorkspaceDir, token) {
  if (token === 'mock_token' || !token || !tempWorkspaceDir) {
     logger.info(`[Vercel Mock] Deploying code to project: ${projectId}`);
     return `${projectId}.vercel.app`;
  }

  logger.info(`[Vercel API] Packaging and deploying full workspace to: ${projectId}`);

  try {
    const filesArray = getFilesForVercel(tempWorkspaceDir);

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: projectId,
        files: filesArray,
        projectSettings: { framework: null }
      })
    });

    if (!response.ok) {
       throw new Error(`Failed to deploy to Vercel: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch(err) {
      logger.error(err);
      return `${projectId}.vercel.app`; // Fallback format for testing/resilience
  }
}

module.exports = {
  createVercelProject,
  assignDomainToProject,
  deployToVercel
};
