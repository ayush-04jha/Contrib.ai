import { cloneRepository } from '../utils/cloner.js';
import { exec } from 'node:child_process';
import util from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFiles } from './getFiles.js';
import { getIO } from '../socket.js';
import { jobProgress } from '../utils/jobStore.js';
import fs from 'fs';

// exec is used to run terminal commands but we have to pass the command and the callback function in it which can be little messy and also we can't use async await in it so we promisify it to reduce complexity and to use it in async await style
const execPromise = util.promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// __dirname is giving you the folder path of current file (server->current files folder name). and ROOT_DIR is giving you the folder path of just above parent folder of the current folder(Open_Source)
const ROOT_DIR = path.resolve(__dirname, '../..');

// Process a single file
async function processFile(filePath, index, total, jobId, venvPythonPath, pythonScriptPath) {
    const fileName = path.basename(filePath);
    try {
        const normalizedPath = path.normalize(filePath);
        process.stdout.write(`[${index + 1}/${total}] Processing: ${fileName}... `);
        
        const { stdout, stderr } = await execPromise(
            `"${venvPythonPath}" "${pythonScriptPath}" "${normalizedPath}" "${jobId}"`,
            { timeout: 60000 }
        );
        
        console.log(`📤 Python stdout: ${stdout}`);
        console.log(`⚠️ Python stderr: ${stderr}`);
        
        if (stderr) {
            console.log(`\n❌ ERROR in ${fileName}: ${stderr}`);
        }

        let functionsSaved = 0;
        if (stdout && stdout.trim()) {
            const result = JSON.parse(stdout.trim());
            functionsSaved = result.functions_saved;
            console.log(`✅ Saved ${functionsSaved} functions.`);
        }
        
        return { success: true, functionsSaved, fileName, index };
    } catch (fileError) {
        console.log(`❌ Skipped ${fileName} (Error in file)`);
        return { success: false, functionsSaved: 0, fileName, index };
    }
}

// Process files in parallel with controlled concurrency
async function processFilesInParallel(codeFiles, jobId, venvPythonPath, pythonScriptPath, concurrency = 3) {
    let totalFunctionsSaved = 0;
    let completed = 0;
    
    for (let i = 0; i < codeFiles.length; i += concurrency) {
        const batch = codeFiles.slice(i, i + concurrency);
        
        // Process batch in parallel
        const results = await Promise.all(
            batch.map((filePath, batchIndex) => 
                processFile(filePath, i + batchIndex, codeFiles.length, jobId, venvPythonPath, pythonScriptPath)
            )
        );
        
        // Process results
        for (const result of results) {
            totalFunctionsSaved += result.functionsSaved;
            completed++;
            
            // Update progress
            jobProgress.set(jobId, {
                progress: Math.round((completed / codeFiles.length) * 100),
                current: completed,
                total: codeFiles.length,
                file: result.fileName
            });

            getIO().to(jobId).emit("progress", {
                progress: Math.round((completed / codeFiles.length) * 100),
                current: completed,
                total: codeFiles.length,
                file: result.fileName
            });
        }
        
        // Rate limiting delay between batches (keeps the delay but reduces total time)
        if (i + concurrency < codeFiles.length) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
    
    return totalFunctionsSaved;
}

export default async function processRepo(url, jobId) {
    try {
        console.log("=== ProcessRepo Function Started ===");
        console.log("URL:", url);
        console.log("Job ID:", jobId);
        
        const { targetPath } = await cloneRepository(url, jobId);
        console.log("✅ Repository cloned to:", targetPath);
        
        // we know that the  target path is the path till jobid folder and we are fetching all files from it, which are cloned in that folder from git url
        const allFiles = await getFiles(targetPath)
        console.log("📁 Total files found:", allFiles.length);
        
        // extracting the files which have extensions as ['.js', '.py', '.ts', '.jsx']
        const codeFiles = allFiles.filter(file =>
            ['.js', '.py', '.ts', '.jsx', '.tsx'].includes(path.extname(file))
        );
        console.log("💻 Code files found:", codeFiles.length);

        if (codeFiles.length === 0) {
            console.log("❌ No code files found to parse!");
            return;
        }
        console.log(`🚀 Starting Ingestion for ${codeFiles.length} files...`);
        console.log("📂 ROOT_DIR:", ROOT_DIR);
        console.log("📂 AI Engine Dir:", path.join(ROOT_DIR, 'ai_engine'));
        console.log("📂 AI Engine exists:", fs.existsSync(path.join(ROOT_DIR, 'ai_engine')));
        console.log("📂 .venv Dir:", path.join(ROOT_DIR, 'ai_engine', '.venv'));
        console.log("📂 .venv exists:", fs.existsSync(path.join(ROOT_DIR, 'ai_engine', '.venv')));
        console.log("📂 .venv/bin:", path.join(ROOT_DIR, 'ai_engine', '.venv', 'bin'));
        console.log("📂 .venv/bin exists:", fs.existsSync(path.join(ROOT_DIR, 'ai_engine', '.venv', 'bin')));
        
        // --- THE VIRTUAL ENVIRONMENT PATHS ---
        // Cross-platform Python executable detection
        const isWindows = process.platform === 'win32';
        const venvPythonPath = isWindows 
            ? path.join(ROOT_DIR, 'ai_engine', '.venv', 'Scripts', 'python.exe')
            : path.join(ROOT_DIR, 'ai_engine', '.venv', 'bin', 'python');
        
        console.log("🐍 Platform:", process.platform);
        console.log("🐍 Python path:", venvPythonPath);
        console.log("🐍 Python path exists:", fs.existsSync(venvPythonPath));
        //pythonScriptPath is a path to processor.py 
        const pythonScriptPath = path.join(ROOT_DIR, 'ai_engine', 'processor.py');
        console.log("📜 Processor script path:", pythonScriptPath);
        console.log("📜 Processor script exists:", fs.existsSync(pythonScriptPath));
        
        // Process files in parallel with controlled concurrency (3 files at a time)
        const totalFunctionsSaved = await processFilesInParallel(
            codeFiles, 
            jobId, 
            venvPythonPath, 
            pythonScriptPath,
            3 // Process 3 files concurrently
        );
        
        jobProgress.set(jobId, {
            progress: 100,
            current: codeFiles.length,
            total: codeFiles.length,
            file: "Completed 🎉"
        });
        getIO().to(jobId).emit("done", {
            totalFunctionsSaved
        });
        console.log(`\n--- INGESTION COMPLETE ---`);
        console.log(`Total Files Processed: ${codeFiles.length}`);
        console.log(`Total Functions in Vector DB: ${totalFunctionsSaved}`);
        console.log(`Repo ID for Search: ${jobId}`);
        return 1;

    } catch (err) {
        console.error("❌ Critical System Error:", err.message);
        console.error("Full error:", err);
    }
}

