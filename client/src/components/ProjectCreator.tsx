import React, { useState, useEffect } from "react";
import { Terminal, ChevronRight, GitBranch, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/ui/Loading";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface Repository {
  id: number; name: string; full_name: string; private: boolean; description: string | null;
  html_url: string; languageUrl: string; default_branch: string; branches_url: string;
  url: string; avatar_url?: string; commitHistory: string;
}

const ProjectCreator: React.FC<{ onSubmit?: () => void }> = ({ onSubmit }) => {
  const [state, setState] = useState({
    repoList: [] as Repository[], searchInput: "", loading: true, error: null as string | null,
    activeTab: "select" as "select" | "configure", branches: [] as string[], branchLoading: false, creating: false,
    project: { name: "", description: "", selected_branch: "", logo: null as File | null, logoPreview: "",
      repoid: "", repo_url: "", repo_name: "", branch_url: "", languages_url: "", commithistory_url: "", logo_url: "" }
  });

  const { user } = useAuth();
  const githubConnected = Boolean(user?.accessToken);
  const isGitHubUrl = (input: string) => /github\.com\/([^/]+)\/([^/]+)/.test(input);
  const filteredRepos = state.repoList.filter(repo => 
    repo.name.toLowerCase().includes(state.searchInput.toLowerCase()) ||
    repo.description?.toLowerCase().includes(state.searchInput.toLowerCase())
  );

  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));
  const updateProject = (updates: Partial<typeof state.project>) => 
    updateState({ project: { ...state.project, ...updates } });

  useEffect(() => {
    if (githubConnected) loadRepositories();
    else updateState({ loading: false });
  }, [githubConnected]);

  const loadRepositories = async () => {
    updateState({ loading: true, error: null });
    try {
      const response = await fetch(`${SERVER_URL}/github/repositories`, { credentials: "include" });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch repositories");
      
      updateState({ 
        repoList: data.repositories.map((repo: any) => ({
          id: repo.id, name: repo.name, full_name: repo.full_name, private: repo.private,
          description: repo.description, html_url: repo.html_url, languageUrl: repo.languages_url,
          default_branch: repo.default_branch, branches_url: repo.branches_url.replace(/\/\{\/?branch\}$/, ""),
          url: repo.url, avatar_url: repo.owner.avatar_url, commitHistory: repo.url + "/commits"
        })),
        loading: false 
      });
    } catch (err) {
      updateState({ error: "Failed to fetch repositories", loading: false });
    }
  };

  const fetchPublicRepo = async (url: string) => {
    updateState({ loading: true, error: null });
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error("Invalid GitHub repository URL");

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) throw new Error("Repository not found or is private");

      const data = await response.json();
      const repoData: Repository = {
        id: data.id, name: data.name, full_name: data.full_name, private: data.private,
        description: data.description, html_url: data.html_url, languageUrl: data.languages_url,
        default_branch: data.default_branch, branches_url: data.branches_url.replace(/\/\{\/?branch\}$/, ""),
        url: data.url, avatar_url: data.owner.avatar_url, commitHistory: data.url + "/commits"
      };

      updateState({ 
        repoList: [repoData, ...state.repoList.filter(r => r.id !== repoData.id)],
        searchInput: "", loading: false 
      });
      handleRepoSelect(repoData);
    } catch (err: any) {
      updateState({ error: err.message, loading: false });
    }
  };

  const fetchBranches = async (repository: Repository) => {
    updateState({ branchLoading: true });
    try {
      const response = await fetch(`${SERVER_URL}/github/branches?branchUrl=${encodeURIComponent(repository.branches_url)}`, 
        { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        updateState({ branches: data.branches.map((b: any) => b.name) || [repository.default_branch] });
      } else throw new Error();
    } catch {
      updateState({ branches: [repository.default_branch] });
    }
    updateState({ branchLoading: false });
  };

  const handleRepoSelect = (repo: Repository) => {
    updateProject({
      name: repo.name, description: repo.description || "", selected_branch: repo.default_branch,
      logoPreview: repo.avatar_url || "", repoid: repo.id.toString(), repo_url: repo.html_url,
      repo_name: repo.full_name, branch_url: repo.branches_url, languages_url: repo.languageUrl,
      commithistory_url: repo.commitHistory, logo_url: repo.avatar_url || "", logo: null
    });
    fetchBranches(repo);
    updateState({ activeTab: "configure" });
  };

  const handleFieldUpdate = (field: string, value: string | File | null) => {
    updateProject({ [field]: value });
    if (field === "logo" && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => updateProject({ logoPreview: e.target?.result as string });
      reader.readAsDataURL(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.project.name || state.branchLoading || state.creating) return;
    updateState({ creating: true });

    let logoUrl = state.project.logo_url;
    if (state.project.logo) {
      const formData = new FormData();
      formData.append("logo", state.project.logo);
      const uploadResponse = await fetch(`${SERVER_URL}/util/upload`, 
        { method: "POST", credentials: "include", body: formData });
      if (uploadResponse.ok) logoUrl = (await uploadResponse.json()).url;
    }

    await fetch(`${SERVER_URL}/project/create`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...state.project, logo_url: logoUrl })
    });

    updateState({ creating: false });
    onSubmit?.();
  };

  const SearchInput = ({ placeholder }: { placeholder: string }) => (
    <div className="relative">
      <Input placeholder={placeholder} value={state.searchInput}
        onChange={(e) => updateState({ searchInput: e.target.value })}
        onKeyPress={(e) => e.key === 'Enter' && handleInputAction()}
        className="pr-24" />
      {(isGitHubUrl(state.searchInput) || !githubConnected) && (
        <Button onClick={handleInputAction} size="sm" 
          className="absolute right-2 top-1/2 -translate-y-1/2"
          disabled={!state.searchInput.trim() || (!githubConnected && !isGitHubUrl(state.searchInput))}>
          Add Repo
        </Button>
      )}
    </div>
  );

  const handleInputAction = () => {
    if (state.searchInput.trim() && isGitHubUrl(state.searchInput)) fetchPublicRepo(state.searchInput);
    else updateState({ error: null });
  };

  return (
    <Tabs value={state.activeTab} onValueChange={(v) => updateState({ activeTab: v as "select" | "configure" })}>
      <TabsContent value="select" className="space-y-6 mt-6">
        <SearchInput placeholder={githubConnected ? "Search repositories or paste GitHub URL..." : "Paste GitHub repository URL..."} />
        
        {githubConnected ? (
          state.loading ? <div className="p-4"><Loading /></div> :
          state.error ? <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg"><p>{state.error}</p></div> :
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500">
            {filteredRepos.length === 0 ? 
              <p className="text-center text-gray-500 py-4">{state.searchInput.trim() ? "No repositories found" : "No repositories available"}</p> :
              filteredRepos.map(repo => (
                <div key={repo.id} className={cn("p-4 rounded-lg border transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10 border-gray-200 dark:border-gray-800")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        {repo.avatar_url ? <img src={repo.avatar_url} alt="" className="w-8 h-8 rounded-lg" /> :
                         <Terminal className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{repo.name}</h3>
                        <p className="text-sm text-gray-500">{repo.full_name}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleRepoSelect(repo)} variant="outline" className="hover:bg-purple-50">
                      Select <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-yellow-700 dark:text-yellow-200 text-center">
            <p>Connect your GitHub account to browse repositories.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="configure" className="space-y-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="group relative w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors overflow-hidden">
              {state.project.logoPreview ? (
                <>
                  <img src={state.project.logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : <Upload className="w-6 h-6 text-gray-400 m-auto" />}
              <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleFieldUpdate("logo", e.target.files?.[0] || null)} />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-gray-600">Project Logo</Label>
              <p className="text-xs text-gray-500 mt-1">
                {state.project.logo?.name || "Using repository avatar as default"}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={state.project.name} required
                onChange={(e) => handleFieldUpdate("name", e.target.value)} />
            </div>
            <div>
              <Label>Repository</Label>
              <Input value={state.project.repo_name} disabled className="bg-gray-50 dark:bg-purple-900/30" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea id="description" rows={3} value={state.project.description}
                onChange={(e) => handleFieldUpdate("description", e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] px-3 py-2 focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <Label htmlFor="branch">Branch</Label>
              <div className="relative">
                <select id="branch" value={state.project.selected_branch} disabled={state.branchLoading}
                  onChange={(e) => handleFieldUpdate("selected_branch", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] px-3 py-2 pr-10 appearance-none">
                  {state.branchLoading ? <option>Loading branches...</option> :
                   state.branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {state.branchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   <GitBranch className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => updateState({ activeTab: "select" })}>
              Back to Selection
            </Button>
            <Button type="submit" disabled={state.branchLoading || !state.project.name || state.creating}
              className="bg-purple-600 hover:bg-purple-700">
              {state.creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Project"}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default ProjectCreator;
