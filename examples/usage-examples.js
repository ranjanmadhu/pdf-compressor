/**
 * Example of using PDF Compressor library programmatically
 * 
 * This file demonstrates various ways to use the PDF Compressor
 * library in your Node.js applications.
 */
const PDFCompressor = require('../index');
const { BatchProcessor } = require('../index');
const path = require('path');

// Example 1: Basic usage with default options
async function basicExample() {
    console.log('EXAMPLE 1: Basic compression with default options');
    
    const compressor = new PDFCompressor();
    
    try {
        const result = await compressor.compressPDF(
            path.join(__dirname, 'input.pdf'),
            path.join(__dirname, 'output-basic.pdf')
        );
        
        console.log('Compression result:');
        console.log(`- Original size: ${formatBytes(result.inputSize)}`);
        console.log(`- Compressed size: ${formatBytes(result.outputSize)}`);
        console.log(`- Savings: ${formatBytes(result.savings)} (${result.percentReduction})`);
    } catch (error) {
        console.error('Compression failed:', error.message);
    }
    
    console.log('-------------------------------------');
}

// Example 2: Advanced usage with custom options
async function advancedExample() {
    console.log('EXAMPLE 2: Advanced compression with custom options');
    
    const compressor = new PDFCompressor({
        optimizeImages: true,
        imageQuality: 60,
        removeMetadata: true,
        compressionLevel: 4,
        grayscale: true
    });
    
    try {
        const result = await compressor.compressPDF(
            path.join(__dirname, 'input.pdf'),
            path.join(__dirname, 'output-advanced.pdf')
        );
        
        console.log('Compression result:');
        console.log(`- Original size: ${formatBytes(result.inputSize)}`);
        console.log(`- Compressed size: ${formatBytes(result.outputSize)}`);
        console.log(`- Savings: ${formatBytes(result.savings)} (${result.percentReduction})`);
    } catch (error) {
        console.error('Compression failed:', error.message);
    }
    
    console.log('-------------------------------------');
}

// Example 3: Updating options after initialization
async function updatingOptionsExample() {
    console.log('EXAMPLE 3: Updating options after initialization');
    
    const compressor = new PDFCompressor();
    
    // Show initial options
    console.log('Initial options:', compressor.getOptions());
    
    // Update options
    compressor.setOptions({
        imageQuality: 50,
        grayscale: true
    });
    
    // Show updated options
    console.log('Updated options:', compressor.getOptions());
    
    try {
        const result = await compressor.compressPDF(
            path.join(__dirname, 'input.pdf'),
            path.join(__dirname, 'output-updated-options.pdf')
        );
        
        console.log('Compression result:');
        console.log(`- Original size: ${formatBytes(result.inputSize)}`);
        console.log(`- Compressed size: ${formatBytes(result.outputSize)}`);
        console.log(`- Savings: ${formatBytes(result.savings)} (${result.percentReduction})`);
    } catch (error) {
        console.error('Compression failed:', error.message);
    }
    
    console.log('-------------------------------------');
}

// Example 4: Batch processing a directory
async function batchProcessingExample() {
    console.log('EXAMPLE 4: Batch processing a directory');
    
    const batchProcessor = new BatchProcessor({
        optimizeImages: true,
        imageQuality: 70,
        compressionLevel: 3
    });
    
    try {
        const result = await batchProcessor.processDirectory(
            path.join(__dirname, 'input-directory'),
            path.join(__dirname, 'output-directory'),
            {
                recursive: true,
                progressCallback: (progress) => {
                    console.log(`Processing: ${progress.currentIndex + 1}/${progress.totalFiles} - ${progress.currentFile}`);
                }
            }
        );
        
        console.log('Batch processing result:');
        console.log(`- Files processed: ${result.filesProcessed}`);
        console.log(`- Files succeeded: ${result.filesSucceeded}`);
        console.log(`- Files failed: ${result.filesFailed}`);
        console.log(`- Total original size: ${formatBytes(result.totalInputSize)}`);
        console.log(`- Total compressed size: ${formatBytes(result.totalOutputSize)}`);
        console.log(`- Total savings: ${formatBytes(result.totalSavings)} (${result.percentReduction})`);
    } catch (error) {
        console.error('Batch processing failed:', error.message);
    }
    
    console.log('-------------------------------------');
}

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run all examples
async function runExamples() {
    await basicExample();
    await advancedExample();
    await updatingOptionsExample();
    await batchProcessingExample();
}

// Run if this script is executed directly
if (require.main === module) {
    runExamples().catch(console.error);
}

// Export examples for use in other scripts
module.exports = {
    basicExample,
    advancedExample,
    updatingOptionsExample,
    batchProcessingExample
};
