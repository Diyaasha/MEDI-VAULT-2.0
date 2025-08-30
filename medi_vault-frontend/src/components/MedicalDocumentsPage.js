import React, { useState } from "react";
import UploadZone from "./UploadZone";
import DocumentCard from "./DocumentCard";
import { Typography, Container } from "@mui/material";
import { Box } from "@mui/material";


export default function MedicalDocumentsPage() {
  const [file, setFile] = useState(null);
  // Replace with actual fetch/API data in practice
  const documents = [
    {
      title: "Blood Test Results - March 2024",
      type: "Lab Report",
      size: 2.4,
      date: "3/15/2024",
      summary: null,
      isSimplified: false,
    },
    {
      title: "X-Ray Chest Report",
      type: "Imaging",
      size: 5.8,
      date: "3/10/2024",
      summary: "Chest X-ray appears normal. No signs of infection, fluid buildup, or structural abnormalities. Heart size is normal. Lung fields are clear bilaterally.",
      isSimplified: true,
    },
    // ...more docs
  ];

  const handleFileChange = (e) => setFile(e.target.files[0]);

  return (
    <Container>
      <Typography variant="h3" align="center" mt={8} mb={3}>
        Your Medical Documents
      </Typography>
      <UploadZone onFileChange={handleFileChange} />
      <Box sx={{ py: 6 }}>
        {documents.map((doc, idx) => (
          <DocumentCard key={idx} {...doc} />
        ))}
      </Box>
    </Container>
  );
}
