#!/usr/bin/env node

/**
 * Local development setup script
 * 
 * This script sets up the project for local development by
 * creating a global symlink to the current directory.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the current directory
const projectDir = path.resolve(__dirname, '..');

// Function to run a command and return its output
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(' ')}`);
        
        const proc = spawn(command, args, {
            cwd: projectDir,
            stdio: 'inherit'
        });
        
        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

// Main function
async function setup() {
    try {
        console.log('Setting up PDF Compressor for local development...');
        
        // Create a test file directory if it doesn't exist
        const testFilesDir = path.join(projectDir, 'examples', 'test-files');
        if (!fs.existsSync(testFilesDir)) {
            fs.mkdirSync(testFilesDir, { recursive: true });
        }
        
        // Install dependencies
        console.log('\nInstalling dependencies...');
        await runCommand('npm', ['install']);
        
        // Create global symlink
        console.log('\nCreating global symlink...');
        await runCommand('npm', ['link']);
        
        console.log('\nSetup complete! You can now use pdf-compressor globally.');
        console.log('Try running:');
        console.log('  pdf-compressor --help');
        console.log('\nOr test the installation:');
        console.log('  npm test');
        
    } catch (error) {
        console.error('Setup failed:', error.message);
        process.exit(1);
    }
}

// Run the setup
setup().catch(console.error);
