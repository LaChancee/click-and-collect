'use client';

import { useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";
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
  uploadOnSubmit?: boolean;
}

export interface ImageUploaderRef {
  uploadPendingFile: () => Promise<boolean>;
}

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ imageUrl, onImageUploaded, onImageRemoved, uploadOnSubmit = false }, ref) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Utiliser le hook UploadThing
    const { startUpload } = useUploadThing("imageUploader", {
      onClientUploadComplete: (files) => {
        if (files && files.length > 0) {
          const url = files[0].url;
          onImageUploaded(url);
          setPreviewUrl(null);
          setPendingFile(null);
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

    // Exposer la méthode uploadPendingFile via ref
    useImperativeHandle(ref, () => ({
      uploadPendingFile: async () => {
        if (pendingFile && !isUploading) {
          try {
            await startUpload([pendingFile]);
            return true;
          } catch (error) {
            console.error("Error uploading pending file:", error);
            return false;
          }
        }
        return false;
      },
    }));

    // Gérer le changement de fichier via input
    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier le type de fichier
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          alert("Type de fichier non supporté. Utilisez JPG, PNG ou WebP.");
          return;
        }

        // Vérifier la taille du fichier (4MB max)
        const maxSize = 4 * 1024 * 1024; // 4MB en bytes
        if (file.size > maxSize) {
          alert("Le fichier est trop volumineux. Taille maximum : 4MB.");
          return;
        }

        // Nettoyer l'ancienne preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        // Créer un aperçu de l'image
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        if (uploadOnSubmit) {
          // Stocker le fichier pour l'uploader plus tard
          setPendingFile(file);
        } else {
          // Uploader immédiatement
          setPendingFile(null);
          await startUpload([file]);
        }

        // Reset input value pour permettre de sélectionner le même fichier
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [startUpload, uploadOnSubmit, previewUrl]
    );

    // Supprimer l'image
    const handleRemoveImage = useCallback(() => {
      onImageRemoved();
      setPreviewUrl(null);
      setPendingFile(null);

      // Nettoyer l'URL de preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, [onImageRemoved, previewUrl]);

    // Déclencher le sélecteur de fichier
    const triggerFileSelect = useCallback(() => {
      if (!isUploading) {
        fileInputRef.current?.click();
      }
    }, [isUploading]);

    // Calculer les informations de fichier
    const fileTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = "4MB";

    // Déterminer quelle image afficher
    const displayImageUrl = previewUrl || imageUrl;

    return (
      <div className="space-y-4">
        {/* Zone de drop ou aperçu */}
        <Card className="border-dashed border-2 relative">
          <CardContent className="flex flex-col items-center justify-center p-6 h-52">
            {displayImageUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={displayImageUrl}
                  alt="Aperçu du produit"
                  fill
                  className="object-contain rounded-md"
                />
                <Button
                  type="button"
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
              ref={fileInputRef}
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
            onClick={triggerFileSelect}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Téléchargement..." : displayImageUrl ? "Changer d'image" : "Ajouter une image"}
          </Button>
        </div>

        {/* Indicateurs d'état */}
        {pendingFile && uploadOnSubmit && (
          <p className="text-xs text-amber-600 font-medium text-center">
            L'image sera téléchargée lors de l'enregistrement du produit
          </p>
        )}

        {isUploading && (
          <p className="text-xs text-blue-600 font-medium text-center">
            Téléchargement en cours...
          </p>
        )}
      </div>
    );
  }
);

ImageUploader.displayName = "ImageUploader"; 