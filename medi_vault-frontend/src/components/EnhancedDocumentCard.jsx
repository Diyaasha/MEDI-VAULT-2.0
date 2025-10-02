import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Summarize as SummarizeIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  Schedule as ScheduleIcon,
  FindInPage as FindInPageIcon,
  Download as DownloadIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { aiSimplifiedAPI, medicalHistoryAPI } from '../api/aiSimplified';
import { toast } from 'react-toastify';

export default function EnhancedDocumentCard({ 
  document, 
  onProcessComplete,
  showProcessButton = true 
}) {
  const [processing, setProcessing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Extract AI analysis from document details
  const hasAiAnalysis = document.details?.aiSummary;
  const aiAnalysis = {
    summary: document.details?.aiSummary || null,
    keyFindings: document.details?.keyFindings || [],
    suggestions: document.details?.suggestions || [],
    followUp: document.details?.followUp || null,
    processedAt: document.details?.aiProcessedAt,
  };

  const handleProcessDocument = async () => {
    if (!document._id) {
      toast.error('Document ID not found');
      return;
    }

    setProcessing(true);
    try {
      const result = await aiSimplifiedAPI.processExistingDocument(document._id);
      toast.success('Document processed successfully!');
      onProcessComplete?.(result.document);
    } catch (error) {
      console.error('Error processing document:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to process document';
      if (error.message?.includes('Unsupported file type')) {
        errorMessage = 'This file type is not supported for AI analysis. Please upload PDF, Word documents, or images.';
      } else if (error.message?.includes('Failed to extract text')) {
        errorMessage = 'Could not extract text from this document. Please check if the file is valid and not corrupted.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!document.fileUrl || !document._id) {
      toast.error('No file available for download');
      return;
    }

    try {
      const signedUrl = await medicalHistoryAPI.getSignedUrl(document._id);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'lab': 'success',
      'imaging': 'info', 
      'prescription': 'warning',
      'ai-simplified': 'secondary',
      'visit-summary': 'primary',
      'default': 'default'
    };
    return colors[category] || colors.default;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card sx={{ 
      p: 2, 
      m: 2, 
      borderRadius: 4, 
      boxShadow: 3,
      border: hasAiAnalysis ? '2px solid #4caf50' : 'none'
    }}>
      <CardContent>
        {/* Document Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {document.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<DescriptionIcon />} 
                label={document.category || 'Document'} 
                color={getCategoryColor(document.category)}
                variant="outlined" 
                size="small"
              />
              {document.originalFileName && (
                <Chip 
                  label={formatFileSize(document.size)} 
                  variant="outlined" 
                  size="small"
                />
              )}
              {hasAiAnalysis && (
                <Chip 
                  icon={<AutoAwesomeIcon />} 
                  label="AI Analyzed" 
                  color="success" 
                  size="small"
                />
              )}
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
            {document.fileUrl && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                size="small"
              >
                Download
              </Button>
            )}
            {showProcessButton && !hasAiAnalysis && document.fileUrl && (
              <Button
                variant="contained"
                color="primary"
                startIcon={processing ? <CircularProgress size={16} /> : <PsychologyIcon />}
                onClick={handleProcessDocument}
                disabled={processing}
                size="small"
              >
                {processing ? 'Processing (OCR for images may take longer)...' : 'Analyze with AI'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Document Metadata */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Date: {formatDate(document.date)} | 
          {document.doctor && ` Doctor: ${document.doctor} |`}
          {aiAnalysis.processedAt && ` AI Processed: ${formatDate(aiAnalysis.processedAt)}`}
        </Typography>

        {document.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            Notes: {document.notes}
          </Typography>
        )}

        {/* AI Analysis Results */}
        {hasAiAnalysis && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            {/* AI Summary */}
            <Accordion 
              expanded={expanded} 
              onChange={() => setExpanded(!expanded)}
              sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SummarizeIcon color="primary" />
                  <Typography variant="h6">AI Medical Analysis</Typography>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {/* Summary Section */}
                {aiAnalysis.summary && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      📋 Simple Summary
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {aiAnalysis.summary}
                    </Alert>
                  </Box>
                )}

                {/* Key Findings */}
                {aiAnalysis.keyFindings && aiAnalysis.keyFindings.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      🔍 Key Findings
                    </Typography>
                    <List dense>
                      {aiAnalysis.keyFindings.map((finding, index) => {
                        // Handle both string and object formats
                        if (typeof finding === 'string') {
                          return (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon>
                                <FindInPageIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={finding} />
                            </ListItem>
                          );
                        } else if (typeof finding === 'object' && finding.finding) {
                          // New object format from Gemini
                          return (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon>
                                <FindInPageIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={finding.finding || finding.test}
                                secondary={finding.meaning && (
                                  <Typography variant="caption" color="text.secondary">
                                    {finding.value && `Value: ${finding.value} - `}{finding.meaning}
                                  </Typography>
                                )}
                              />
                            </ListItem>
                          );
                        }
                        return null;
                      })}
                    </List>
                  </Box>
                )}

                {/* Suggestions */}
                {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      💡 Recommendations
                    </Typography>
                    <List dense>
                      {aiAnalysis.suggestions.map((suggestion, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon>
                            <LightbulbIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Follow-up */}
                {aiAnalysis.followUp && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      📅 Follow-up Advice
                    </Typography>
                    <Alert severity="warning" icon={<ScheduleIcon />}>
                      {aiAnalysis.followUp}
                    </Alert>
                  </Box>
                )}

                {/* Disclaimer */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    ⚠️ <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only 
                    and should not replace professional medical advice. Always consult with healthcare 
                    providers for medical decisions.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}