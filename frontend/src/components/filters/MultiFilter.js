import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';
export const MultiFilter = ({ label, placeholder, options, value, onChange, loading, validateSelection }) => {
    const handleChange = async (_event, newValue) => {
        if (validateSelection) {
            const isValid = await validateSelection(newValue);
            if (!isValid) {
                // Don't update if validation fails
                return;
            }
        }
        onChange(newValue);
    };
    return (_jsx(Autocomplete, { multiple: true, options: options, value: value, onChange: handleChange, filterSelectedOptions: true, renderTags: (tagValue, getTagProps) => tagValue.map((option, index) => {
            const truncatedLabel = option.length > 50 ? `${option.substring(0, 47)}...` : option;
            return (_createElement(Chip, { size: "small", variant: "outlined", label: truncatedLabel, title: option, ...getTagProps({ index }), key: option, sx: { maxWidth: '200px' } }));
        }), renderInput: (params) => (_jsx(TextField, { ...params, label: label, placeholder: placeholder, size: "small", InputProps: {
                ...params.InputProps,
                endAdornment: (_jsxs(_Fragment, { children: [loading ? _jsx(CircularProgress, { color: "inherit", size: 16 }) : null, params.InputProps.endAdornment] }))
            } })) }));
};
