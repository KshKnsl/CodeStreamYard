import { X } from "lucide-react";
import { Button } from "./ui/button";
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";

interface CodeAreaProps {
  openFiles: string[];
  onFileClose: (filePath: string) => void;
  projectId?: string;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const CodeArea = ({ openFiles, onFileClose, projectId }: CodeAreaProps) => {
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const currentFile = openFiles.length > 0 ? openFiles[0] : null;

  const loadFileContent = async (filePath: string) => {
    if (fileContents[filePath] || loadingFiles.has(filePath) || !projectId) {
      return;
    }

    setLoadingFiles((prev) => new Set(prev).add(filePath));

    try {
      const response = await fetch(`${SERVER_URL}/localCopyOfProject/${projectId}/${filePath}`);
      if (response.ok) {
        const content = await response.text();
        setFileContents((prev) => ({ ...prev, [filePath]: content }));
      } else {
        console.error(`Failed to load file: ${filePath}`);
        setFileContents((prev) => ({ ...prev, [filePath]: "// Error loading file" }));
      }
    } catch (error) {
      console.error(`Error loading file ${filePath}:`, error);
      setFileContents((prev) => ({ ...prev, [filePath]: "// Error loading file" }));
    } finally {
      setLoadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(filePath);
        return newSet;
      });
    }
  };

  const configureMonaco = (monaco: any) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowJs: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      noResolve: true,
      isolatedModules: true,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: true,
    });
  };

  const handleEditorChange = (value: string | undefined, filePath: string) => {
    if (value !== undefined) {
      setFileContents((prev) => ({ ...prev, [filePath]: value }));
    }
  };

  const handleSave = async (filePath: string) => {
    const content = fileContents[filePath];
    if (content !== undefined && projectId) {
      try {
        const response = await fetch(`${SERVER_URL}/project/saveFile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ projectId, filePath, content }),
        });
        const result = await response.json();
        if (result.success) {
          console.log(`File ${filePath} saved successfully`);
        } else {
          console.error(`Failed to save file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error saving file ${filePath}:`, error);
      }
    }
  };

  useEffect(() => {
    if (currentFile && !fileContents[currentFile] && !loadingFiles.has(currentFile)) {
      loadFileContent(currentFile);
    }
  }, [currentFile, fileContents, loadingFiles]);

  if (!currentFile) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-[#171717]">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0A0A0A]">
          <span className="text-sm text-gray-600 dark:text-[#7d8590]">No file open</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-xl font-medium text-gray-800 dark:text-[#e6edf3]">
              Welcome to CodeStreamYard
            </div>
            <div className="text-sm text-gray-600 dark:text-[#7d8590] max-w-md">
              Select a file from the explorer to start editing.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#171717]">
      {/* Single File Header */}
      <div className="border-b border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0A0A0A] p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-[#e6edf3]">
          {currentFile.split("/").pop()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-600 dark:text-[#e6edf3] hover:bg-gray-200 dark:hover:bg-[#30363d]"
          onClick={() => onFileClose(currentFile)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          width="100%"
          path={currentFile}
          theme="vs-dark"
          value={fileContents[currentFile] || "// Loading..."}
          onChange={(value) => handleEditorChange(value, currentFile)}
          options={{
            minimap: { enabled: false },
            readOnly: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
            lineNumbers: "on",
            suggest: {
              showIcons: true,
            },
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: "full",
          }}
          beforeMount={configureMonaco}
          onMount={(editor, monaco) => {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              handleSave(currentFile);
            });
          }}
        />
      </div>
    </div>
  );
};

export default CodeArea;
