import { CircleCheck, LoaderCircle, Unplug } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiKeyValue } from "@/lib/api-key-context";
import { listIntegrations } from "@/lib/api/list-integrations";
import { useQuery } from "@tanstack/react-query";

export function ConnectionStatus() {
  const apiKey = useApiKeyValue();
  const { data: isValid, isFetching } = useQuery({
    queryKey: ["validate-api-key", apiKey],
    queryFn: async () => {
      await listIntegrations({ apiKey });
      return true;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });

  let status = {
    icon: <Unplug className="text-red-600" />,
    tooltip: "Not connected to Weld Connect API. Please enter a valid API key.",
  };
  if (isFetching) {
    status = {
      icon: <LoaderCircle className="animate-spin" />,
      tooltip: "Validating API key...",
    };
  } else if (isValid) {
    status = {
      icon: <CircleCheck className="text-green-600" />,
      tooltip: "Connected to Weld Connect API.",
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="h-9 w-9 flex items-center justify-center border rounded-md">
          {status.icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{status.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
