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
    'story-title': 'StoryTime',
    'story-subtitle': 'Dos mesesitos Contigo (No sé quien es tigo pero me refiero a ti)',
    'story-text': 'Cami realmente no sé por donde empezar, es increible el pensar en el poco tiempo que ha pasado desde que nos conocemos, el poco tiempo que llevamos de novios y la cantidad de cosas que han pasado hasta ahora.. Y eso sin pensar en todo lo que falta por vivir juntos.',
    'highlights-title': 'Los Highlights',
    'highlights-intro': 'Me estoy quedando sin imaginación, momentos destacables pe',
    'card1-date': '19 de Febrero',
    'card1-title': 'El Comienzo',
    'card1-text': 'Amor, creeme ue soy malos con los consejos pero no me arrepiento de aconsejarte esa noche respecto a tercero medio',
    'card2-date': 'En verdad no me acuerdo',
    'card2-title': 'El Beso',
    'card2-text': 'Aún recuerdo cuando me decías que querías esperar para darnos nuestro primer besito, que nerviosa te pusiste cuando me lo robaste',
    'card3-date': '25 de Abril',
    'card3-title': 'Mi Cumpleaños',
    'card3-text': 'La verdad no me arrepiento de esa noche, aparte de la sorpresa el tener allí junto a mi y mi familia fue algo especial',
    'card4-date': '26 de Abril',
    'card4-title': 'Dos Meses',
    'card4-text': 'Ni si quiera recordabas que cumplíamos un mes de novios ya, estabas con la mente en otro lado',
    'album-title': 'Albúm (No de música)',
    'album-intro': 'Pa que tengas flashbacks',
    'feelings-title': '¿Qué siento por ti?',
    'feelings-p1': 'La verdad no es una pregunta con una respuesta concreta, se me haría imposible darle un sentido al sentimiento que tengo por ti, trataré de no irme mucho en volá porque sabes que me gusta filosofar.',
    'feelings-p2': 'Por ti siento mucho amor, cariño, aprecio, admiración y cualquier sinonimo de alguna de estas palabras. Algo que ya te he dicho pero vuelvo a repetir, es que generas en mi una paz indescriptible cada que estoy contigo y es algo que ni si quiera mi familia logra en mi. Aunque nos conocemos hace algunos meses he aprendido mucho de ti y espero que eso nunca cambie, de verdad que has sido y eres una presona muy special para mi en el día a día, literlamente no hay un instante en que no piense en tí más allá de cuando duermo (Y solo si no sueño contigo).',
    'feelings-p3': 'Te amo demasiado mi bebé, no tienes ni idea de cuanto de verdad. Gracias por estos dos meses y que sean muchos más, yo sé que lo serán.',
    'music-title': 'Me recuerdan a ti',
    'music-intro': 'Ti = Tú - Tú = Camila..'
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
