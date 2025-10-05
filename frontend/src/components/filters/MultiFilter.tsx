import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';

type Props = {
  label: string;
  placeholder?: string;
  options: string[];
  value: string[];
  onChange: (values: string[]) => void;
  loading?: boolean;
};

export const MultiFilter = ({ label, placeholder, options, value, onChange, loading }: Props) => {
  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      filterSelectedOptions
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip size="small" variant="outlined" label={option} {...getTagProps({ index })} key={option} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};
