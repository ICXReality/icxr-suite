import { Props } from "payload/components/fields/Text";
import { SelectInput, useField } from "payload/components/forms";
import { OptionObject } from "payload/dist/fields/config/types";
import React, { useState } from "react";

const EventTimeCalculator: React.FC<Props> = ({
  path,
  label,
  required,
  name,
}) => {
  if (!path) return null;

  // const discord = useDiscordContext();
  const { value, setValue } = useField<string | undefined>({ path: path });
  const [channelOptions, setGuildOptions] = useState<OptionObject[]>([]);

  return (
    <SelectInput
      name={name}
      path={path}
      label={label}
      required={required}
      value={value}
      onChange={(o) => setValue(o.value)}
      options={channelOptions}
    />
  );
};

export default EventTimeCalculator;