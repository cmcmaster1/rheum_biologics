import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';
export const MultiFilter = ({ label, placeholder, options, value, onChange, loading }) => {
    return (_jsx(Autocomplete, { multiple: true, options: options, value: value, onChange: (_event, newValue) => onChange(newValue), filterSelectedOptions: true, renderTags: (tagValue, getTagProps) => tagValue.map((option, index) => (_createElement(Chip, { size: "small", variant: "outlined", label: option, ...getTagProps({ index }), key: option }))), renderInput: (params) => (_jsx(TextField, { ...params, label: label, placeholder: placeholder, size: "small", InputProps: {
                ...params.InputProps,
                endAdornment: (_jsxs(_Fragment, { children: [loading ? _jsx(CircularProgress, { color: "inherit", size: 16 }) : null, params.InputProps.endAdornment] }))
            } })) }));
};
