const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PASSWORD = process.argv[2];
if (!PASSWORD) {
    console.error('Uso: node encrypt.js "contraseña"');
    process.exit(1);
}

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256');
}

function encryptText(data, password) {
    const salt = crypto.randomBytes(SALT_BYTES);
    const iv = crypto.randomBytes(IV_BYTES);
    const key = deriveKey(password, salt);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        ct: Buffer.concat([encrypted, tag]).toString('base64'),
        iv: iv.toString('base64'),
        salt: salt.toString('base64')
    };
}

function encryptBinary(filePath, password) {
    const data = fs.readFileSync(filePath);
    const salt = crypto.randomBytes(SALT_BYTES);
    const iv = crypto.randomBytes(IV_BYTES);
    const key = deriveKey(password, salt);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        ct: Buffer.concat([encrypted, tag]).toString('base64'),
        iv: iv.toString('base64'),
        salt: salt.toString('base64')
    };
}

const texts = {
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TITLE',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT (No sé quien es tigo pero me refiero a ti)',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT, es increible el pensar en el poco tiempo que ha pasado desde que nos conocemos, el poco tiempo que llevamos de novios y la cantidad de cosas que han pasado hasta ahora.. Y eso sin pensar en todo lo que falta por vivir juntos.',
    'REDACTED_CAMILA_KEY': 'Los Highlights',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT, momentos destacables pe',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_DATE',
    'REDACTED_CAMILA_KEY': 'El Comienzo',
    'REDACTED_CAMILA_KEY': 'Amor, creeme ue soy malos con los consejos pero no me arrepiento de aconsejarte esa noche respecto a tercero medio',
    'REDACTED_CAMILA_KEY': 'En verdad no me acuerdo',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT que querías esperar para darnos nuestro primer besito, que nerviosa te pusiste cuando me lo robaste',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_DATE',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT, aparte de la sorpresa el tener allí junto a mi y mi familia fue algo especial',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_DATE',
    'REDACTED_CAMILA_KEY': 'Dos Meses',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT un mes de novios ya, estabas con la mente en otro lado',
    'REDACTED_CAMILA_KEY': 'Albúm (No de música)',
    'REDACTED_CAMILA_KEY': 'Pa que tengas flashbacks',
    'REDACTED_CAMILA_KEY': '¿Qué siento por ti?',
    'REDACTED_CAMILA_KEY': 'La verdad no es una pregunta con una respuesta concreta, se me haría imposible darle un sentido al sentimiento que tengo por ti, trataré de no irme mucho en volá porque sabes que me gusta filosofar.',
    'REDACTED_CAMILA_KEY': 'Por ti siento mucho amor, cariño, aprecio, admiración y cualquier sinonimo de alguna de estas palabras. Algo que ya te he dicho pero vuelvo a repetir, es que REDACTED_CAMILA_TEXT cada que estoy contigo y es algo que ni si quiera mi familia logra en mi. Aunque nos conocemos hace algunos meses he aprendido mucho de ti y espero que eso nunca cambie, de verdad que has sido y eres una presona muy special para mi en el día a día, literlamente no hay un instante en que no piense en tí más allá de cuando duermo (Y solo si no sueño contigo).',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT, no tienes ni idea de cuanto de verdad. Gracias por estos dos meses y que sean muchos más, yo sé que lo serán.',
    'REDACTED_CAMILA_KEY': 'REDACTED_CAMILA_TEXT',
    'REDACTED_CAMILA_KEY': 'Ti = Tú - Tú = Camila..'
};

console.log('Cifrando textos...');
const encryptedTexts = {};
for (const [key, value] of Object.entries(texts)) {
    encryptedTexts[key] = encryptText(value, PASSWORD);
    console.log(`  ✓ ${key}`);
}

const mediaDir = path.join(__dirname, 'media');
const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

console.log('Cifrando imágenes...');
const encryptedImages = {};
for (const img of images) {
    const imgPath = path.join(mediaDir, img);
    if (fs.existsSync(imgPath)) {
        encryptedImages[img] = encryptBinary(imgPath, PASSWORD);
        console.log(`  ✓ ${img}`);
    } else {
        console.error(`  ✗ ${img} no encontrado`);
    }
}

const output = `window._encryptedData = {
    texts: ${JSON.stringify(encryptedTexts, null, 2)},
    images: ${JSON.stringify(encryptedImages, null, 2)}
};
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), output);
console.log(`\n✓ data.js generado con ${Object.keys(encryptedTexts).length} textos y ${Object.keys(encryptedImages).length} imágenes cifrados.`);
