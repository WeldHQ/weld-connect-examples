import { BookOpenText, CogIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useApiKey } from "@/lib/api-key-context";

import { MaskedInput } from "../shared/masked-input";
import { ConnectionStatus } from "./connection-status-indicator";

export default function Header() {
  const { apiKey, setApiKey } = useApiKey();
  return (
    <header className="p-2 gap-2 border-b fixed top-0 left-0 right-0 bg-background z-10">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 lg:col-span-4 flex items-center">
          <span className="truncate font-semibold">
            Weld Connect API Examples
          </span>
        </div>
        <div className="col-span-6 lg:col-span-4 flex lg:justify-center gap-4">
          <div className="w-full max-w-80">
            <MaskedInput
              id="api-key-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              autoComplete="off"
              autoFocus
              defaultMask
            />
          </div>
          <div>
            <ConnectionStatus />
          </div>
        </div>
        <div className="col-span-2 lg:col-span-4 flex justify-end items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://weld.app/docs/api-reference"
              className="gap-1"
              target="_blank"
              rel="noreferrer"
            >
              <CogIcon />
              <span className="hidden lg:inline">API Reference</span>
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://weld.app/docs/weld-connect"
              className="gap-1"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpenText />
              <span className="hidden lg:inline">Developer Guide</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
