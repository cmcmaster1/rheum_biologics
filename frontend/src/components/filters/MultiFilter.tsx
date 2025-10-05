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
      fullWidth
      options={options}
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      filterSelectedOptions
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const truncatedLabel = option.length > 50 ? `${option.substring(0, 47)}...` : option;
          return (
            <Chip 
              size="small" 
              variant="outlined" 
              label={truncatedLabel}
              title={option} // Show full text on hover
              {...getTagProps({ index })} 
              key={option}
              sx={{ maxWidth: { xs: 160, sm: 200 } }} // Limit chip width for mobile
            />
          );
        })
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
