/**
 * BaseStrategy - Abstract base class for PDF compression strategies
 */
class BaseStrategy {
    /**
     * Create a new strategy
     * @param {Object} options - Compression options
     */
    constructor(options = {}) {
        this.options = { ...options };
    }

    /**
     * Update strategy options
     * @param {Object} options - New options to set
     */
    updateOptions(options = {}) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Optimize a PDF file using this strategy
     * @param {string} inputPath - Path to the input PDF file
     * @param {string} outputPath - Path to save the optimized PDF
     * @param {Object} options - Override default options
     * @returns {Promise<void>}
     */
    async optimize(inputPath, outputPath, options = {}) {
        throw new Error('Method optimize() must be implemented by derived classes');
    }
}

module.exports = BaseStrategy;
