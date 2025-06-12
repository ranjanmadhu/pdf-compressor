#!/usr/bin/env node

/**
 * Command-line interface for the PDF Compressor
 */
const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const PDFCompressor = require('../src/PDFCompressor');

// Setup the command-line program
const program = new Command();

program
    .name('advanced-pdf-compressor')
    .description('Compress PDF files using multiple techniques')
    .version('1.0.0');

program
    .argument('<input>', 'Input PDF file or directory')
    .argument('[output]', 'Output PDF file or directory (defaults to [input]-compressed.pdf)')
    .option('-i, --optimize-images', 'Optimize embedded images (default: true)', true)
    .option('-q, --image-quality <quality>', 'Quality of embedded images (1-100)', 80)
    .option('-m, --remove-metadata', 'Remove metadata (default: true)', true)
    .option('-c, --compression-level <level>', 'PDF compression level (1-5)', 3)
    .option('-g, --grayscale', 'Convert to grayscale', false)
    .option('-r, --recursive', 'Process directories recursively', false)
    .action(async (input, output, options) => {
        try {
            const stats = await fs.stat(input);
            
            // Handle single file compression
            if (stats.isFile()) {
                // If no output is specified, create a default filename
                if (!output) {
                    const inputExt = path.extname(input);
                    const inputBase = path.basename(input, inputExt);
                    const inputDir = path.dirname(input);
                    output = path.join(inputDir, `${inputBase}-compressed${inputExt}`);
                }
                
                // Create compressor with CLI options
                const compressor = new PDFCompressor({
                    optimizeImages: options.optimizeImages,
                    imageQuality: parseInt(options.imageQuality),
                    removeMetadata: options.removeMetadata,
                    compressionLevel: parseInt(options.compressionLevel),
                    grayscale: options.grayscale
                });
                
                console.log(`Compressing ${input} to ${output}...`);
                
                // Compress the file
                const result = await compressor.compressPDF(input, output);
                
                // Show results
                console.log('Compression complete!');
                console.log(`Original size: ${formatBytes(result.inputSize)}`);
                console.log(`Compressed size: ${formatBytes(result.outputSize)}`);
                console.log(`Savings: ${formatBytes(result.savings)} (${result.percentReduction})`);
            } 
            // Handle directory compression
            else if (stats.isDirectory()) {
                // Ensure output is a directory if input is a directory
                if (output && !output.endsWith('/')) {
                    output = output + '/';
                }
                
                // If no output is specified, use the input directory
                if (!output) {
                    output = input;
                }
                
                // Ensure output directory exists
                await fs.ensureDir(output);
                
                // Get all PDF files in the directory
                const files = await getFilesInDirectory(input, options.recursive);
                const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
                
                if (pdfFiles.length === 0) {
                    console.log('No PDF files found in the specified directory.');
                    return;
                }
                
                console.log(`Found ${pdfFiles.length} PDF files to compress.`);
                
                // Create compressor with CLI options
                const compressor = new PDFCompressor({
                    optimizeImages: options.optimizeImages,
                    imageQuality: parseInt(options.imageQuality),
                    removeMetadata: options.removeMetadata,
                    compressionLevel: parseInt(options.compressionLevel),
                    grayscale: options.grayscale
                });
                
                // Process each file
                let totalOriginalSize = 0;
                let totalCompressedSize = 0;
                
                for (let i = 0; i < pdfFiles.length; i++) {
                    const inputFile = pdfFiles[i];
                    
                    // Create output path by replacing input directory with output directory
                    const relativePath = path.relative(input, inputFile);
                    const outputFile = path.join(output, relativePath);
                    
                    // Create output directory if needed
                    await fs.ensureDir(path.dirname(outputFile));
                    
                    // Create a modified output filename to avoid overwriting originals
                    const outputExt = path.extname(outputFile);
                    const outputBase = path.basename(outputFile, outputExt);
                    const outputDir = path.dirname(outputFile);
                    const finalOutputFile = path.join(outputDir, `${outputBase}-compressed${outputExt}`);
                    
                    console.log(`[${i+1}/${pdfFiles.length}] Compressing ${inputFile} to ${finalOutputFile}...`);
                    
                    try {
                        // Compress the file
                        const result = await compressor.compressPDF(inputFile, finalOutputFile);
                        
                        // Add to totals
                        totalOriginalSize += result.inputSize;
                        totalCompressedSize += result.outputSize;
                        
                        // Show individual results
                        console.log(`  Original: ${formatBytes(result.inputSize)}, Compressed: ${formatBytes(result.outputSize)}, Savings: ${result.percentReduction}`);
                    } catch (error) {
                        console.error(`  Error compressing ${inputFile}: ${error.message}`);
                    }
                }
                
                // Show overall results
                if (totalOriginalSize > 0) {
                    const totalSavings = totalOriginalSize - totalCompressedSize;
                    const percentReduction = ((totalSavings / totalOriginalSize) * 100).toFixed(2);
                    
                    console.log('\nCompression complete!');
                    console.log(`Total original size: ${formatBytes(totalOriginalSize)}`);
                    console.log(`Total compressed size: ${formatBytes(totalCompressedSize)}`);
                    console.log(`Total savings: ${formatBytes(totalSavings)} (${percentReduction}%)`);
                }
            } else {
                console.error('Input is neither a file nor a directory.');
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.parse();

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Human-readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all files in a directory
 * @param {string} dir - Directory path
 * @param {boolean} recursive - Whether to search recursively
 * @returns {Promise<string[]>} Array of file paths
 */
async function getFilesInDirectory(dir, recursive = false) {
    const files = [];
    
    // Read directory contents
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && recursive) {
            // If recursive and it's a directory, get files in that directory
            const subFiles = await getFilesInDirectory(fullPath, recursive);
            files.push(...subFiles);
        } else if (entry.isFile()) {
            // If it's a file, add it to the list
            files.push(fullPath);
        }
    }
    
    return files;
}
