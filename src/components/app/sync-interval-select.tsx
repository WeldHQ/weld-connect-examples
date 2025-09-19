import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SyncIntervalSelect(props: {
  value: string;
  onChange: (cronExpresion: string) => void;
}) {
  return (
    <Select
      name="sync-interval-select"
      value={props.value}
      onValueChange={props.onChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a sync interval" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sync Interval</SelectLabel>
          <SelectItem value="0 0 * * *">Every day</SelectItem>
          <SelectItem value="0 */12 * * *">Every 12 hours</SelectItem>
          <SelectItem value="0 * * * *">Every hour</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
