import { Box, Button, Typography } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import React, { useRef } from "react";

const UploadZone = ({ onFileChange }) => {
  const inputRef = useRef();

  return (
    <Box
      sx={{
        border: "2px dashed #1976d2",
        borderRadius: "16px",
        textAlign: "center",
        py: 6,
        mt: 4,
        maxWidth: 600,
        mx: "auto",
      }}
      onClick={() => inputRef.current.click()}
    >
      <InsertDriveFileIcon sx={{ fontSize: 50, color: "#8692a6" }} />
      <Typography variant="h6" mt={2}>Upload Medical Documents</Typography>
      <Typography color="text.secondary" mb={2}>
        Drag and drop your medical reports, lab results, or prescriptions here
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => inputRef.current.click()}>
        Choose Files
      </Button>
      <Typography variant="body2" color="text.secondary" mt={2}>
        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
      </Typography>
      <input
        type="file"
        hidden
        ref={inputRef}
        accept=".pdf,.jpg,.png,.doc,.docx"
        onChange={onFileChange}
      />
    </Box>
  );
};

export default UploadZone;
