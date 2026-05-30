// AsyncSearchSelect.tsx

import { useState, useEffect } from 'react';
import type {
  Control,
  FieldValues,
  Path,
} from 'react-hook-form';

import {
  Controller,
  useWatch,
} from 'react-hook-form';

import {
  Autocomplete,
  CircularProgress,
  TextField,
} from '@mui/material';

interface AsyncSearchSelectProps<
  TOption extends { _id: string },
  TFormValues extends FieldValues
> {
  name: Path<TFormValues>;
  control: Control<TFormValues>;
  label: string;
  fetchFn: (query: string) => Promise<TOption[]>;
  getOptionLabel: (option: TOption) => string;
  minChars?: number;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export function AsyncSearchSelect<
  TOption extends { _id: string },
  TFormValues extends FieldValues
>({
  name,
  control,
  label,
  fetchFn,
  getOptionLabel,
  minChars = 3,
  debounceMs = 400,
  placeholder = '',
  disabled = false,
  error = false,
  helperText = '',
}: AsyncSearchSelectProps<TOption, TFormValues>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<TOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TOption | null>(null);

  const fieldValue = useWatch({
    control,
    name,
  });

  // Reset selected option and search query if field value is cleared
  useEffect(() => {
    if (!fieldValue) {
      setSelectedOption(null);
      setSearchQuery('');
    }
  }, [fieldValue]);

  // Sync selectedOption when fieldValue changes and options are available
  useEffect(() => {
    if (fieldValue && (!selectedOption || selectedOption._id !== fieldValue)) {
      const found = options.find((opt) => opt._id === fieldValue);
      if (found) {
        setSelectedOption(found);
      }
    }
  }, [fieldValue, options, selectedOption]);

  useEffect(() => {
    if (searchQuery.length < minChars) {
      setOptions([]);
      return;
    }

    setLoading(true);

    const handler = setTimeout(async () => {
      try {
        const results = await fetchFn(searchQuery);
        setOptions(results || []);
      } catch (err) {
        console.error('Failed to fetch options:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchFn, minChars, debounceMs]);

  const displayOptions = [...options];

  if (
    selectedOption &&
    !displayOptions.some(
      (opt) => opt._id === selectedOption._id,
    )
  ) {
    displayOptions.push(selectedOption);
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          disabled={disabled}
          filterOptions={(x) => x}
          options={displayOptions}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(option, val) =>
            option._id === val._id
          }
          loading={loading}
          value={selectedOption}
          onChange={(_, newValue) => {
            setSelectedOption(newValue);
            field.onChange(newValue?._id || '');
          }}
          onInputChange={(_, newInputValue, reason) => {
            if (
              reason === 'input' ||
              reason === 'clear'
            ) {
              setSearchQuery(newInputValue);
            }
          }}
          noOptionsText={
            searchQuery.length < minChars
              ? `Type at least ${minChars} characters to search`
              : 'No results found'
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              error={error || !!fieldState.error}
              helperText={
                helperText || fieldState.error?.message
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress
                        color="inherit"
                        size={20}
                      />
                    ) : null}

                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={styles.autocomplete}
        />
      )}
    />
  );
}

const styles = {
  autocomplete: {
    mb: 2,
    width: '100%',
  },
} as const;