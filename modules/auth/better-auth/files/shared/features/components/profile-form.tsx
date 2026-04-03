"use client";

import InputField from "@/components/global/form-field/input-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUpdateProfileMutation } from "@/features/auth/queries/auth.mutations";
import {
  profileZodSchema,
  type IProfilePayload,
} from "@/features/auth/validators/profile.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import ChangePasswordDialog from "./change-password-dialog";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  createdAt?: Date | string;
}

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const mutation = useUpdateProfileMutation();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const form = useForm<IProfilePayload>({
    mode: "onTouched",
    resolver: zodResolver(profileZodSchema),
    defaultValues: {
      name: user.name || "",
      image: user.image || "",
    },
  });

  const imageValue = useWatch({ control: form.control, name: "image" });
  const nameValue = useWatch({ control: form.control, name: "name" });

  async function onSubmit(values: IProfilePayload) {
    try {
      await mutation.mutateAsync(values);
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("image", reader.result as string);
      toast.info("Image loaded. Click 'Save Changes' to update.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border bg-card p-6"
      >
        <div>
          <h2 className="mb-2 text-xl font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Update your personal details and profile picture
          </p>
        </div>

        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={imageValue}
                alt={nameValue}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-2xl">
                {nameValue?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
            >
              <Camera className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={mutation.isPending}
              />
            </label>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Profile Picture</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>

        {/* Name Field */}
        <InputField
          name="name"
          label="Full Name"
          placeholder="Enter your full name"
          disabled={mutation.isPending}
        />

        {/* Email Field (read-only) */}
        <div className="space-y-2">
          <InputField
            label="Email Address"
            placeholder="your.email@example.com"
            type="email"
            value={user.email || ""}
            disabled
            className="cursor-not-allowed opacity-70"
            hint="Email cannot be changed. Contact support if needed."
          />
        </div>

        <Separator className="my-6" />

        {/* Security Section */}
        <div>
          <h3 className="mb-2 text-lg font-semibold">Security</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Manage your password and account security
          </p>

          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed recently
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordDialog(true)}
              disabled={mutation.isPending}
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => {
              form.reset({ name: user.name || "", image: user.image || "" });
              toast.info("Changes discarded");
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>

        <ChangePasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
        />
      </form>
    </FormProvider>
  );
}
