'use client';

import { useCallback, useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { OurFileRouter } from "../../../../../api/uploadthing/core";

// Générer les helpers React pour UploadThing
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ImageUploaderProps {
  imageUrl: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  uploadOnSubmit?: boolean; // Nouveau paramètre pour contrôler quand l'upload a lieu
}

export function ImageUploader({
  imageUrl,
  onImageUploaded,
  onImageRemoved,
  uploadOnSubmit = true // Par défaut, on attend la soumission pour uploader
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null); // Stocker le fichier en attente

  // Utiliser le hook UploadThing
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (files) => {
      if (files && files.length > 0) {
        const url = files[0].url;
        onImageUploaded(url);
        setPreviewUrl(null);
      }
      setIsUploading(false);
      setPendingFile(null);
    },
    onUploadError: (error) => {
      console.error("Error uploading:", error);
      setIsUploading(false);
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  // Gérer le changement de fichier via input
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Créer un aperçu de l'image
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      if (uploadOnSubmit) {
        // Stocker le fichier pour l'uploader plus tard
        setPendingFile(file);
      } else {
        // Uploader immédiatement
        await startUpload([file]);
      }
    },
    [startUpload, uploadOnSubmit]
  );

  // Supprimer l'image
  const handleRemoveImage = useCallback(() => {
    onImageRemoved();
    setPreviewUrl(null);
    setPendingFile(null);

    // Si l'utilisateur supprime une image prévisualisée, nettoyons l'URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [onImageRemoved, previewUrl]);

  // Fonction pour uploader le fichier en attente (appelée depuis le composant parent lors de la soumission)
  const uploadPendingFile = async () => {
    if (pendingFile) {
     
        await startUpload([pendingFile]);
        return true;
    
    }
    return false;
  };

  // Rendre la méthode d'upload disponible pour le parent
  if (typeof window !== 'undefined') {
    // @ts-ignore - Exposer la méthode au parent
    window.uploadPendingImage = uploadPendingFile;
  }

  // Calculer les tailles de fichier autorisées
  const fileTypes = ["image/jpeg", "image/png"];
  const maxSize = "4MB";

  return (
    <div className="space-y-4">
      {/* Zone de drop ou aperçu */}
      <Card className="border-dashed border-2 relative">
        <CardContent className="flex flex-col items-center justify-center p-6 h-52">
          {(imageUrl || previewUrl) ? (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl || imageUrl || ""}
                alt="Aperçu du produit"
                fill
                className="object-contain rounded-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 h-full">
              <div className="rounded-full bg-muted p-3">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">
                  Glissez-déposez ou cliquez pour ajouter une image
                </p>
                <p className="text-xs text-muted-foreground">
                  {fileTypes.join(", ")} jusqu'à {maxSize}
                </p>
              </div>
            </div>
          )}

          {/* Input file caché */}
          <input
            type="file"
            accept={fileTypes.join(",")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </CardContent>
      </Card>

      {/* Bouton d'upload alternatif */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUploading}
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          <Upload className="h-4 w-4" />
          {imageUrl || previewUrl ? "Changer d'image" : "Ajouter une image"}
        </Button>
      </div>

      {/* Indicateur d'état */}
      {pendingFile && (
        <p className="text-xs text-amber-600 font-medium text-center">
          L'image sera téléchargée lors de l'enregistrement du produit
        </p>
      )}
    </div>
  );
} 