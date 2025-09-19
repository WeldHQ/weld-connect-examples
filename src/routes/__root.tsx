import { Toaster } from "@/components/ui/sonner";
import { TanstackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Header from "../components/app/header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { ApiKeyProvider } from "../lib/api-key-context";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <ApiKeyProvider>
      <Header />
      <div className="pt-14">
        <Outlet />
      </div>
      <Toaster />
      <TanstackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </ApiKeyProvider>
  ),
});
