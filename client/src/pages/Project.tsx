import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "../components/ui/Loading";
import FileTreeArea from "../components/FileTreeArea";
import CodeArea from "../components/CodeArea";
import Terminal from "../components/Terminal";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { Button } from "../components/ui/button";
import { StreamBar } from "../components/StreamBar";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filesData, setFilesData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const handleFileOpen = (filePath: string) => {
    setCurrentFile(filePath);
  };

  const handleFileClose = () => {
    setCurrentFile(null);
  };

  const handleFileSelect = (filePath: string) => {
    setCurrentFile(filePath);
  };

  const fetchProjectFiles = async () => {
    if (!id) return;
    try {
      const response = await fetch(`${SERVER_URL}/project/getAllFiles/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      setFilesData(data);
    } catch (err) {
      setError("Failed to fetch project files");
    }
  };
  useEffect(() => {
    const autoFetch = async () => {
      await fetchProjectFiles();
      setInitialLoading(false);
    };
    autoFetch();
  }, [id]);

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stream Bar at the top */}
      <StreamBar projectId={id || ""} />

      {error && (
        <div className="bg-destructive/15 text-destructive px-3 py-1 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0A0A0A]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
            <div className="h-full bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-[#30363d] flex flex-col">
              <div className="p-3 border-b border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3] uppercase tracking-wide">
                  Explorer
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/project/info/${id}`)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-[#7d8590] dark:hover:text-[#e6edf3] hover:bg-gray-200 dark:hover:bg-[#21262d] px-2 py-1 h-6">
                  View Details
                </Button>
              </div>
              <div className="flex-1 min-h-0 bg-white dark:bg-[#0A0A0A] overflow-y-auto">
                {filesData && filesData.localPath && filesData.localPath.patharray ? (
                  <FileTreeArea
                    patharray={filesData.localPath.patharray}
                    onFileOpen={handleFileOpen}
                    onFileSelect={handleFileSelect}
                  />
                ) : (
                  <div className="p-4 text-gray-500 dark:text-[#7d8590]">No files available</div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={75} minSize={50}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="h-full bg-white dark:bg-black">
                  <CodeArea
                    openFiles={currentFile ? [currentFile] : []}
                    onFileClose={handleFileClose}
                    projectId={id}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={30} minSize={20} maxSize={70}>
                <Terminal projectId={id} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Project;
