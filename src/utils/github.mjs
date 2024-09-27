import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const ORG_NAME = 'qubic';
// const DAYS_TO_FETCH = 30;

export async function fetchRepos() {
  const response = await octokit.repos.listForOrg({
    org: ORG_NAME,
    type: 'public',
    per_page: 100,
  });
  return response.data;
}

// export async function fetchCommitsPerMonth(repoName: string) {
//   const today = new Date();
//   const startDate = new Date(
//     today.getTime() - DAYS_TO_FETCH * 24 * 60 * 60 * 1000,
//   );
//   const response = await octokit.repos.getCommitActivityStats({
//     owner: ORG_NAME,
//     repo: repoName,
//   });
//   const commitActivity = response.data;
//   if (!Array.isArray(commitActivity)) {
//     return 0;
//   }
//   const commitsPerMonth = commitActivity
//     .filter((week) => new Date(week.week * 1000) >= startDate)
//     .reduce((total, week) => total + week.total, 0);
//   return commitsPerMonth;
// }

// export async function fetchContributorsTotal(repoName: string) {
//   const response = await octokit.repos.listContributors({
//     owner: ORG_NAME,
//     repo: repoName,
//   });
//   return response.data.length;
// }

// export async function fetchIssuesPerMonth(
//   repoName: string,
//   state: 'open' | 'closed',
// ) {
//   const today = new Date();
//   const startDate = new Date(
//     today.getTime() - DAYS_TO_FETCH * 24 * 60 * 60 * 1000,
//   );
//   const response = await octokit.issues.listForRepo({
//     owner: ORG_NAME,
//     repo: repoName,
//     state,
//     since: startDate.toISOString(),
//     per_page: 100,
//   });
//   return response.data.length;
// }

// export async function fetchBranchesTotal(repoName: string) {
//   const response = await octokit.repos.listBranches({
//     owner: ORG_NAME,
//     repo: repoName,
//     per_page: 100,
//   });
//   return response.data.length;
// }

// export async function fetchReleasesTotal(repoName: string) {
//   const response = await octokit.repos.listReleases({
//     owner: ORG_NAME,
//     repo: repoName,
//     per_page: 100,
//   });
//   return response.data.length;
// }

// export async function fetchRepoContributors(repoName: string) {
//   const response = await octokit.repos.listContributors({
//     owner: ORG_NAME,
//     repo: repoName,
//   });
//   return response.data;
// }

// export async function fetchGitHubStats() {
//   const repos = await fetchRepos();
//   const aggregatedStats = {
//     commits: 0,
//     contributors: 0,
//     uniqueContributors: 0,
//     openIssues: 0,
//     closedIssues: 0,
//     forks: 0,
//     branches: 0,
//     releases: 0,
//   };

//   const allContributors: Set<string> = new Set();

//   await Promise.all(
//     repos.map(async (repo) => {
//       const [
//         commits,
//         contributors,
//         openIssues,
//         closedIssues,
//         branches,
//         releases,
//       ] = await Promise.all([
//         fetchCommitsPerMonth(repo.name),
//         fetchContributorsTotal(repo.name),
//         fetchIssuesPerMonth(repo.name, 'open'),
//         fetchIssuesPerMonth(repo.name, 'closed'),
//         fetchBranchesTotal(repo.name),
//         fetchReleasesTotal(repo.name),
//       ]);

//       aggregatedStats.commits += commits;
//       aggregatedStats.contributors += contributors;
//       aggregatedStats.openIssues += openIssues;
//       aggregatedStats.closedIssues += closedIssues;
//       aggregatedStats.forks += repo.forks_count || 0;
//       aggregatedStats.branches += branches;
//       aggregatedStats.releases += releases;

//       const repoContributors = await fetchRepoContributors(repo.name);
//       repoContributors.forEach((contributor) =>
//         allContributors.add(contributor.login || ''),
//       );
//     }),
//   );

//   aggregatedStats.uniqueContributors = allContributors.size;

//   return { aggregatedStats, repos };
// }
