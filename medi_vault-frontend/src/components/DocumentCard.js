import { Box, Typography, Button, Chip, Card, CardContent } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import SummarizeIcon from "@mui/icons-material/Summarize";

export default function DocumentCard({ title, type, size, date, summary, isSimplified }) {
  return (
    <Card sx={{ p: 2, m: 2, borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 1 }}>
          <Chip icon={<DescriptionIcon />} label={type} color="primary" variant="outlined" />
          <Chip label={`${size} MB`} variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Uploaded on {date}
        </Typography>
        {summary && (
          <Box sx={{ my: 2, p: 2, bgColor: "#e7f7ee", borderRadius: 2 }}>
            <Chip icon={<SummarizeIcon />} label="AI Summary" color="success" />
            <Typography variant="body2" mt={1}>{summary}</Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="outlined">Download</Button>
          {isSimplified ? (
            <Button variant="contained" color="success">Simplified</Button>
          ) : (
            <Button variant="contained" color="primary">Simplify</Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
