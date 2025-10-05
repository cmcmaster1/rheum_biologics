import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Alert } from '@mui/material';
import { sendFeedback } from '../api/feedback';
export const FeedbackDialog = ({ open, onClose }) => {
    const [type, setType] = useState('bug');
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
            await sendFeedback({ type, message, contact: contact || undefined });
            setSuccess(true);
            setMessage('');
            setContact('');
        }
        catch (e) {
            setError(e?.response?.data?.message || 'Failed to send feedback');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleClose = () => {
        setError(null);
        setSuccess(false);
        onClose();
    };
    return (_jsxs(Dialog, { open: open, onClose: handleClose, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: "Send Feedback" }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "feedback-type-label", children: "Type" }), _jsxs(Select, { labelId: "feedback-type-label", value: type, label: "Type", onChange: (e) => setType(e.target.value), children: [_jsx(MenuItem, { value: "bug", children: "Bug report" }), _jsx(MenuItem, { value: "feature", children: "Feature request" }), _jsx(MenuItem, { value: "new_medication", children: "New medication" }), _jsx(MenuItem, { value: "new_indication", children: "New indication" })] })] }), _jsx(TextField, { label: "Message", multiline: true, minRows: 4, value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Describe the issue or request...", fullWidth: true }), _jsx(TextField, { label: "Contact (optional email)", type: "email", value: contact, onChange: (e) => setContact(e.target.value), placeholder: "you@example.com", fullWidth: true }), error && _jsx(Alert, { severity: "error", children: error }), success && _jsx(Alert, { severity: "success", children: "Thank you! Feedback sent." })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleClose, disabled: submitting, children: "Close" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: submitting || !message.trim(), children: "Send" })] })] }));
};
