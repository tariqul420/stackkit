"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { type FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { api } from "@/lib/axios/http";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircleIcon,
  GripVerticalIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useFormContext } from "react-hook-form";

type SelectableMedia = {
  id: string;
  url: string;
  alt: string | null;
  sort: number;
};

type MediaKind = "image" | "video" | "pdf";

type Props = {
  name: string;
  label: string;
  multiple?: boolean;
  className?: string;
  viewClass?: string;
  selectableMedia?: SelectableMedia[];
  keyPrefix?: string;
  acceptTypes?: MediaKind[];
};

export type MediaUploaderFieldRef = {
  uploadPendingFiles: () => Promise<{ urls: string[]; uploadedKeys: string[] }>;
  revertUncommittedUploads: () => void;
  getCurrentUrls: () => string[];
};

type InitialFileMeta = {
  name: string;
  size: number;
  type: string;
  url: string;
  id: string;
};

async function uploadToCloudinaryViaPresign(
  file: File,
  keyPrefix = "products",
): Promise<{ key: string; publicUrl: string; secureUrl: string }> {
  const resourceType = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
    : file.type === "application/pdf"
    ? "raw"
    : "auto";

  const res = await api.post<{ data: Record<string, unknown> }>(
    "/v1/images/upload/presign",
    {
      folder: keyPrefix,
      resourceType,
    },
  );
  const payload = (res.data?.data as Record<string, unknown>) || {};

  const form = new FormData();

  if (payload.unsigned && payload.upload_preset) {
    form.append("upload_preset", payload.upload_preset as string);
    if (payload.folder) form.append("folder", payload.folder as string);
    form.append("file", file);
    const { data: upJson } = await api.post<Record<string, unknown>>(
      payload.uploadUrl as string,
      form,
    );
    return {
      key: upJson.public_id as string,
      publicUrl: upJson.secure_url as string,
      secureUrl: upJson.secure_url as string,
    };
  }

  if (!payload.unsigned) {
    if (payload.api_key) form.append("api_key", payload.api_key as string);
    if (payload.timestamp) form.append("timestamp", String(payload.timestamp));
    if (payload.signature) form.append("signature", payload.signature as string);
    if (payload.publicId) form.append("public_id", payload.publicId as string);
    if (payload.folder) form.append("folder", payload.folder as string);
    if (payload.resourceType) form.append("resource_type", payload.resourceType as string);
    form.append("file", file);

    const { data: upJson } = await api.post<Record<string, unknown>>(
      payload.uploadUrl as string,
      form,
    );
    return {
      key: upJson.public_id as string,
      publicUrl: upJson.url as string,
      secureUrl: upJson.secure_url as string,
    };
  }

  throw new Error("Invalid presign response");
}

function SortableMediaItem({
  file,
  onDelete,
  isBusy,
}: {
  file: FileWithPreview;
  onDelete: () => void;
  isBusy: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: file.id,
    disabled: isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? "0 10px 25px rgba(0,0,0,0.12)" : undefined,
  };

  const src = file.preview || "";

  const isVideo = file.file instanceof File && file.file.type.startsWith("video/");
  const isPdf = file.file instanceof File && file.file.type === "application/pdf";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-accent relative aspect-square rounded-md transition-all duration-200 group",
        isDragging && "opacity-75",
      )}
    >
      {src ? (
        isVideo ? (
          <video
            src={src}
            controls
            className="rounded-[inherit] object-cover w-full h-full"
          />
        ) : isPdf ? (
          <div className="flex items-center justify-center h-full text-xs">
            PDF
          </div>
        ) : (
          <img
            src={src}
            alt={file.file?.name ?? "media"}
            className="absolute inset-0 w-full h-full rounded-[inherit] object-cover"
          />
        )
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
          Preview not available
        </div>
      )}

      {!isBusy && (
        <Button
          {...attributes}
          {...listeners}
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1 left-1 z-20 size-8 bg-foreground/20 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground/30"
          aria-label="Drag to reorder"
        >
          <GripVerticalIcon className="size-3 text-primary-foreground" />
        </Button>
      )}

      <Button
        onClick={onDelete}
        size="icon"
        className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none z-30"
        aria-label="Remove media"
        disabled={isBusy}
      >
        <XIcon className="size-3.5" />
      </Button>

      {isBusy && (
        <div className="absolute inset-0 grid place-items-center rounded-[inherit] bg-foreground/30 text-[11px] text-primary-foreground z-20">
          Uploading…
        </div>
      )}
    </div>
  );
}

const MediaUploaderField = forwardRef<MediaUploaderFieldRef, Props>(
  function MediaUploaderField(
    {
      name,
      label,
      multiple = false,
      className,
      viewClass,
      selectableMedia = [],
      keyPrefix,
      acceptTypes = ["image"],
    },
    ref,
  ) {
    const acceptString = useMemo(() => {
      const parts: string[] = [];
      if (acceptTypes.includes("image")) parts.push("image/*");
      if (acceptTypes.includes("video")) parts.push("video/*");
      if (acceptTypes.includes("pdf")) parts.push("application/pdf");
      return parts.join(",");
    }, [acceptTypes]);
    const sortedSelectableMedia = useMemo(() => {
      return [...selectableMedia].sort((a, b) => a.sort - b.sort);
    }, [selectableMedia]);
    const { setValue, getValues } = useFormContext();

    const getList = useCallback((): string[] => {
      const v = getValues(name);
      if (Array.isArray(v)) return (v as string[]).filter(Boolean);
      if (typeof v === "string" && v.trim()) return [v.trim()];
      return [];
    }, [getValues, name]);

    const setList = useCallback(
      (urls: string[]) => {
        if (multiple) {
          setValue(name, urls, { shouldDirty: true, shouldValidate: true });
        } else {
          setValue(name, urls[0] ?? "", {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      },
      [multiple, name, setValue],
    );

    const initialFiles: InitialFileMeta[] = useMemo(() => {
      const urls = getList();
      return urls.map((url, i) => ({
        name: `media-${i + 1}`,
        size: 0,
        type: "image/jpeg",
        url,
        id: `init-${i}-${url}`,
      }));
    }, [getList]);

    const maxSizeMB = 50;
    const maxSize = maxSizeMB * 1024 * 1024;
    const maxFiles = multiple ? 20 : 1;

    const _fileUpload = useFileUpload({
      accept: acceptString,
      maxSize,
      multiple,
      maxFiles,
      initialFiles,
    });

    const files = _fileUpload[0].files;
    const isDragging = _fileUpload[0].isDragging;
    const errors = _fileUpload[0].errors;

    const handleDragEnter = _fileUpload[1].handleDragEnter;
    const handleDragLeave = _fileUpload[1].handleDragLeave;
    const handleDragOver = _fileUpload[1].handleDragOver;
    const handleDrop = _fileUpload[1].handleDrop;
    const openFileDialog = _fileUpload[1].openFileDialog;
    const removeFile = _fileUpload[1].removeFile;
    const getInputProps = _fileUpload[1].getInputProps;
    const clearErrors = _fileUpload[1].clearErrors;

    const idToUrl = useRef<Record<string, string>>(Object.fromEntries(initialFiles.map((f) => [f.id, f.url])));
    const initialPreviewById = useRef<Record<string, string>>(Object.fromEntries(initialFiles.map((f) => [f.id, f.url])));
    const uploadedKeyById = useRef<Record<string, string>>({});

    const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
    const [topError, setTopError] = useState<string | null>(null);
    const [showSelectableMedia, setShowSelectableMedia] = useState(false);

    const [fileOrder, setFileOrder] = useState<string[]>([]);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
    );

    useEffect(() => {
      const currentFileIds = files.map((f) => f.id as string);
      setFileOrder((prevOrder) => {
        if (prevOrder.length === 0) {
          return currentFileIds;
        }

        const prevSet = new Set(prevOrder);
        const currentSet = new Set(currentFileIds);

        if (
          prevSet.size !== currentSet.size ||
          ![...prevSet].every((id) => currentSet.has(id))
        ) {
          const existingIds = prevOrder.filter((id) => currentSet.has(id));
          const newIds = currentFileIds.filter((id) => !prevSet.has(id));
          return [...existingIds, ...newIds];
        }
        return prevOrder;
      });
    }, [files]);

    const orderedFiles = useMemo(() => {
      if (fileOrder.length === 0) return files;

      const fileMap = new Map(files.map((file) => [file.id as string, file]));
      return fileOrder
        .map((id) => fileMap.get(id))
        .filter(Boolean) as FileWithPreview[];
    }, [files, fileOrder]);

    useEffect(() => {
      const current = getList();
      if (current.length === 0 && initialFiles.length > 0) {
        setList(initialFiles.map((f) => f.url));
      }
    }, [getList, initialFiles, setList]);

    useEffect(() => {
      setTopError(null);
      clearErrors?.();

      for (const f of files) {
        const id = f.id as string;
        if (idToUrl.current[id]) continue;

        const fallbackValue =
          f.preview ||
          (f.file instanceof File ? "" : ((f.file as InitialFileMeta).url ?? ""));

        if (!fallbackValue) continue;

        idToUrl.current[id] = fallbackValue;
        initialPreviewById.current[id] = fallbackValue;

        const currentUrls = getList();
        const fileIndex = files.findIndex((file) => file.id === id);
        if (fileIndex !== -1) {
          const newUrls = [...currentUrls];
          newUrls[fileIndex] = fallbackValue;
          setList(newUrls.filter(Boolean));
        }
      }
    }, [files, clearErrors, getList, setList]);

    useImperativeHandle(
      ref,
      () => ({
        uploadPendingFiles: async () => {
          const filesToProcess = multiple ? orderedFiles : files;
          const uploadedKeys: string[] = [];
          const resolvedUrls: string[] = [];

          setTopError(null);

          for (const fileEntry of filesToProcess) {
            const id = fileEntry.id as string;

            if (fileEntry.file instanceof File) {
              const hasRemoteUrl = !!idToUrl.current[id] && /^(https?:\/\/)/.test(idToUrl.current[id]);

              if (!hasRemoteUrl) {
                try {
                  setBusyIds((p) => ({ ...p, [id]: true }));
                  const { key, secureUrl } = await uploadToCloudinaryViaPresign(
                    fileEntry.file,
                    keyPrefix ?? "uploads",
                  );
                  idToUrl.current[id] = secureUrl;
                  uploadedKeyById.current[id] = key;
                } catch (e: unknown) {
                  const errorMessage =
                    typeof e === "object" && e !== null && "message" in e
                      ? (e as { message?: string }).message
                      : undefined;
                  setTopError(errorMessage ?? "Failed to upload media.");
                  throw e;
                } finally {
                  setBusyIds((p) => {
                    const { [id]: _omit, ...rest } = p;
                    return rest;
                  });
                }
              }

              if (uploadedKeyById.current[id]) {
                uploadedKeys.push(uploadedKeyById.current[id]);
              }
            }

            const resolvedUrl =
              idToUrl.current[id] || (fileEntry.file instanceof File ? fileEntry.preview || "" : ((fileEntry.file as InitialFileMeta).url ?? ""));

            if (resolvedUrl) {
              resolvedUrls.push(resolvedUrl);
            }
          }

          setList(resolvedUrls);

          return {
            urls: resolvedUrls,
            uploadedKeys: Array.from(new Set(uploadedKeys)),
          };
        },
        revertUncommittedUploads: () => {
          const filesToProcess = multiple ? orderedFiles : files;
          const revertedUrls = filesToProcess
            .map((fileEntry) => {
              const id = fileEntry.id as string;
              if (fileEntry.file instanceof File) {
                const fallback = initialPreviewById.current[id] || fileEntry.preview || "";
                if (fallback) {
                  idToUrl.current[id] = fallback;
                }
                delete uploadedKeyById.current[id];
                return fallback;
              }
              return idToUrl.current[id] || (fileEntry.file as InitialFileMeta).url || "";
            })
            .filter(Boolean);

          setList(revertedUrls);
        },
        getCurrentUrls: () => getList(),
      }),
      [files, getList, keyPrefix, multiple, orderedFiles, setList],
    );

    const handleRemove = useCallback(
      (id: string) => {
        const url = idToUrl.current[id];
        if (url) {
          setList(getList().filter((u) => u !== url));
          delete idToUrl.current[id];
          delete initialPreviewById.current[id];
          delete uploadedKeyById.current[id];
        }
        removeFile(id);
      },
      [getList, removeFile, setList],
    );

    const handleSelectMedia = useCallback(
      (media: SelectableMedia) => {
        const currentUrls = getList();

        if (multiple) {
          if (currentUrls.includes(media.url)) {
            const newUrls = currentUrls.filter((url) => url !== media.url);
            setList(newUrls);

            Object.keys(idToUrl.current).forEach((id) => {
              if (idToUrl.current[id] === media.url) {
                delete idToUrl.current[id];
              }
            });
          } else {
            const newUrls = [...currentUrls, media.url];
            setList(newUrls);

            const selectedId = `selected-${media.id}-${Date.now()}`;
            idToUrl.current[selectedId] = media.url;
          }
        } else {
          setList([media.url]);
          setShowSelectableMedia(false);

          idToUrl.current = {};
          const selectedId = `selected-${media.id}-${Date.now()}`;
          idToUrl.current[selectedId] = media.url;
        }
      },
      [getList, setList, multiple],
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;

        const activeIndex = orderedFiles.findIndex((f) => f.id === active.id);
        const overIndex = orderedFiles.findIndex((f) => f.id === over?.id);

        const currentUrls = getList();

        if (currentUrls.length !== files.length) {
          return;
        }

        const idToUrlMap: Record<string, string> = {};
        files.forEach((file, index) => {
          const fileId = file.id as string;
          const url = currentUrls[index];
          if (url) {
            idToUrlMap[fileId] = url;
            idToUrl.current[fileId] = url;
          }
        });

        const newFileOrder = arrayMove([...fileOrder], activeIndex, overIndex);
        setFileOrder(newFileOrder);

        const reorderedUrls = newFileOrder.map((fileId) => idToUrlMap[fileId]).filter(Boolean);

        setList(reorderedUrls);
      },
      [orderedFiles, getList, setList, fileOrder, files],
    );

    return (
      <Controller
        name={name}
        render={({ fieldState }) => (
          <Field className={className} data-invalid={fieldState.invalid}>
            <FieldLabel>{label}</FieldLabel>
            <FieldContent>
              <div className={cn("flex flex-col gap-2", viewClass)}>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  data-dragging={isDragging || undefined}
                  data-files={files.length > 0 || undefined}
                  className={cn(
                    "border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-files:justify-center has-[input:focus]:ring-[3px]",
                  )}
                >
                  <input {...getInputProps()} className="sr-only" aria-label="Upload media file" />

                  {files.length > 0 ? (
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-medium">Uploaded Files ({files.length})</h3>
                        <div className="flex gap-2">
                          {sortedSelectableMedia.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSelectableMedia(!showSelectableMedia)}
                              disabled={files.length >= maxFiles}
                            >
                              <ImageIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
                              Select Media
                            </Button>
                          )}
                          <Button type="button" variant="outline" size="sm" onClick={openFileDialog} disabled={files.length >= maxFiles}>
                            <UploadIcon className="-ms-0.5 size-3.5 opacity-60" aria-hidden="true" />
                            {multiple ? "Add more" : "Replace"}
                          </Button>
                        </div>
                      </div>

                      {showSelectableMedia && sortedSelectableMedia.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium mb-2">Select from available media:</h4>
                          <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8 max-h-40 overflow-y-auto">
                            {sortedSelectableMedia.map((m) => {
                              const isSelected = getList().includes(m.url);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  className={cn(
                                    "relative aspect-square rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 h-16 w-16",
                                    isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                                  )}
                                  onClick={() => handleSelectMedia(m)}
                                >
                                  <img src={m.url} alt={m.alt || "Selectable media"} className="absolute inset-0 w-full h-full rounded-[inherit] object-cover" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {multiple ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={orderedFiles.map((f) => f.id as string)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                              {orderedFiles.map((file) => {
                                const id = file.id as string;
                                const isBusy = !!busyIds[id];

                                return <SortableMediaItem key={id} file={file} onDelete={() => handleRemove(id)} isBusy={isBusy} />;
                              })}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                          {files.map((file) => {
                            const id = file.id as string;
                            const isBusy = !!busyIds[id];
                            const src = file.preview || "";

                            return (
                              <div key={id} className="bg-accent relative aspect-square rounded-md">
                                {src ? (
                                  file.file instanceof File && file.file.type.startsWith("video/") ? (
                                    <video src={src} controls className="rounded-[inherit] object-cover w-full h-full" />
                                  ) : (
                                  <img src={src} alt={file.file?.name ?? "media"} className="absolute inset-0 w-full h-full rounded-[inherit] object-cover" />
                                  )
                                ) : (
                                  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">Preview not available</div>
                                )}

                                <Button onClick={() => handleRemove(id)} size="icon" className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none z-30" aria-label="Remove media" disabled={isBusy}>
                                  <XIcon className="size-3.5" />
                                </Button>

                                {isBusy && (
                                  <div className="absolute inset-0 grid place-items-center rounded-[inherit] bg-foreground/30 text-[11px] text-primary-foreground z-20">Uploading…</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                      <div className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">
                        <ImageIcon className="size-4 opacity-60" />
                      </div>
                      <p className="mb-1.5 text-sm font-medium">Drop your media here</p>
                      <p className="text-muted-foreground text-xs">Accept: {acceptTypes.join(", ")}</p>
                      <div className="flex gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={openFileDialog}>
                          <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                          {multiple ? "Upload files" : "Upload file"}
                        </Button>
                        {sortedSelectableMedia.length > 0 && (
                          <Button type="button" variant="outline" onClick={() => setShowSelectableMedia(true)}>
                            <ImageIcon className="-ms-1 opacity-60" aria-hidden="true" />
                            Select Media
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {files.length === 0 && showSelectableMedia && sortedSelectableMedia.length > 0 && (
                  <div className="border border-dashed rounded-xl p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Select from available media:</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowSelectableMedia(false)}>
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8 max-h-40 overflow-y-auto">
                      {sortedSelectableMedia.map((m) => {
                        const isSelected = getList().includes(m.url);
                        return (
                          <button key={m.id} type="button" className={cn("relative aspect-square rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 h-16 w-16", isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50")} onClick={() => handleSelectMedia(m)}>
                          <img src={m.url} alt={m.alt || "Selectable media"} className="absolute inset-0 w-full h-full rounded-[inherit] object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(errors.length > 0 || topError) && (
                  <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{topError ?? errors[0]}</span>
                  </div>
                )}
              </div>
            </FieldContent>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    );
  },
);

export default MediaUploaderField;