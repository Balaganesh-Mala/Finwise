const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const runCode = async (req, res) => {
    const { language, code, stdin } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    const jobId = uuidv4();
    const tempDir = path.join(__dirname, '../../temp', jobId); // Adjust path as needed
    
    // Ensure temp directory exists
    // Ideally usage of /tmp or similar, but for Windows/Cross-platform we use a local temp folder
    if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../../temp'));
    }
    fs.mkdirSync(tempDir);

    let filename;
    let dockerImage;
    let runCommand;

    // Configuration for each language
    switch (language) {
        case 'python':
            filename = 'code.py';
            dockerImage = 'runner-python';
            // python runner expects code.py at /app/code.py
             // We mount the temp dir to /app
            break;
        case 'javascript':
            filename = 'code.js';
            dockerImage = 'runner-node';
            break;
        case 'c':
            filename = 'code.c';
            dockerImage = 'runner-c';
            break;
        case 'cpp':
            filename = 'code.cpp';
            dockerImage = 'runner-cpp';
            break;
        case 'java':
            filename = 'Main.java';
            dockerImage = 'runner-java';
            break;
        case 'sql':
            filename = 'query.sql';
            dockerImage = 'runner-sql';
            break;
        default:
            return res.status(400).json({ error: 'Unsupported language' });
    }

    // Verify Docker availability
    // ... logic could be added here

    // Resolve absolute path for Windows compatibility
    const absoluteTempDir = path.resolve(tempDir);
    
    // Write code to file
    fs.writeFileSync(path.join(absoluteTempDir, filename), code);

    // Prepare Docker args
    const dockerArgs = [
        'run',
        '--rm',
        '--network', 'none',
        '--memory', '200m',
        '--cpus', '0.5',
        '-v', `${absoluteTempDir}:/app`,
        dockerImage
    ];

    console.log(`Executing: docker ${dockerArgs.join(' ')}`);

    return new Promise((resolve, reject) => {
        let responseSent = false;
        const dockerProcess = spawn('docker', dockerArgs);

        let output = '';
        let errorOutput = '';

        // Timeout logic
        const timeout = setTimeout(() => {
            if (responseSent) return;
            responseSent = true;
            
            dockerProcess.kill();
            cleanup(tempDir);
            res.json({ output: '', error: 'Execution Timed Out (5s limit)' });
        }, 5000);

        dockerProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        dockerProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        dockerProcess.on('close', (code) => {
            if (responseSent) return;
            responseSent = true;
            
            clearTimeout(timeout);
            cleanup(tempDir);
            
            // Check for common Docker errors
            if (code !== 0 && errorOutput.includes('Unable to find image')) {
                return res.json({ 
                    output: '', 
                    error: `Error: Docker image '${dockerImage}' not found.\nPlease run the build script in 'server/docker/' directory.` 
                });
            }

            res.json({ 
                output: output, 
                error: errorOutput, 
                exitCode: code 
            });
        });

        dockerProcess.on('error', (err) => {
            if (responseSent) return;
            responseSent = true;
            
            clearTimeout(timeout);
            cleanup(tempDir);
            if (err.code === 'ENOENT') {
                console.warn("⚠️  [System Warning]: Docker executable not found. Execution failed.");
                // Return as successful response so it shows in the Playground console
                return res.json({ 
                    output: `\n\n[SYSTEM ERROR]: Docker executable not found.\n\n1. Please install Docker Desktop.\n2. Add it to your System PATH.\n3. Restart your terminal/IDE.\n`,
                    error: null 
                });
            }

            console.error("Docker execution error:", err);
            
            res.json({ output: '', error: 'Failed to execute code runner. Is Docker installed and running?' });
        });
    });
};

const cleanup = (dir) => {
    try {
        fs.rmSync(dir, { recursive: true, force: true });
    } catch (e) {
        console.error('Error cleaning up temp dir:', e);
    }
};

module.exports = { runCode };
