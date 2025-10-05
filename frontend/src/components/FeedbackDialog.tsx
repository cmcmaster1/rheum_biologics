import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Alert
} from '@mui/material';
import { sendFeedback } from '../api/feedback';

type FeedbackType = 'bug' | 'feature' | 'new_medication' | 'new_indication';

export const FeedbackDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Send Feedback</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="feedback-type-label">Type</InputLabel>
            <Select
              labelId="feedback-type-label"
              value={type}
              label="Type"
              onChange={(e: SelectChangeEvent) => setType(e.target.value as FeedbackType)}
            >
              <MenuItem value="bug">Bug report</MenuItem>
              <MenuItem value="feature">Feature request</MenuItem>
              <MenuItem value="new_medication">New medication</MenuItem>
              <MenuItem value="new_indication">New indication</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Message"
            multiline
            minRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue or request..."
            fullWidth
          />

          <TextField
            label="Contact (optional email)"
            type="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@example.com"
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Thank you! Feedback sent.</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Close
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting || !message.trim()}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

