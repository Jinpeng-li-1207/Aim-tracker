import { SessionForm } from "@/components/training/SessionForm";
export function NewSession({ onDone }: { onDone: () => void }) {
  return <SessionForm onSuccess={onDone} />;
}
