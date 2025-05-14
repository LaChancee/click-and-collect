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
}

export function ImageUploader({ imageUrl, onImageUploaded, onImageRemoved }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Utiliser le hook UploadThing
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (files) => {
      if (files && files.length > 0) {
        const url = files[0].url;
        onImageUploaded(url);
        setPreviewUrl(null);
      }
      setIsUploading(false);
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

      // Commencer l'upload
      await startUpload([file]);

      // Nettoyer l'URL de prévisualisation
      URL.revokeObjectURL(preview);
    },
    [startUpload]
  );

  // Supprimer l'image
  const handleRemoveImage = useCallback(() => {
    onImageRemoved();
    setPreviewUrl(null);
  }, [onImageRemoved]);

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
            disabled={isUploading || !!previewUrl}
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
    </div>
  );
} 