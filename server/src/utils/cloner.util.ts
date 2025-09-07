import simpleGit from "simple-git";
import path from "path";
import fs from "fs";

export async function cloneOrPullRepo(
  repoUrl: string,
  accessToken: string,
  localBaseDir = "./cloned_repos",
  projectId?: string
) {
  if (!repoUrl || !accessToken) throw new Error("Missing repoUrl or accessToken");
    const url = repoUrl.replace("https://", `https://${accessToken}@`);
  
  let localPath: string;
  if (projectId) {
    localPath = path.resolve(localBaseDir, projectId);
  } else {
    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";
    const owner = repoUrl.split("/")[repoUrl.split("/").length - 2];
    localPath = path.resolve(localBaseDir, `${owner}__${repoName}`);
  }
  
  // Ensure base directory exists
  if (!fs.existsSync(localBaseDir)) {
    fs.mkdirSync(localBaseDir, { recursive: true });
  }
  
  const git = simpleGit();
  
  try {
    if (fs.existsSync(localPath)) {
      console.log(`Updating existing repository at: ${localPath}`);
      await git.cwd(localPath).pull();
    } else {
      console.log(`Cloning repository to: ${localPath}`);
      await git.clone(url, localPath);
    }
  } catch (error) {
    console.error("Git operation failed:", error);
    throw error;
  }
  
  return localPath;
}
