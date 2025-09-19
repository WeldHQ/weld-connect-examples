import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { CreateConnectionBridgeResponse } from "@/lib/api/create-connection-bridge";

export function AuthorizeConnectionContainer(props: {
  connectionBridge: CreateConnectionBridgeResponse;
  onSuccess: (state: { connectionId: string }) => void;
}) {
  const onSuccessRef = useRef(props.onSuccess);
  onSuccessRef.current = props.onSuccess;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "auth-success") {
        onSuccessRef.current({ connectionId: event.data.connectionId });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleAuthorizeClick = () => {
    window.open(props.connectionBridge.authorize_url, "_blank");
  };

  return (
    <div className="rounded-md border overflow-clip space-y-6">
      <div className="p-6 space-y-6">
        <p>
          Authorize the connection by clicking the button below. This will open
          a new tab where you can complete the authorization process.
        </p>
        <div className="mt-4">
          <Button onClick={handleAuthorizeClick}>Authorize Connection</Button>
        </div>
      </div>
    </div>
  );
}
