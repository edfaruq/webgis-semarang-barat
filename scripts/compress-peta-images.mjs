import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target max size: 50KB untuk thumbnail preview
const MAX_SIZE_BYTES = 50 * 1024; // 50KB

// Paths
const sourceDir = path.join(__dirname, '../public/images/peta');
const thumbnailDir = path.join(__dirname, '../public/images/peta/thumbnails');

// Create thumbnails directory if it doesn't exist
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.error('Sharp tidak terinstall. Install dengan: npm install sharp --save-dev');
  console.error('Atau gunakan alternatif lain untuk compress gambar.');
  process.exit(1);
}

async function compressImage(inputPath, outputPath, maxSizeBytes) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    console.log(`Processing: ${path.basename(inputPath)} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
    
    // Get image metadata
    const img = sharp(inputPath);
    const metadata = await img.metadata();
    let width = metadata.width;
    let height = metadata.height;
    
    // Crop border putih/hitam di sekitar peta untuk fokus ke konten utama
    // Crop lebih agresif di sisi kanan untuk menghilangkan legend
    // Crop lebih sedikit di sisi kiri karena konten utama biasanya di kiri
    const cropLeft = Math.floor(metadata.width * 0.05);   // 5% dari kiri
    const cropTop = Math.floor(metadata.height * 0.10);   // 10% dari atas
    const cropRight = Math.floor(metadata.width * 0.25);  // 25% dari kanan (untuk legend)
    const cropBottom = Math.floor(metadata.height * 0.10); // 10% dari bawah
    
    // Calculate dimensions after crop
    const croppedWidth = metadata.width - cropLeft - cropRight;
    const croppedHeight = metadata.height - cropTop - cropBottom;
    
    // Calculate target dimensions for 50KB - very aggressive reduction
    const targetRatio = Math.sqrt(maxSizeBytes / originalSize);
    const dimensionRatio = Math.min(targetRatio * 0.5, 0.45); // Max 45% of original dimensions
    width = Math.floor(croppedWidth * dimensionRatio);
    height = Math.floor(croppedHeight * dimensionRatio);
    
    // If already under max size, just copy it (but still convert to JPG for consistency)
    if (originalSize <= maxSizeBytes && path.extname(inputPath).toLowerCase() === '.jpg') {
      fs.copyFileSync(inputPath, outputPath);
      console.log(`  ✓ Already under ${(maxSizeBytes / 1024).toFixed(0)}KB, copied as-is`);
      return;
    }
    
    let quality = 45; // Start with lower quality for 50KB target
    let currentSize = originalSize;
    let attempts = 0;
    const maxAttempts = 35;
    
    // Binary search for optimal quality
    let minQuality = 20;
    let maxQuality = 65; // Lower max quality for 50KB target
    
    const outputFile = outputPath.replace(/\.(png|jpeg)$/i, '.jpg');
    
    while (attempts < maxAttempts && currentSize > maxSizeBytes) {
      // Crop dulu untuk menghilangkan border, baru resize
      await img
        .extract({
          left: cropLeft,
          top: cropTop,
          width: croppedWidth,
          height: croppedHeight
        })
        .resize(width, height, {
          fit: 'cover', // Cover untuk mengisi kotak dengan crop
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: quality,
          mozjpeg: true,
          progressive: true
        })
        .toFile(outputFile);
      
      const newStats = fs.existsSync(outputFile) ? fs.statSync(outputFile) : null;
      
      if (newStats) {
        currentSize = newStats.size;
        
        if (currentSize <= maxSizeBytes) {
          // Found good quality
          break;
        } else {
          // Need lower quality or smaller dimensions
          if (quality > minQuality + 3) {
            maxQuality = quality;
            quality = Math.floor((minQuality + maxQuality) / 2);
          } else {
            // Reduce dimensions further for 50KB target
            width = Math.floor(width * 0.88);
            height = Math.floor(height * 0.88);
            quality = 45; // Reset quality
          }
        }
      }
      
      attempts++;
    }
    
    const finalStats = fs.existsSync(outputFile) ? fs.statSync(outputFile) : null;
    if (!finalStats) {
      console.error(`  ✗ Failed to create compressed image`);
      return;
    }
    
    const finalSize = finalStats.size;
    const reduction = ((1 - finalSize / originalSize) * 100).toFixed(1);
    
    if (finalSize > maxSizeBytes) {
      console.log(`  ⚠ Compressed to ${(finalSize / 1024).toFixed(0)} KB (target: ${(maxSizeBytes / 1024).toFixed(0)}KB) - ${reduction}% reduction`);
    } else {
      console.log(`  ✓ Compressed to ${(finalSize / 1024).toFixed(0)} KB (${reduction}% reduction)`);
    }
    
  } catch (error) {
    console.error(`  ✗ Error processing ${inputPath}:`, error.message);
  }
}

async function processAllImages() {
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory not found: ${sourceDir}`);
    console.log('Skipping image compression (images may already be compressed or directory not available)');
    return;
  }

  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file) && 
    !file.includes('thumbnail')
  );
  
  if (imageFiles.length === 0) {
    console.log('No images found to compress. Skipping...');
    return;
  }
  
  console.log(`Found ${imageFiles.length} images to process`);
  console.log(`Target size: ${(MAX_SIZE_BYTES / 1024).toFixed(0)}KB per thumbnail\n`);
  
  for (const file of imageFiles) {
    const inputPath = path.join(sourceDir, file);
    // Convert PNG to JPG for smaller file size
    const outputFileName = file.replace(/\.png$/i, '.jpg').replace(/\.jpeg$/i, '.jpg');
    const outputPath = path.join(thumbnailDir, outputFileName);
    
    await compressImage(inputPath, outputPath, MAX_SIZE_BYTES);
  }
  
  console.log(`\n✓ Done! Thumbnails saved to: ${thumbnailDir}`);
  console.log(`\nNote: PNG files have been converted to JPG for better compression`);
  console.log(`\nNext steps:`);
  console.log(`1. Thumbnails (50KB) are used for preview`);
  console.log(`2. Original images are used for download`);
}

processAllImages().catch((error) => {
  console.error('Error during image compression:', error.message);
  console.log('Continuing build process...');
  // Don't exit with error code to allow build to continue
  process.exit(0);
});
