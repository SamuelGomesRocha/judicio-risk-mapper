import { FileText, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadCardProps {
  title: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
}

export const FileUploadCard = ({
  title,
  description,
  file,
  onFileChange,
  accept = ".pdf",
}: FileUploadCardProps) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      onFileChange(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-300 hover:shadow-lg",
        file ? "border-primary bg-primary-light" : "border-dashed border-2"
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
            file
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          {file ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary truncate max-w-[200px]">
                {file.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileChange(null)}
                className="h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label>
              <input
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar arquivo
                </span>
              </Button>
            </label>
          )}
        </div>
      </div>
    </Card>
  );
};
