import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import UploadZone from './UploadZone';
import EnhancedDocumentCard from './EnhancedDocumentCard';
import { aiSimplifiedAPI } from '../api/aiSimplified';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MedicalDocumentsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // State for documents
  const [medicalHistoryReports, setMedicalHistoryReports] = useState([]);
  const [aiSimplifiedReports, setAiSimplifiedReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    processedReports: 0,
    pendingReports: 0
  });

  // Additional form data for uploads
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    notes: ''
  });

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const fetchAllDocuments = async () => {
    setLoading(true);
    try {
      const data = await aiSimplifiedAPI.getMedicalHistoryForAI();
      setMedicalHistoryReports(data.medicalHistoryReports || []);
      setAiSimplifiedReports(data.aiSimplifiedReports || []);
      
      // Calculate stats
      const total = data.totalReports || 0;
      const processed = [...(data.medicalHistoryReports || []), ...(data.aiSimplifiedReports || [])]
        .filter(doc => doc.details?.aiSummary).length;
      
      setStats({
        totalReports: total,
        processedReports: processed,
        pendingReports: total - processed
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadFormData.title || file.name);
    formData.append('date', uploadFormData.date);
    if (uploadFormData.doctor) formData.append('doctor', uploadFormData.doctor);
    if (uploadFormData.notes) formData.append('notes', uploadFormData.notes);

    setUploading(true);
    try {
      const result = await aiSimplifiedAPI.uploadDocument(formData);
      toast.success('Document uploaded and processed successfully!');
      
      // Reset form and refresh documents
      setFile(null);
      setUploadFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        doctor: '',
        notes: ''
      });
      
      await fetchAllDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleProcessComplete = () => {
    fetchAllDocuments();
  };

  const getFilteredDocuments = (documents) => {
    if (categoryFilter === 'all') return documents;
    return documents.filter(doc => doc.category === categoryFilter);
  };

  const allDocuments = [...medicalHistoryReports, ...aiSimplifiedReports];
  const filteredMedicalHistory = getFilteredDocuments(medicalHistoryReports);
  const filteredAiSimplified = getFilteredDocuments(aiSimplifiedReports);

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Typography variant="h3" align="center" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
        AI-Simplified Medical Reports
      </Typography>
      
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Upload reports or analyze your existing medical history with AI
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <AssessmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="600">{stats.totalReports}</Typography>
            <Typography color="text.secondary">Total Reports</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e8' }}>
            <AutoAwesomeIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="600">{stats.processedReports}</Typography>
            <Typography color="text.secondary">AI Analyzed</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <HistoryIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="600">{stats.pendingReports}</Typography>
            <Typography color="text.secondary">Pending Analysis</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label="Upload New Report" 
            icon={<CloudUploadIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={`Medical History (${medicalHistoryReports.length})`}
            icon={<HistoryIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={`AI Analyzed (${aiSimplifiedReports.length})`}
            icon={<AutoAwesomeIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Upload Section */}
        <Box sx={{ mb: 4 }}>
          <UploadZone onFileChange={(e) => setFile(e.target.files[0])} />
          
          {file && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Document Details</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Title</InputLabel>
                    <input 
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      placeholder={file.name}
                      value={uploadFormData.title}
                      onChange={(e) => setUploadFormData({...uploadFormData, title: e.target.value})}
                    />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <input 
                      type="date"
                      style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      value={uploadFormData.date}
                      onChange={(e) => setUploadFormData({...uploadFormData, date: e.target.value})}
                    />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <input 
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                    placeholder="Doctor/Clinic Name (optional)"
                    value={uploadFormData.doctor}
                    onChange={(e) => setUploadFormData({...uploadFormData, doctor: e.target.value})}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <input 
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                    placeholder="Notes (optional)"
                    value={uploadFormData.notes}
                    onChange={(e) => setUploadFormData({...uploadFormData, notes: e.target.value})}
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                onClick={handleFileUpload}
                disabled={uploading}
                sx={{ mt: 2 }}
                size="large"
              >
                {uploading ? 'Processing...' : 'Upload & Analyze with AI'}
              </Button>
            </Paper>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Medical History Reports */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Your Medical History Reports</Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Filter by Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="lab">Lab Results</MenuItem>
              <MenuItem value="imaging">Imaging</MenuItem>
              <MenuItem value="prescription">Prescriptions</MenuItem>
              <MenuItem value="visit-summary">Visit Summary</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredMedicalHistory.length > 0 ? (
          filteredMedicalHistory.map((document) => (
            <EnhancedDocumentCard
              key={document._id}
              document={document}
              onProcessComplete={handleProcessComplete}
              showProcessButton={true}
            />
          ))
        ) : (
          <Alert severity="info">
            No medical history reports found. Upload some documents in the Medical History section first.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* AI Simplified Reports */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>AI-Analyzed Reports</Typography>
          <Typography color="text.secondary">
            Reports that have been processed with AI for simplified analysis and recommendations.
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredAiSimplified.length > 0 ? (
          filteredAiSimplified.map((document) => (
            <EnhancedDocumentCard
              key={document._id}
              document={document}
              onProcessComplete={handleProcessComplete}
              showProcessButton={false}
            />
          ))
        ) : (
          <Alert severity="info">
            No AI-analyzed reports yet. Upload documents or process existing ones to see AI analysis.
          </Alert>
        )}
      </TabPanel>
    </Container>
  );
}
