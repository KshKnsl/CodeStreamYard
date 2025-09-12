const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Installing FFmpeg for streaming support...');

try {
  // Check if ffmpeg-static is already installed
  const ffmpegPath = require('ffmpeg-static');
  
  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    console.log('✅ FFmpeg is already installed via ffmpeg-static');
    console.log(`📁 FFmpeg location: ${ffmpegPath}`);
    
    // Create a symlink or copy to make it globally accessible (optional)
    const binDir = path.join(__dirname, '..', 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    
    const targetPath = path.join(binDir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
    
    if (!fs.existsSync(targetPath)) {
      try {
        // Try to create a hard link first, fallback to copy
        fs.linkSync(ffmpegPath, targetPath);
        console.log(`🔗 Created hard link at: ${targetPath}`);
      } catch (linkError) {
        fs.copyFileSync(ffmpegPath, targetPath);
        console.log(`📋 Copied FFmpeg to: ${targetPath}`);
      }
      
      // Make executable on Unix systems
      if (process.platform !== 'win32') {
        fs.chmodSync(targetPath, '755');
      }
    }
    
    process.exit(0);
  }
} catch (error) {
  console.log('⚠️  ffmpeg-static not found, attempting installation...');
}

// Platform-specific installation
const platform = process.platform;
const arch = process.arch;

console.log(`🔍 Detected platform: ${platform} (${arch})`);

function installFFmpegFallback() {
  console.log('📦 Installing FFmpeg using system package manager...');
  
  try {
    switch (platform) {
      case 'win32':
        console.log('🪟 Windows detected - FFmpeg should be manually installed or use ffmpeg-static');
        console.log('💡 Recommendation: Download from https://ffmpeg.org/download.html#build-windows');
        break;
        
      case 'linux':
        try {
          // Try apt (Ubuntu/Debian)
          execSync('apt-get update && apt-get install -y ffmpeg', { stdio: 'inherit' });
          console.log('✅ FFmpeg installed via apt');
        } catch {
          try {
            // Try yum (CentOS/RHEL)
            execSync('yum install -y ffmpeg', { stdio: 'inherit' });
            console.log('✅ FFmpeg installed via yum');
          } catch {
            try {
              // Try apk (Alpine)
              execSync('apk add --no-cache ffmpeg', { stdio: 'inherit' });
              console.log('✅ FFmpeg installed via apk');
            } catch {
              console.log('❌ Could not install FFmpeg automatically on this Linux distribution');
              console.log('💡 Please install manually: sudo apt install ffmpeg (or equivalent)');
            }
          }
        }
        break;
        
      case 'darwin':
        try {
          // Try Homebrew
          execSync('brew install ffmpeg', { stdio: 'inherit' });
          console.log('✅ FFmpeg installed via Homebrew');
        } catch {
          console.log('❌ Could not install FFmpeg via Homebrew');
          console.log('💡 Please install manually: brew install ffmpeg');
        }
        break;
        
      default:
        console.log(`❌ Unsupported platform: ${platform}`);
        console.log('💡 Please install FFmpeg manually for your platform');
    }
  } catch (error) {
    console.error('❌ FFmpeg installation failed:', error.message);
    console.log('💡 Please install FFmpeg manually for your platform');
  }
}

// Verify installation
function verifyFFmpeg() {
  try {
    const version = execSync('ffmpeg -version', { encoding: 'utf8' });
    console.log('✅ FFmpeg installation verified!');
    console.log('📋 Version info:');
    console.log(version.split('\n')[0]); // First line contains version
    return true;
  } catch (error) {
    console.log('❌ FFmpeg verification failed');
    return false;
  }
}

// Run installation
if (platform === 'linux' || platform === 'darwin') {
  installFFmpegFallback();
  
  // Verify the installation
  setTimeout(() => {
    if (verifyFFmpeg()) {
      console.log('🎉 FFmpeg setup complete!');
    } else {
      console.log('⚠️  FFmpeg may not be properly installed. Please check manually.');
    }
  }, 1000);
} else {
  console.log('⚠️  Skipping automatic installation on Windows');
  console.log('💡 Using ffmpeg-static package instead');
  
  // On Windows, rely on ffmpeg-static
  try {
    const ffmpegPath = require('ffmpeg-static');
    console.log(`✅ Using ffmpeg-static: ${ffmpegPath}`);
  } catch {
    console.log('❌ ffmpeg-static not available. Please install FFmpeg manually.');
  }
}