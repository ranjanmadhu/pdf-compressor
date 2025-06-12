/**
 * PDFMetadataOptimizer - Strategy for removing or optimizing PDF metadata
 */
const fs = require('fs-extra');
const { PDFDocument } = require('pdf-lib');
const BaseStrategy = require('./BaseStrategy');

class PDFMetadataOptimizer extends BaseStrategy {
    /**
     * Remove unnecessary metadata from PDF to reduce size
     * @param {string} inputPath - Path to the input PDF file
     * @param {string} outputPath - Path to save the optimized PDF
     * @param {Object} options - Override default options
     * @returns {Promise<void>}
     */
    async optimize(inputPath, outputPath, options = {}) {
        const currentOptions = { ...this.options, ...options };
        
        try {
            // Read the PDF file
            const pdfBytes = await fs.readFile(inputPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            // If metadata removal is enabled
            if (currentOptions.removeMetadata) {
                // Clear the metadata
                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('');
                pdfDoc.setCreator('');
                
                // Save the modified PDF
                const modifiedPdfBytes = await pdfDoc.save();
                await fs.writeFile(outputPath, modifiedPdfBytes);
            } else {
                // Just copy the original file if no metadata removal is needed
                await fs.copy(inputPath, outputPath);
            }
        } catch (error) {
            // If there's an error, just copy the original file
            await fs.copy(inputPath, outputPath);
            console.warn(`Warning: Metadata optimization failed, using original file: ${error.message}`);
        }
    }
}

module.exports = PDFMetadataOptimizer;
