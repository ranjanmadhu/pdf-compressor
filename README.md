# PDF Compressor

A Node.js library and command-line tool for compressing PDF files using multiple optimization techniques.

## Features

- Multiple compression strategies including:
  - Image optimization
  - Quality reduction
  - Metadata removal
  - Page content optimization
- Command-line interface for easy integration into scripts
- Programmatic API for integration into Node.js applications
- Support for processing individual files or directories
- Customizable compression options

## Installation

### Global Installation

```bash
npm install -g pdf-compressor
```

This will make the `pdf-compressor` command available globally.

### Local Installation

```bash
npm install pdf-compressor
```

## Command-Line Usage

```bash
pdf-compressor [options] <input> [output]
```

### Arguments

- `input`: Path to the input PDF file or directory
- `output` (optional): Path to the output PDF file or directory. If not specified, adds "-compressed" to the input filename.

### Options

- `-i, --optimize-images`: Optimize embedded images (default: true)
- `-q, --image-quality <quality>`: Quality of embedded images from 1-100 (default: 80)
- `-m, --remove-metadata`: Remove metadata (default: true)
- `-c, --compression-level <level>`: PDF compression level from 1-5 (default: 3)
- `-g, --grayscale`: Convert to grayscale (default: false)
- `-r, --recursive`: Process directories recursively (default: false)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

### Examples

Compress a single PDF file:
```bash
pdf-compressor document.pdf
```

Compress a PDF file with custom options:
```bash
pdf-compressor --image-quality 70 --compression-level 4 --grayscale document.pdf compressed.pdf
```

Compress all PDFs in a directory:
```bash
pdf-compressor --recursive ./documents ./compressed-documents
```

## Programmatic Usage

You can also use PDF Compressor as a library in your Node.js applications.

```javascript
const PDFCompressor = require('pdf-compressor');

// Create a compressor with default options
const compressor = new PDFCompressor();

// Compress a PDF file
compressor.compressPDF('input.pdf', 'output.pdf')
  .then(result => {
    console.log(`Original size: ${result.inputSize} bytes`);
    console.log(`Compressed size: ${result.outputSize} bytes`);
    console.log(`Savings: ${result.savings} bytes (${result.percentReduction})`);
  })
  .catch(error => {
    console.error('Compression failed:', error);
  });

// Create a compressor with custom options
const customCompressor = new PDFCompressor({
  optimizeImages: true,
  imageQuality: 60,
  removeMetadata: true,
  compressionLevel: 5,
  grayscale: true
});

// Compress a PDF file with custom options
customCompressor.compressPDF('input.pdf', 'output.pdf')
  .then(result => {
    console.log(`Compression successful: ${result.percentReduction} reduction`);
  });

// Update options after initialization
compressor.setOptions({
  imageQuality: 50,
  grayscale: true
});

// Get current options
const options = compressor.getOptions();
console.log(options);
```

## API Reference

### PDFCompressor

Main class for PDF compression.

#### Constructor

```javascript
const compressor = new PDFCompressor(options);
```

**Options:**

- `optimizeImages` (boolean): Whether to optimize embedded images (default: true)
- `imageQuality` (number): Quality of embedded images from 1-100 (default: 80)
- `removeMetadata` (boolean): Whether to remove metadata (default: true)
- `compressionLevel` (number): PDF compression level from 1-5 (default: 3)
- `grayscale` (boolean): Convert to grayscale (default: false)

#### Methods

##### compressPDF(inputPath, outputPath, options)

Compresses a PDF file.

**Parameters:**

- `inputPath` (string): Path to the input PDF file
- `outputPath` (string): Path to save the compressed PDF
- `options` (object, optional): Override default options

**Returns:**

Promise resolving to an object with compression statistics:

```javascript
{
  success: true,
  inputSize: 1000000,        // Original file size in bytes
  outputSize: 500000,        // Compressed file size in bytes
  savings: 500000,           // Bytes saved
  percentReduction: "50.00%", // Percentage reduction
  inputPath: "input.pdf",    // Input file path
  outputPath: "output.pdf"   // Output file path
}
```

##### getOptions()

Returns the current options.

**Returns:**

Object containing the current compression options.

##### setOptions(options)

Updates the compression options.

**Parameters:**

- `options` (object): New options to set

**Returns:**

The PDFCompressor instance (for chaining).

## Compression Techniques

PDF Compressor uses multiple strategies to reduce file size:

1. **Image Optimization**: Reduces the quality and size of embedded images.
2. **Metadata Removal**: Strips unnecessary metadata from the PDF.
3. **Quality Reduction**: Reduces the overall quality of the PDF while maintaining readability.
4. **Page Optimization**: Optimizes content streams and removes unnecessary elements.

## Requirements

- Node.js 12.0.0 or higher
- For some advanced features, you might need external tools like Ghostscript installed on your system

## License

ISC
