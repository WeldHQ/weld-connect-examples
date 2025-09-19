import type { ErrorObject } from "ajv";
import { useState } from "react";

import type { JsonSchema } from "@jsonforms/core";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";

export function JsonForm(props: {
  schema: JsonSchema;
  initialData?: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>, errors: ErrorObject[]) => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(
    props.initialData ?? {},
  );
  return (
    <JsonForms
      schema={props.schema}
      data={data}
      renderers={materialRenderers}
      cells={materialCells}
      validationMode="ValidateAndShow"
      onChange={({ data, errors }) => {
        setData(data);
        props.onChange?.(data, errors || []);
      }}
    />
  );
}
