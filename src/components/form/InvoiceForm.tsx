import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  TextField, Button, Box, Typography, Container, Paper, Grid, Tabs, Tab, MenuItem, Divider, InputAdornment, IconButton, Link
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import CommentIcon from '@mui/icons-material/Comment';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const vendorOptions = [
  { label: 'A-1 Exterminators', address: '550 Main St., Lynn' },
  { label: 'Acme Corp', address: '123 Main St., City' },
];
const poOptions = ['PO-1001', 'PO-1002'];
const paymentTermsOptions = ['Net 30', 'Net 60', 'Due on Receipt'];
const departmentOptions = ['Finance', 'IT', 'HR'];
const accountOptions = ['Account 1', 'Account 2'];
const locationOptions = ['Boston', 'New York'];

const formSchema = Yup.object().shape({
  vendor: Yup.string().required('Vendor is required'),
  poNumber: Yup.string().required('Purchase Order Number is required'),
  invoiceNumber: Yup.string().required('Invoice number is required'),
  invoiceDate: Yup.date().required('Invoice date is required'),
  totalAmount: Yup.number().required('Total amount is required').min(0),
  paymentTerms: Yup.string().required('Payment terms are required'),
  invoiceDueDate: Yup.date().required('Invoice due date is required'),
  glPostDate: Yup.date().required('GL post date is required'),
  invoiceDescription: Yup.string().required('Invoice description is required'),
  expenseDetails: Yup.array().of(
    Yup.object().shape({
      lineAmount: Yup.number().required('Line amount is required').min(0),
      department: Yup.string().required('Department is required'),
      account: Yup.string().required('Account is required'),
      location: Yup.string().required('Location is required'),
      description: Yup.string().required('Description is required'),
    })
  ),
  comments: Yup.string(),
});

const initialValues = {
  vendor: '',
  poNumber: '',
  invoiceNumber: '',
  invoiceDate: '',
  totalAmount: '',
  paymentTerms: '',
  invoiceDueDate: '',
  glPostDate: '',
  invoiceDescription: '',
  expenseDetails: [
    { lineAmount: '', department: '', account: '', location: '', description: '' },
  ],
  comments: '',
};

const InvoiceForm: React.FC = () => {
  const { logout } = useAuth();
  const [pdfFile, setPdfFile] = useState<string | null>(localStorage.getItem('invoicePdf'));
  const [numPages, setNumPages] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [vendorAddress, setVendorAddress] = useState('');

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfFile(e.target?.result as string);
        localStorage.setItem('invoicePdf', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const selected = vendorOptions.find(v => v.label === e.target.value);
    setVendorAddress(selected ? selected.address : '');
    setFieldValue('vendor', e.target.value);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 2, background: 'transparent' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Create New Invoice
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label={<span style={{ color: tab === 0 ? '#1976d2' : undefined, fontWeight: 600 }}>Vendor Details</span>} />
          <Tab label={<span style={{ color: tab === 1 ? '#1976d2' : undefined, fontWeight: 600 }}>Invoice Details</span>} />
          <Tab label={<span style={{ color: tab === 2 ? '#1976d2' : undefined, fontWeight: 600 }}>Comments</span>} />
        </Tabs>
        <Grid container spacing={3}>
          {/* Left: PDF Upload */}
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ height: '100%', minHeight: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cfd8dc', boxShadow: 'none', p: 3, background: '#fafbfc' }}>
              {!pdfFile ? (
                <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Upload Your Invoice
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    To auto-populate fields and save time
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box sx={{ background: '#e3f0ff', borderRadius: '50%', p: 2 }}>
                      <UploadFileIcon sx={{ fontSize: 80, color: '#1976d2' }} />
                    </Box>
                  </Box>
                  <input
                    accept="application/pdf"
                    type="file"
                    onChange={handlePdfUpload}
                    style={{ display: 'none' }}
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload">
                    <Button variant="outlined" component="span" startIcon={<UploadFileIcon />} sx={{ mb: 1 }}>
                      Upload File
                    </Button>
                  </label>
                  <Typography variant="body2" sx={{ mt: 1, color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}>
                    Click to upload <span style={{ color: '#90a4ae' }}>or Drag and drop</span>
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%' }}>
                  <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page key={`page_${index + 1}`} pageNumber={index + 1} width={350} />
                    ))}
                  </Document>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right: Form Sections */}
          <Grid item xs={12} md={7}>
            <Formik
              initialValues={initialValues}
              validationSchema={formSchema}
              onSubmit={(values) => {
                localStorage.setItem('invoiceData', JSON.stringify(values));
              }}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form>
                  {tab === 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon sx={{ color: '#1976d2', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Vendor Details
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Vendor Information
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="vendor"
                            label="Vendor *"
                            value={values.vendor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>,) => handleVendorChange(e, setFieldValue)}
                            error={touched.vendor && Boolean(errors.vendor)}
                            helperText={touched.vendor && errors.vendor}
                          >
                            {vendorOptions.map(option => (
                              <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>
                            ))}
                          </Field>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Link href="#" underline="hover" sx={{ fontSize: 14, mt: 2, display: 'inline-block' }}>
                            View Vendor Details
                          </Link>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                            {vendorAddress || ' '}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DescriptionIcon sx={{ color: '#1976d2', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Invoice Details
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        General Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="poNumber"
                            label="Purchase Order Number *"
                            error={touched.poNumber && Boolean(errors.poNumber)}
                            helperText={touched.poNumber && errors.poNumber}
                          >
                            {poOptions.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Field>
                        </Grid>
                      </Grid>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                        Invoice Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="invoiceNumber"
                            label="Invoice Number *"
                            error={touched.invoiceNumber && Boolean(errors.invoiceNumber)}
                            helperText={touched.invoiceNumber && errors.invoiceNumber}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            type="date"
                            name="invoiceDate"
                            label="Invoice Date *"
                            InputLabelProps={{ shrink: true }}
                            error={touched.invoiceDate && Boolean(errors.invoiceDate)}
                            helperText={touched.invoiceDate && errors.invoiceDate}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="totalAmount"
                            label="Total Amount *"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                            }}
                            error={touched.totalAmount && Boolean(errors.totalAmount)}
                            helperText={touched.totalAmount && errors.totalAmount}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="paymentTerms"
                            label="Payment Terms *"
                            error={touched.paymentTerms && Boolean(errors.paymentTerms)}
                            helperText={touched.paymentTerms && errors.paymentTerms}
                          >
                            {paymentTermsOptions.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Field>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            type="date"
                            name="invoiceDueDate"
                            label="Invoice Due Date *"
                            InputLabelProps={{ shrink: true }}
                            error={touched.invoiceDueDate && Boolean(errors.invoiceDueDate)}
                            helperText={touched.invoiceDueDate && errors.invoiceDueDate}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            type="date"
                            name="glPostDate"
                            label="GL Post Date *"
                            InputLabelProps={{ shrink: true }}
                            error={touched.glPostDate && Boolean(errors.glPostDate)}
                            helperText={touched.glPostDate && errors.glPostDate}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="invoiceDescription"
                            label="Invoice Description *"
                            multiline
                            rows={2}
                            error={touched.invoiceDescription && Boolean(errors.invoiceDescription)}
                            helperText={touched.invoiceDescription && errors.invoiceDescription}
                          />
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Expense Details
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                          ${values.expenseDetails.reduce((sum, ed) => sum + Number(ed.lineAmount || 0), 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <FieldArray name="expenseDetails">
                        {({ push, remove }) => (
                          <>
                            {values.expenseDetails.map((_, idx) => (
                              <Grid container spacing={2} key={idx} alignItems="center">
                                <Grid item xs={12} sm={3}>
                                  <Field
                                    as={TextField}
                                    fullWidth
                                    name={`expenseDetails[${idx}].lineAmount`}
                                    label="Line Amount *"
                                    type="number"
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                      endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                                    }}
                                    error={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).lineAmount &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      Boolean((errors.expenseDetails[idx] as any).lineAmount)
                                    }
                                    helperText={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).lineAmount &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      (errors.expenseDetails[idx] as any).lineAmount
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Field
                                    as={TextField}
                                    select
                                    fullWidth
                                    name={`expenseDetails[${idx}].department`}
                                    label="Department *"
                                    error={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).department &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      Boolean((errors.expenseDetails[idx] as any).department)
                                    }
                                    helperText={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).department &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      (errors.expenseDetails[idx] as any).department
                                    }
                                  >
                                    {departmentOptions.map(option => (
                                      <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                  </Field>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Field
                                    as={TextField}
                                    select
                                    fullWidth
                                    name={`expenseDetails[${idx}].account`}
                                    label="Account *"
                                    error={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).account &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      Boolean((errors.expenseDetails[idx] as any).account)
                                    }
                                    helperText={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).account &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      (errors.expenseDetails[idx] as any).account
                                    }
                                  >
                                    {accountOptions.map(option => (
                                      <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                  </Field>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Field
                                    as={TextField}
                                    select
                                    fullWidth
                                    name={`expenseDetails[${idx}].location`}
                                    label="Location *"
                                    error={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).location &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      Boolean((errors.expenseDetails[idx] as any).location)
                                    }
                                    helperText={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).location &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      (errors.expenseDetails[idx] as any).location
                                    }
                                  >
                                    {locationOptions.map(option => (
                                      <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                  </Field>
                                </Grid>
                                <Grid item xs={12} sm={9}>
                                  <Field
                                    as={TextField}
                                    fullWidth
                                    name={`expenseDetails[${idx}].description`}
                                    label="Description *"
                                    error={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).description &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      Boolean((errors.expenseDetails[idx] as any).description)
                                    }
                                    helperText={
                                      Array.isArray(touched.expenseDetails) &&
                                      touched.expenseDetails[idx] &&
                                      typeof touched.expenseDetails[idx] === 'object' &&
                                      (touched.expenseDetails[idx] as any).description &&
                                      Array.isArray(errors.expenseDetails) &&
                                      errors.expenseDetails[idx] &&
                                      typeof errors.expenseDetails[idx] === 'object' &&
                                      (errors.expenseDetails[idx] as any).description
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Button color="error" onClick={() => remove(idx)} disabled={values.expenseDetails.length === 1} sx={{ mt: 1 }}>
                                    Remove
                                  </Button>
                                </Grid>
                              </Grid>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={() => push({ lineAmount: '', department: '', account: '', location: '', description: '' })} sx={{ mt: 2 }}>
                              Add Expense Coding
                            </Button>
                          </>
                        )}
                      </FieldArray>
                    </Box>
                  )}
                  {tab === 1 && (
                    <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                      <Typography variant="body1">Switch to the <b>Vendor Details</b> tab to fill out the form.</Typography>
                    </Box>
                  )}
                  {tab === 2 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CommentIcon sx={{ color: '#1976d2', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Comments
                        </Typography>
                      </Box>
                      <Field
                        as={TextField}
                        fullWidth
                        name="comments"
                        label="Add a comment and use @Name to tag someone"
                        multiline
                        rows={4}
                      />
                    </Box>
                  )}
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Button variant="outlined" color="primary" type="button" sx={{ minWidth: 160 }}>
                      Save as Draft
                    </Button>
                    <Button variant="contained" color="primary" type="submit" sx={{ minWidth: 180 }}>
                      Submit & New
                    </Button>
                    <IconButton color="default" sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="text" color="secondary" onClick={logout}>
                      Logout
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default InvoiceForm;
