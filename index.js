/**
 * Main entry point for the PDF Compressor library
 */
const PDFCompressor = require('./src/PDFCompressor');
const BatchProcessor = require('./src/BatchProcessor');

// Export main class as default export
module.exports = PDFCompressor;

// Export additional classes
module.exports.PDFCompressor = PDFCompressor;
module.exports.BatchProcessor = BatchProcessor;
