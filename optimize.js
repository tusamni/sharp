const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const exifr = require('exifr');

let input = './input/';
let output = './output/'

let sizes = [2000];
let formats = ['jpeg', 'webp', 'avif'];

// check for input and output folders
if (!fs.existsSync(input)) {
    fs.mkdirSync(input);
}
if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
}

// read the files in the input directory
fs.readdir(input, function (err, files) {
    if (err) {
        console.log("There was an error reading files from the input folder");
    }

    // foe each of the files
    files.forEach(async function (file) {
        let extension = path.extname(file); // extension of the image file
        let baseFilename = path.basename(file, extension); // filename of the image minus the extension
        let inputFile = `${input}${file}`;
        let outputFile = `${output}${baseFilename}`;

        // get the sizes for the image
        const { width, height } = await sharp(inputFile).metadata();

        // collect all the exif and iptc data from the image
        let options = {
            iptc: ['ObjectName', 'Caption'],
            exif: ['ExposureTime', 'FNumber', 'ISO', 'DateTimeOriginal', 'ShutterSpeedValue', 'ApertureValue', 'Focal Length', 'WhiteBalance', 'LensModel'],
            ifd0: ['Make', 'Model'],
            mergeOutput: false
        }
        // get metadata
        let metadata = await exifr.parse(inputFile, options);
        // add the height and width from sharp
        metadata = Object.assign({ "width": width, "height": height }, metadata)
        let json = JSON.stringify(metadata);
        fs.writeFileSync(`${outputFile}.json`, json);

        sizes.map(function (size) {
            formats.map(function (format) {
                sharp(inputFile)
                    .toFormat(format)
                    .resize(size, size, { fit: "inside" })
                    .toFile(`${outputFile}-w${size}.${format}`)
                    .then(info => { console.log(info) })
                    .catch(err => { console.log(error) })
            })
        })
    });
    //optimizeImage(file, outputPath);
});