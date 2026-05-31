const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Configuration
const TARGET_DIR = path.join(__dirname, 'img');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.avif'];

/**
 * Recursively gets all files in a directory that match the allowed extensions.
 * @param {string} dirPath 
 * @returns {Promise<string[]>} List of absolute file paths
 */
async function getFiles(dirPath) {
  let results = [];
  const list = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of list) {
    const resPath = path.resolve(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await getFiles(resPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        results.push(resPath);
      }
    }
  }
  return results;
}

/**
 * Formats bytes to a human-readable string.
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  console.log(`🚀 Starting image conversion in: ${TARGET_DIR}`);
  console.log(`🔍 Looking for files with extensions: ${ALLOWED_EXTENSIONS.join(', ')}\n`);

  let files;
  try {
    files = await getFiles(TARGET_DIR);
  } catch (err) {
    console.error(`❌ Error reading directory: ${err.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('✨ No matching images found in the target directory.');
    return;
  }

  console.log(`📁 Found ${files.length} images to convert.`);
  console.log('--------------------------------------------------');

  let successCount = 0;
  let failureCount = 0;
  let totalSavedBytes = 0;
  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;

  for (let i = 0; i < files.length; i++) {
    const originalPath = files[i];
    const relativePath = path.relative(TARGET_DIR, originalPath);
    const originalExt = path.extname(originalPath);
    
    // Define output path with .webp extension
    const webpPath = path.join(
      path.dirname(originalPath),
      path.basename(originalPath, originalExt) + '.webp'
    );

    console.log(`[${i + 1}/${files.length}] Converting: ${relativePath}...`);

    try {
      // Get original file stats
      const originalStats = await fs.stat(originalPath);
      const originalSize = originalStats.size;
      totalOriginalBytes += originalSize;

      // Convert image to webp using sharp
      // quality: 80 is a great balance between quality and compression ratio
      await sharp(originalPath)
        .webp({ quality: 80 })
        .toFile(webpPath);

      // Get new webp file stats
      const webpStats = await fs.stat(webpPath);
      const webpSize = webpStats.size;
      totalWebpBytes += webpSize;

      const savedBytes = originalSize - webpSize;
      totalSavedBytes += savedBytes;

      const percentage = ((savedBytes / originalSize) * 100).toFixed(1);
      const reductionMsg = savedBytes > 0 
        ? `Saved ${formatBytes(savedBytes)} (${percentage}% reduction)` 
        : `Increased size by ${formatBytes(Math.abs(savedBytes))} (Quality level is too high for this optimization)`;

      console.log(`  ✅ Converted successfully! ${formatBytes(originalSize)} ➡️ ${formatBytes(webpSize)} | ${reductionMsg}`);

      // Delete the original file since conversion succeeded
      await fs.unlink(originalPath);
      console.log(`  🗑️ Original deleted: ${relativePath}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to convert or delete original: ${error.message}`);
      failureCount++;
    }
    console.log('--------------------------------------------------');
  }

  // Summary
  console.log('\n📊 CONVERSION SUMMARY:');
  console.log(`✅ Successfully processed: ${successCount} files`);
  if (failureCount > 0) {
    console.log(`❌ Failed: ${failureCount} files`);
  }
  console.log(`📈 Original Total Size:   ${formatBytes(totalOriginalBytes)}`);
  console.log(`📉 WebP Total Size:       ${formatBytes(totalWebpBytes)}`);
  
  if (totalSavedBytes > 0) {
    const totalPercentage = ((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1);
    console.log(`💾 Total Space Saved:     ${formatBytes(totalSavedBytes)} (${totalPercentage}% reduction)`);
  } else if (totalOriginalBytes > 0) {
    const totalPercentage = ((Math.abs(totalSavedBytes) / totalOriginalBytes) * 100).toFixed(1);
    console.log(`💾 Total Space Increased:   ${formatBytes(Math.abs(totalSavedBytes))} (${totalPercentage}% increase)`);
  }
  console.log('\n✨ Done!');
}

main();
