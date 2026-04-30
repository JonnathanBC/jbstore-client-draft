import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { Select } from '~/components/inputs/Select';

type Props = {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  source: string;
}

export const AsyncSelect = ({ value: initialValue = '', onChange, source, name }: Props) => {
  const fetcher = useFetcher();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(source);
    }
  }, [fetcher, source]);

  const items = fetcher.data?.items ?? [];
  const isLoading = fetcher.state === "loading";

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        items={items}
        value={value}
        onChange={handleChange}
        disabled={isLoading}
        placeholder={isLoading ? "Cargando..." : "Selecciona"}
      />
    </>
  );
};
