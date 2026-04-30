import { useFetcher } from "react-router";
import { useEffect } from "react";

import { Select } from '~/components/inputs/Select';

type Props = {
  name: string;
  value: string;
  onChange?: (value: string) => void;
  source: string;
}

export const AsyncSelect = ({ value, onChange, source, name }: Props) => {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(source);
    }
  }, [fetcher]);

  const items = fetcher.data?.items ?? [];
  const isLoading = fetcher.state === "loading";

  return (
    <>
      <input type="hidden" name={name} value={value} />

      <Select
        items={items}
        value={value}
        onChange={onChange}
        disabled={isLoading}
        placeholder={isLoading ? "Cargando familias..." : "Selecciona una familia"}
        />
      </>
  );
};