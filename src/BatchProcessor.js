/**
 * Utility for batch processing PDF files
 * 
 * This module provides utilities for batch processing PDF files
 * using the PDFCompressor library.
 */
const fs = require('fs-extra');
const path = require('path');
const PDFCompressor = require('./PDFCompressor');

class BatchProcessor {
    /**
     * Create a new BatchProcessor instance
     * @param {Object} options - Compression options to pass to PDFCompressor
     */
    constructor(options = {}) {
        this.compressor = new PDFCompressor(options);
    }

    /**
     * Process all PDF files in a directory
     * @param {string} inputDir - Input directory containing PDF files
     * @param {string} outputDir - Output directory for compressed files
     * @param {Object} options - Processing options
     * @param {boolean} options.recursive - Process subdirectories recursively (default: false)
     * @param {Function} options.progressCallback - Callback for progress updates
     * @returns {Promise<Object>} Statistics about the batch operation
     */
    async processDirectory(inputDir, outputDir, options = {}) {
        const { recursive = false, progressCallback } = options;
        
        // Ensure input directory exists
        if (!await fs.pathExists(inputDir)) {
            throw new Error(`Input directory does not exist: ${inputDir}`);
        }
        
        // Create output directory if it doesn't exist
        await fs.ensureDir(outputDir);
        
        // Find all PDF files
        const files = await this._findPDFFiles(inputDir, recursive);
        
        if (files.length === 0) {
            return {
                success: true,
                filesProcessed: 0,
                totalSavings: 0,
                percentReduction: '0.00%'
            };
        }
        
        // Process each file
        let totalInputSize = 0;
        let totalOutputSize = 0;
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const inputFile = files[i];
            
            // Create output file path, preserving directory structure
            const relativePath = path.relative(inputDir, inputFile);
            const outputFile = path.join(outputDir, relativePath);
            
            // Ensure output directory exists
            await fs.ensureDir(path.dirname(outputFile));
            
            try {
                // Call progress callback if provided
                if (progressCallback) {
                    progressCallback({
                        currentFile: inputFile,
                        currentIndex: i,
                        totalFiles: files.length,
                        progress: (i / files.length) * 100
                    });
                }
                
                // Compress the file
                const result = await this.compressor.compressPDF(inputFile, outputFile);
                
                // Update totals
                totalInputSize += result.inputSize;
                totalOutputSize += result.outputSize;
                
                results.push({
                    inputFile,
                    outputFile,
                    inputSize: result.inputSize,
                    outputSize: result.outputSize,
                    savings: result.savings,
                    percentReduction: result.percentReduction
                });
            } catch (error) {
                // Log the error but continue with other files
                console.error(`Error processing ${inputFile}: ${error.message}`);
                
                results.push({
                    inputFile,
                    outputFile,
                    error: error.message
                });
            }
        }
        
        // Calculate overall statistics
        const totalSavings = totalInputSize - totalOutputSize;
        const percentReduction = totalInputSize > 0 
            ? ((totalSavings / totalInputSize) * 100).toFixed(2) + '%'
            : '0.00%';
        
        return {
            success: true,
            filesProcessed: files.length,
            filesSucceeded: results.filter(r => !r.error).length,
            filesFailed: results.filter(r => r.error).length,
            totalInputSize,
            totalOutputSize,
            totalSavings,
            percentReduction,
            results
        };
    }
    
    /**
     * Find all PDF files in a directory
     * @param {string} dir - Directory to search
     * @param {boolean} recursive - Whether to search recursively
     * @returns {Promise<string[]>} Array of PDF file paths
     * @private
     */
    async _findPDFFiles(dir, recursive) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = [];
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory() && recursive) {
                // If recursive and it's a directory, search it too
                const subFiles = await this._findPDFFiles(fullPath, recursive);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
                // If it's a PDF file, add it to the list
                files.push(fullPath);
            }
        }
        
        return files;
    }
}

module.exports = BatchProcessor;
