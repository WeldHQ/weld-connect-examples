import { CreateEltSyncFlowContainer } from "@/components/app/create-elt-sync-flow";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div>
      <CreateEltSyncFlowContainer />
    </div>
  );
}
