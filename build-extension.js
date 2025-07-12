#!/usr/bin/env node

import { createWriteStream, createReadStream, statSync } from 'fs';
import { readdir, mkdir, copyFile, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildExtension() {
  const extensionDir = join(__dirname, 'extension');
  const outputPath = join(__dirname, 'supadata-mcp.dxt');
  
  try {
    // Clean and create extension directory
    await rm(extensionDir, { recursive: true, force: true });
    await mkdir(extensionDir, { recursive: true });
    
    console.log('Building extension...');
    
    // Copy manifest
    await copyFile(join(__dirname, 'manifest.json'), join(extensionDir, 'manifest.json'));
    
    // Copy built server files
    await copyFile(join(__dirname, 'package.json'), join(extensionDir, 'package.json'));
    await mkdir(join(extensionDir, 'dist'), { recursive: true });
    
    const distFiles = await readdir(join(__dirname, 'dist'));
    for (const file of distFiles) {
      await copyFile(
        join(__dirname, 'dist', file), 
        join(extensionDir, 'dist', file)
      );
    }
    
    // Copy node_modules for runtime dependencies
    await mkdir(join(extensionDir, 'node_modules'), { recursive: true });
    const nodeModulesPath = join(__dirname, 'node_modules');
    try {
      const packages = await readdir(nodeModulesPath);
      for (const pkg of packages) {
        if (pkg.startsWith('@modelcontextprotocol')) {
          const srcPath = join(nodeModulesPath, pkg);
          const destPath = join(extensionDir, 'node_modules', pkg);
          await copyRecursively(srcPath, destPath);
        }
      }
    } catch (err) {
      console.warn('Warning: Could not copy node_modules:', err.message);
    }
    
    // Create ZIP archive (.dxt)
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      const sizeKB = Math.round(archive.pointer() / 1024);
      console.log(`✅ Extension built: supadata-mcp.dxt (${sizeKB} KB)`);
      console.log('📦 Ready for installation in Claude Desktop');
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    archive.directory(extensionDir, false);
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Failed to build extension:', error);
    process.exit(1);
  }
}

async function copyRecursively(src, dest) {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    await mkdir(dest, { recursive: true });
    const files = await readdir(src);
    for (const file of files) {
      await copyRecursively(join(src, file), join(dest, file));
    }
  } else {
    await copyFile(src, dest);
  }
}

buildExtension();