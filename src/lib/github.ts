// Enriches synced projects with their live GitHub star count. Fails quietly:
// any project we can't enrich comes back unchanged.
export async function withGithubStars<T extends { github_sync?: boolean; repo_url?: string | null }>(
  projects: T[]
): Promise<Array<T & { stars?: number }>> {
  return Promise.all(
    projects.map(async (project) => {
      if (!project.github_sync || !project.repo_url) return project;
      try {
        const match = project.repo_url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return project;
        const res = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`, {
          headers: import.meta.env.GITHUB_TOKEN
            ? { Authorization: `token ${import.meta.env.GITHUB_TOKEN}` }
            : {},
        });
        if (!res.ok) return project;
        const data = await res.json();
        return { ...project, stars: data.stargazers_count };
      } catch {
        return project;
      }
    })
  );
}
