#!/usr/bin/env node

/**
 * PDF Compressor test script
 * 
 * This script demonstrates basic usage of the PDF Compressor library
 * and can be used to test your installation.
 */
const PDFCompressor = require('../index');
const fs = require('fs');
const path = require('path');

// Function to check if the installation is working
async function testInstallation() {
    console.log('Testing PDF Compressor installation...');
    
    // Create a simple test PDF (if one doesn't exist)
    const testDir = path.join(__dirname, 'test-files');
    const testPdfPath = path.join(testDir, 'test.pdf');
    const outputPdfPath = path.join(testDir, 'test-compressed.pdf');
    
    try {
        // Ensure test directory exists
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        // Check if test PDF exists
        let testFileExists = fs.existsSync(testPdfPath);
        
        if (!testFileExists) {
            console.log('No test PDF found. Please place a PDF file at:', testPdfPath);
            console.log('Or use the CLI with your own PDF file:');
            console.log('  pdf-compressor /path/to/your/file.pdf');
            process.exit(0);
        }
        
        // Create a compressor with default options
        const compressor = new PDFCompressor();
        console.log('Created PDFCompressor instance with default options');
        
        // Compress the test PDF
        console.log('Compressing test PDF...');
        const result = await compressor.compressPDF(testPdfPath, outputPdfPath);
        
        console.log('\nCompression successful!');
        console.log('Original size:', formatBytes(result.inputSize));
        console.log('Compressed size:', formatBytes(result.outputSize));
        console.log('Savings:', formatBytes(result.savings), `(${result.percentReduction})`);
        console.log('\nOutput file saved to:', outputPdfPath);
        
        console.log('\nInstallation test completed successfully!');
    } catch (error) {
        console.error('Error during test:', error.message);
        console.error('Installation test failed.');
        process.exit(1);
    }
}

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the test
testInstallation().catch(console.error);
