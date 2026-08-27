"use client";

import InputField from "@/components/global/form-field/input-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";
import {
  changePasswordZodSchema,
  type IChangePasswordPayload,
} from "@/features/auth/validators/change-password.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AUTH_QUERY_KEYS } from "../queries/auth.queries";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<IChangePasswordPayload>({
    mode: "onTouched",
    resolver: zodResolver(changePasswordZodSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: IChangePasswordPayload) {
    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(
          error.message || "Failed to change password. Please check your details and try again.",
        );
        return;
      }

      toast.success("Password changed successfully!");
      form.reset();
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      onOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one. Password must be at least 8
            characters.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <InputField
                name="currentPassword"
                label="Current Password"
                type="password"
                required
              />
              <InputField
                name="newPassword"
                label="New Password"
                type="password"
                required
                hint="At least 8 characters"
              />
              <InputField
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
