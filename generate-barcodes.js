#!/usr/bin/env node

const https = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: url.replace('http://localhost:8080', ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsedBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: { message: body }
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main function to generate barcodes for all articles
async function generateBarcodesForAllArticles() {
  try {
    console.log('🔍 Fetching all articles...');
    
    // Get all articles (using a large limit to get all)
    const articlesResponse = await makeRequest(`${API_BASE_URL}/masterdata/articles/?page=1&limit=1000`);
    
    if (articlesResponse.status !== 200 || !articlesResponse.data.success) {
      throw new Error('Failed to fetch articles: ' + JSON.stringify(articlesResponse.data));
    }

    const articles = articlesResponse.data.data;
    console.log(`📦 Found ${articles.length} articles`);

    if (articles.length === 0) {
      console.log('❌ No articles found. Please add some articles first.');
      return;
    }

    // Extract article IDs
    const articleIds = articles.map(article => article.id);
    console.log('🔖 Article IDs extracted:', articleIds.slice(0, 5), '...');

    // Generate barcodes for ALL articles using the existing articles endpoint
    console.log('🎨 Generating barcodes for all articles using articles endpoint...');
    const barcodeResponse = await makeRequest(
      `${API_BASE_URL}/masterdata/barcodes/generate/articles`,
      'POST',
      {
        article_ids: articleIds,
        format: 'CODE128',
        width: 500,
        height: 150
      }
    );

    if (barcodeResponse.status === 200 && barcodeResponse.data.success) {
      console.log('✅ Barcode generation successful!');
      console.log(`📁 Total articles: ${barcodeResponse.data.data?.total_count || 0}`);
      console.log(`✅ Successfully generated: ${barcodeResponse.data.data?.success_count || 0}`);
      console.log(`❌ Failed: ${barcodeResponse.data.data?.error_count || 0}`);
      console.log(`💾 Articles updated with URLs: ${barcodeResponse.data.data?.updated_articles_count || 0}`);
      console.log('📂 Barcodes stored in MinIO with structured folder organization');
      
      // Display some examples of generated barcodes
      if (barcodeResponse.data.data?.results) {
        console.log('\n🏷️  Sample generated barcodes:');
        const sampleBarcodes = barcodeResponse.data.data.results.slice(0, 5);
        sampleBarcodes.forEach((barcode, index) => {
          console.log(`   ${index + 1}. Article ID: ${barcode.id.substring(0, 8)}...`);
          console.log(`      Data: ${barcode.data}`);
          console.log(`      Format: ${barcode.format}`);
          if (barcode.image_url) {
            console.log(`      MinIO URL: ${barcode.image_url.substring(0, 60)}...`);
          }
          if (barcode.error) {
            console.log(`      Error: ${barcode.error}`);
          }
          console.log('');
        });
        
        if (barcodeResponse.data.data.results.length > 5) {
          console.log(`   ... and ${barcodeResponse.data.data.results.length - 5} more barcodes generated`);
        }
      }
      
    } else {
      console.error('❌ Barcode generation failed:');
      console.error('Status:', barcodeResponse.status);
      console.error('Response:', JSON.stringify(barcodeResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Execute the script
console.log('🚀 Starting barcode generation process...');
console.log('📍 Backend URL:', API_BASE_URL);
console.log('🗂️  Target: MinIO bucket malaka-images/barcodes/');
console.log('');

generateBarcodesForAllArticles()
  .then(() => {
    console.log('\n🎉 Barcode generation process completed!');
    console.log('💡 You can now view the generated barcodes in MinIO console or via API endpoints.');
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });