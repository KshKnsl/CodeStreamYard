import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Settings } from "lucide-react";
import Loading from "@/components/ui/Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartPieDonutText } from "@/components/ui/donut-pie-chart";

interface ProjectData {
  id: string;
  name: string;
  repoid: string;
  logo_url: string;
  repo_url: string;
  repo_name: string;
  branch_url: string;
  description: string;
  languages_url: string;
  selected_branch: string;
  commithistory_url: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const ProjectDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [languagesData, setLanguagesData] = useState<any>(null);
  const [commitsData, setCommitsData] = useState<any>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [commitsOpen, setCommitsOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async (url: string) => {
    try {
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      return data.success ? data : null;
    } catch {
      return null;
    }
  };

  const fetchProjectData = async () => {
    if (!project) return;
    
    const [languagesRes, commitsRes, branchesRes] = await Promise.all([
      fetchData(
        `${SERVER_URL}/github/languages?languages_url=${encodeURIComponent(project.languages_url)}`
      ),
      fetchData(
        `${SERVER_URL}/github/commits?commithistory_url=${encodeURIComponent(project.commithistory_url)}`
      ),
      fetchData(
        `${SERVER_URL}/github/branches?branchUrl=${encodeURIComponent(project.branch_url)}`
      ),
    ]);

    setLanguagesData(languagesRes.branches || languagesRes.languages || languagesRes);
    setCommitsData(commitsRes.branches);
    setBranches(branchesRes.branches.map((b: any) => b.name));
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      const res = await fetch(`${SERVER_URL}/project/get/${id}`, { credentials: "include" });
      const json = await res.json();
      if (json.success && json.project) {
        const proj = json.project;
        setProject(proj);
        setName(proj.name);
        setDescription(proj.description || "");
        setLogoPreview(proj.logo_url || null);
        setSelectedBranch(proj.selected_branch || "");
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) fetchProjectData();
  }, [project]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let logoUrl = project?.logo_url || "";
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        const uploadRes = await fetch(`${SERVER_URL}/util/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) logoUrl = uploadData.url;
      }

      const updateBody = { 
        id: project?.id, 
        name, 
        description, 
        logo_url: logoUrl,
        selected_branch: selectedBranch 
      };
      
      const updateRes = await fetch(`${SERVER_URL}/project/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateBody),
      });

      const updateData = await updateRes.json();

      if (updateData.success) {
        setMessage("Updated successfully!");
        if (updateData.project) setProject(updateData.project);
        if (logoFile) setLogoFile(null);
      } else {
        setMessage("Update failed: " + (updateData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Update failed");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${SERVER_URL}/project/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projId: project?.id }),
      });
      if ((await res.json()).success) {
        navigate("/dashboard");
      }
    } catch {}
    setSaving(false);
  };

  if (loading) return <Loading />;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center overflow-hidden">
                  {project.logo_url ? (
                    <img src={project.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-purple-500">{project.name[0]}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  <p className="text-sm text-gray-500">{project.description || "No description"}</p>
                  {project.repo_url && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      className="text-purple-600 hover:underline text-sm">
                      {project.repo_name}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Project Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Created</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Updated</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Commits</h4>
                  <div className="flex items-center gap-2">
                    <Dialog open={commitsOpen} onOpenChange={setCommitsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm text-gray-500 p-0 h-auto">
                          {commitsData?.length || 0} commits
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-96">
                        <DialogHeader>
                          <DialogTitle>Commits JSON ({commitsData?.length || 0} total)</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-80 overflow-auto">
                          <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded">
                            {JSON.stringify(commitsData, null, 2)}
                          </pre>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Branches</h4>
                  <div className="text-sm text-gray-500">
                    <div className="mb-1">{branches.length} branches</div>
                    <div className="text-xs">
                      {branches.slice(0, 3).join(", ")}
                      {branches.length > 3 && ` +${branches.length - 3} more`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <ChartPieDonutText
                  chartData={Object.entries(languagesData || {}).map(([lang, value]) => ({
                    browser: lang,
                    visitors: Number(value),
                    fill: undefined,
                  }))}
                  title="Languages"
                  description="Breakdown"
                  valueLabel="Bytes"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Settings</h3>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-2xl font-bold">{project.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          const reader = new FileReader();
                          reader.onload = () => setLogoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="logo"
                      className="absolute -bottom-1 -right-1 bg-purple-500 text-white rounded-full p-1.5 cursor-pointer hover:bg-purple-600">
                      <Upload className="w-3 h-3" />
                    </label>
                  </div>
                </div>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Project Name"
                  required
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch} {branch === project.selected_branch ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-purple-500 hover:bg-purple-600">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${message.includes("success") ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
                {message}
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-red-500">
              <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                This will permanently delete your project.
              </p>
              <Button
                onClick={handleDelete}
                disabled={saving}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700">
                {saving ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
