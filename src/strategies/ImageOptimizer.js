/**
 * ImageOptimizer - Strategy for optimizing images in PDF files
 */
const fs = require('fs-extra');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const BaseStrategy = require('./BaseStrategy');

class ImageOptimizer extends BaseStrategy {
    /**
     * Optimize images in a PDF file
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
            
            // Extract and optimize images if possible
            const pages = pdfDoc.getPages();
            let modified = false;
            
            // This is a simplified approach - actual image extraction and 
            // re-embedding would require more complex processing.
            // For a proof of concept, we'll just create a new PDF with
            // potentially reduced quality settings.
            
            // Save the modified PDF
            const modifiedPdfBytes = await pdfDoc.save();
            await fs.writeFile(outputPath, modifiedPdfBytes);
            
            // If no changes were made, copy the original
            if (!modified) {
                await fs.copy(inputPath, outputPath);
            }
        } catch (error) {
            // If there's an error, just copy the original file
            await fs.copy(inputPath, outputPath);
            console.warn(`Warning: Image optimization failed, using original file: ${error.message}`);
        }
    }
    
    /**
     * Optimize an image using sharp
     * @param {Buffer} imageBuffer - Image data buffer
     * @returns {Promise<Buffer>} Optimized image buffer
     */
    async _optimizeImage(imageBuffer) {
        try {
            // Determine image format
            const metadata = await sharp(imageBuffer).metadata();
            
            // Process the image based on its format
            let optimized;
            
            if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                optimized = await sharp(imageBuffer)
                    .jpeg({ quality: this.options.imageQuality })
                    .toBuffer();
            } else if (metadata.format === 'png') {
                optimized = await sharp(imageBuffer)
                    .png({ quality: this.options.imageQuality })
                    .toBuffer();
            } else {
                // For other formats, convert to JPEG
                optimized = await sharp(imageBuffer)
                    .jpeg({ quality: this.options.imageQuality })
                    .toBuffer();
            }
            
            return optimized;
        } catch (error) {
            console.warn(`Image optimization failed: ${error.message}`);
            return imageBuffer; // Return original if optimization fails
        }
    }
}

module.exports = ImageOptimizer;
