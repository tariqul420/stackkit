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
import { useChangePasswordMutation } from "@/features/auth/queries/auth.mutations";
import {
  changePasswordZodSchema,
  type IChangePasswordPayload,
} from "@/features/auth/validators/change-password.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const mutation = useChangePasswordMutation();

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
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
      onOpenChange(false);
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one. Password must be
            at least 8 characters.
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
                disabled={mutation.isPending}
              />
              <InputField
                name="newPassword"
                label="New Password"
                type="password"
                required
                disabled={mutation.isPending}
                hint="At least 8 characters"
              />
              <InputField
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                required
                disabled={mutation.isPending}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
