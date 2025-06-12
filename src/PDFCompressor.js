/**
 * PDFCompressor - Main class for compressing PDF files using various techniques
 */
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ImageOptimizer = require('./strategies/ImageOptimizer');
const PDFQualityReducer = require('./strategies/PDFQualityReducer');
const PDFMetadataOptimizer = require('./strategies/PDFMetadataOptimizer');
const PDFPageOptimizer = require('./strategies/PDFPageOptimizer');

class PDFCompressor {
    /**
     * Create a new PDFCompressor instance
     * @param {Object} options - Compression options
     * @param {boolean} options.optimizeImages - Whether to optimize embedded images (default: true)
     * @param {number} options.imageQuality - Quality of embedded images (1-100, default: 80)
     * @param {boolean} options.removeMetadata - Whether to remove metadata (default: true)
     * @param {number} options.compressionLevel - PDF compression level (1-5, default: 3)
     * @param {boolean} options.grayscale - Convert to grayscale (default: false)
     */
    constructor(options = {}) {
        this.options = {
            optimizeImages: options.optimizeImages !== undefined ? options.optimizeImages : true,
            imageQuality: options.imageQuality || 80,
            removeMetadata: options.removeMetadata !== undefined ? options.removeMetadata : true,
            compressionLevel: options.compressionLevel || 3,
            grayscale: options.grayscale !== undefined ? options.grayscale : false,
        };

        // Initialize optimization strategies
        this.imageOptimizer = new ImageOptimizer(this.options);
        this.qualityReducer = new PDFQualityReducer(this.options);
        this.metadataOptimizer = new PDFMetadataOptimizer(this.options);
        this.pageOptimizer = new PDFPageOptimizer(this.options);
    }

    /**
     * Compress a PDF file and save to the destination
     * @param {string} inputPath - Path to the input PDF file
     * @param {string} outputPath - Path to save the compressed PDF
     * @param {Object} options - Override default options
     * @returns {Promise<Object>} Compression result with statistics
     */
    async compressPDF(inputPath, outputPath, options = {}) {
        // Merge options with constructor options
        const currentOptions = { ...this.options, ...options };
        
        try {
            // Ensure input file exists
            if (!await fs.pathExists(inputPath)) {
                throw new Error(`Input file does not exist: ${inputPath}`);
            }

            // Create temp directory for processing
            const tempDir = path.join(process.cwd(), 'temp', uuidv4());
            await fs.ensureDir(tempDir);

            // Get initial file size
            const initialSize = (await fs.stat(inputPath)).size;
            
            // Make a copy of the input file to work with
            const workingFile = path.join(tempDir, 'working.pdf');
            await fs.copy(inputPath, workingFile);
            
            let currentFile = workingFile;
            
            // Apply compression strategies based on options
            if (currentOptions.removeMetadata) {
                const optimizedFile = path.join(tempDir, 'metadata-optimized.pdf');
                await this.metadataOptimizer.optimize(currentFile, optimizedFile);
                currentFile = optimizedFile;
            }

            if (currentOptions.optimizeImages) {
                const optimizedFile = path.join(tempDir, 'image-optimized.pdf');
                await this.imageOptimizer.optimize(currentFile, optimizedFile);
                currentFile = optimizedFile;
            }
            
            // Apply quality reduction
            const qualityOptimizedFile = path.join(tempDir, 'quality-optimized.pdf');
            await this.qualityReducer.optimize(currentFile, qualityOptimizedFile, {
                compressionLevel: currentOptions.compressionLevel,
                grayscale: currentOptions.grayscale
            });
            currentFile = qualityOptimizedFile;
            
            // Apply page optimization (removes unnecessary elements)
            const pageOptimizedFile = path.join(tempDir, 'page-optimized.pdf');
            await this.pageOptimizer.optimize(currentFile, pageOptimizedFile);
            currentFile = pageOptimizedFile;
            
            // Ensure output directory exists
            await fs.ensureDir(path.dirname(outputPath));
            
            // Copy final result to output path
            await fs.copy(currentFile, outputPath);
            
            // Get final file size and calculate stats
            const finalSize = (await fs.stat(outputPath)).size;
            const savings = initialSize - finalSize;
            const percentReduction = ((savings / initialSize) * 100).toFixed(2);
            
            // Clean up temp directory
            await fs.remove(tempDir);
            
            return {
                success: true,
                inputSize: initialSize,
                outputSize: finalSize,
                savings,
                percentReduction: `${percentReduction}%`,
                inputPath,
                outputPath
            };
        } catch (error) {
            throw new Error(`PDF compression failed: ${error.message}`);
        }
    }

    /**
     * Get the current options
     * @returns {Object} Current options
     */
    getOptions() {
        return { ...this.options };
    }

    /**
     * Update compression options
     * @param {Object} options - New options to set
     */
    setOptions(options = {}) {
        this.options = { ...this.options, ...options };
        
        // Update options in strategies
        this.imageOptimizer.updateOptions(this.options);
        this.qualityReducer.updateOptions(this.options);
        this.metadataOptimizer.updateOptions(this.options);
        this.pageOptimizer.updateOptions(this.options);
        
        return this;
    }
}

module.exports = PDFCompressor;
