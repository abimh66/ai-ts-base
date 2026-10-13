import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote, type CreateNoteInput } from "@/features/note";

const noteFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Body is required"),
});

function validateField(field: keyof CreateNoteInput, value: string): string | undefined {
  const result = noteFormSchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function NoteForm({ onCreated }: { onCreated?: (noteId: string) => void }) {
  const [open, setOpen] = useState(false);
  const createNote = useCreateNote();

  const form = useForm({
    defaultValues: { title: "", body: "" } as CreateNoteInput,
    onSubmit: async ({ value }) => {
      try {
        const note = await createNote.mutateAsync(value);
        toast.success("Note created");
        form.reset();
        setOpen(false);
        onCreated?.(note.id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create the note");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Icon icon={PlusSignIcon} size={16} />
          New note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
          <DialogDescription>
            Write anything. You can enrich it with AI once it is saved.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              validators={{ onBlur: ({ value }) => validateField("title", value) }}
            >
              {(field) => {
                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError}>
                    <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="What is this note about?"
                      aria-invalid={hasError}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {hasError ? (
                      <FieldError
                        errors={field.state.meta.errors.map((error) => ({
                          message: errorMessage(error),
                        }))}
                      />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="body"
              validators={{ onBlur: ({ value }) => validateField("body", value) }}
            >
              {(field) => {
                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={hasError}>
                    <FieldLabel htmlFor={field.name}>Body</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      rows={6}
                      placeholder="Write the note."
                      aria-invalid={hasError}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {hasError ? (
                      <FieldError
                        errors={field.state.meta.errors.map((error) => ({
                          message: errorMessage(error),
                        }))}
                      />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <DialogFooter className="mt-5">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create note"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
