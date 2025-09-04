
const path = require('path');
const fs = require('fs'); // You already have this, but just to be complete in the 
const { baseURL } = require("../../config");

// Función utilitaria para mover archivos usando streams
const moveFile = async (source, destination) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source, { highWaterMark: 1024 * 1024 }); // Buffer de 1MB
    const writeStream = fs.createWriteStream(destination);

    let error = null;

    readStream.on('error', err => {
      error = err;
      writeStream.end();
    });

    writeStream.on('error', err => {
      error = err;
      readStream.destroy();
    });

    writeStream.on('finish', () => {
      if (error) {
        // Si hubo error, intentamos limpiar el archivo de destino
        fs.unlink(destination, () => reject(error));
        return;
      }
      
      // Eliminar el archivo original solo si la escritura fue exitosa
      fs.unlink(source, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    readStream.pipe(writeStream);
  });
};

exports.upload = async (req, res) => {
  try {
    if (!req.body.inFolder) {
        return res.status(200).json({ status: false, message: "Invalid Folder!" });
    }
    if (!req.body.toFilename) {
        return res.status(200).json({ status: false, message: "Invalid Filename!" });
    }

    const inFolderParam = req.body.inFolder;
    const folderPath = path.join(__dirname, '../../storage', inFolderParam);
    const pathOrg = path.join(__dirname, '../..', req.file.path);
    const pathDst = path.join(folderPath, req.body.toFilename);

    // Create the folder if it doesn't exist (and any necessary parent folders)
    fs.mkdirSync(folderPath, { recursive: true });

    // Mover el archivo
    console.log('Moving file from:', pathOrg);
    console.log('Moving file to:', pathDst);
    await moveFile(pathOrg, pathDst);

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Server Error" });
  }
};

exports.move = async (req, res) => {
  try {
    console.log('Gichub Move Init');
    if (!req.body.inFolder) {
        console.log('Gichub Move Init 1');
        return res.status(200).json({ status: false, message: "Invalid Folder!" });
    }
    if (!req.body.toFolder) {
      console.log('Gichub Move Init 2');
      return res.status(200).json({ status: false, message: "Invalid toFolder!" });
  }
    if (!req.body.toFilename) {
      console.log('Gichub Move Init 3');
        return res.status(200).json({ status: false, message: "Invalid Filename!" });
    }

    console.log('Gichub Move Init 4');
    const inFolderParam = req.body.inFolder;
    const toFolderParam = req.body.toFolder;
    const inFolderPath = path.join(__dirname, '../../storage', inFolderParam);
    const toFolderPath = path.join(__dirname, '../../storage', toFolderParam);
    const pathOrg = path.join(inFolderPath, req.body.toFilename);
    const pathDst = path.join(toFolderPath, req.body.toFilename);
    console.log('Gichub Move Init 6: ', pathOrg);
    console.log('Gichub Move Init 7: ', pathDst);

    // Create the folder if it doesn't exist (and any necessary parent folders)
    fs.mkdirSync(inFolderPath, { recursive: true });
    fs.mkdirSync(toFolderPath, { recursive: true });

    console.log('Gichub Move Init 8');

    // Mover el archivo
    console.log('Moving file from:', pathOrg);
    console.log('Moving file to:', pathDst);
    await moveFile(pathOrg, pathDst);

    console.log('Gichub Move Init 9');

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Server Error" });
  }
};

exports.list = async (req, res) => {
  try {
    console.log('JSR Gichub List Ini');

    if (!req.body.inFolder) {
        return res.status(200).json({ status: false, message: "Invalid Folder!" });
    }

    const inFolderParam = req.body.inFolder;
    const folderPath = path.resolve(__dirname, '../../storage', inFolderParam);

    console.log('JSR Gichub List folderPath: ', folderPath);
    
    // Verificar si el directorio existe
    try {
      await fs.promises.access(folderPath);
    } catch (error) {
      console.log('Folder not found!: ', folderPath);
      return res.status(200).json({ 
        status: false, 
        message: "Folder not found!" 
      });
    }

    // SOLUCIÓN: Forzar sync del filesystem antes de leer
    try {
      // Sync explícito del directorio para evitar race conditions
      const dirHandle = await fs.promises.opendir(folderPath);
      await dirHandle.close();
      console.log('JSR Gichub List - Directory sync completed');
    } catch (syncError) {
      console.log('JSR Gichub List - Directory sync warning:', syncError.message);
    }

    console.log('JSR Gichub List getFiles');
    const files = await fs.promises.readdir(folderPath);
    
    // SOLUCIÓN: Procesar archivos secuencialmente con reintentos para evitar race conditions
    const fileDetails = [];
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      
      let stats = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      // Reintentar stat() con pequeño delay para manejar filesystem caching
      while (attempts < maxAttempts && !stats) {
        try {
          stats = await fs.promises.stat(filePath);
        } catch (statError) {
          attempts++;
          if (attempts < maxAttempts) {
            // Pequeño delay antes del reintento (10ms)
            await new Promise(resolve => setTimeout(resolve, 10));
            console.log(`JSR Gichub List - Retrying stat for file ${file}, attempt ${attempts}`);
          } else {
            console.log(`JSR Gichub List - Skipping file ${file} - stat failed after ${maxAttempts} attempts:`, statError.message);
            continue; // Saltar este archivo si no se puede acceder
          }
        }
      }
      
      // Solo incluir archivos que se pudieron leer correctamente
      if (stats) {
        const download_url = baseURL + "storage/" + inFolderParam + "/" + file;
        
        fileDetails.push({
          name: file,
          download_url: download_url,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    }

    console.log('JSR Gichub List Files: ', fileDetails);

    return res.status(200).json({
      status: true,
      message: "Success",
      files: fileDetails
    });

  } catch (error) {
    console.log('JSR Gichub List Error: ', error);
    return res.status(500).json({ status: false, message: error.message || "Server Error" });
  }
};

exports.delete = async (req, res) => {
  console.log('Gichub Delete Init');
  try {
    if (!req.body.inFolder) {
        return res.status(200).json({ status: false, message: "Invalid Folder!" });
    }
    if (!req.body.toFilename) {
        return res.status(200).json({ status: false, message: "Invalid Filename!" });
    }

    const inFolderParam = req.body.inFolder;
    const folderPath = path.join(__dirname, '../../storage', inFolderParam);
    const pathDst = path.join(folderPath, req.body.toFilename);

    // Eliminar el archivo
    console.log('Deleting file from:', pathDst);

    // Verificar si el archivo existe antes de intentar eliminarlo
    try {
      // fs.access lanza un error si el archivo no existe o no se puede acceder
      await fs.promises.access(pathDst);
      // Si llegamos aquí, el archivo existe, así que lo eliminamos
      await fs.promises.unlink(pathDst);
      console.log('File deleted successfully from:', pathDst);
      return res.status(200).json({ status: true, message: "File deleted successfully" });
    } catch (error) {
      // Si fs.access lanza un error, significa que el archivo no existe o hay un problema de acceso.
      // En este caso, asumimos que no existe y respondemos con éxito (indicando que no había nada que eliminar).
      if (error.code === 'ENOENT') { // Error 'ENOENT' significa "No such file or directory"
        console.log('File not found at:', pathDst, '. Nothing to delete.');
        return res.status(200).json({ status: true, message: "File not found, nothing to delete" });
      } else {
        // Si es otro tipo de error (permisos, etc.), lo propagamos al catch principal
        throw error;
      }
    }

    //return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Server Error" });
  }
};