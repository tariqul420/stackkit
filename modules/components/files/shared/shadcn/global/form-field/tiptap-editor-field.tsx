import TiptapEditor from "@/components/tiptap-editor/tiptap-editor";
import {
    Field,
    FieldContent,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Controller } from "react-hook-form";

interface Props {
  name: string;
  label: string;
  className?: string;
}

export default function TiptapEditorField({ name, label, className }: Props) {
  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <Field className={className} data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <FieldContent>
            <TiptapEditor
              content={field.value}
              onChange={field.onChange}
              className="min-h-50 bg-input/50 rounded-md border px-3 py-2 focus:border-primary"
            />
          </FieldContent>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}