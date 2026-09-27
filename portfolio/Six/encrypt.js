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
    'hero-title': 'Six Meses, casi Seven',
    'hero-subtitle': '26 Marzo → 26 Septiembre, 2026',
    'vinetas-title': 'Nuestra Historia',
    'vinetas-intro': 'Mira, esto lo hice con el reloj de Hermione',
    'vineta1-bubble': 'Primera salida con mis papás',
    'vineta1-narration': 'Esta fue la primera salida que tuvimos junto a mis papás, y la primera vez que estuviste tanto tiempo junto a ellos. Y aunque bromeaba respecto a hacer el 2pa, fue un día que me gustó mucho; salir y pasar la tarde contigo, ir al resort y, a pesar de lo que sucedió respecto a la piscina, fue un día muy bonito y que sin duda repetiría. En parte, a mis papás les sirvió para conocerte mejor y eso me alegra de verdad.',
    'vineta2-bubble': 'Día del Baile',
    'vineta2-narration': 'A pesar de los nervios, el estrés y todo esto, fue un día súper bonito y, en mi opinión, te veías hermosa con la ropa del traje del baile. Además, bailaste de una manera hermosa, a pesar de que el baile no fuese uno que te gustara.',
    'vineta3-bubble': 'El cumpleaños de Aron',
    'vineta3-narration': 'Fue la primera vez que salí con Enma solo y la primera vez que mis papás me entregaban esa confianza, y me alegra saber que fue para ir a tu casa, que Enma disfrutase y cuidarla junto a ti. Además, me ayudó a saber o pensar en cómo sería tener una familia juntos.',
    'fechas-title': 'Fechas que me acuerdo',
    'fechas-intro': 'Esq aveces se me olvidan JKASDJKAS',
    'evento1-date': '19 de Febrero, 2026',
    'evento1-title': 'Primera vez que hablamos',
    'evento1-text': 'La verdad fue una muy buena noche y la repetiría mil y un veces.',
    'evento2-date': '26 de Marzo, 2026',
    'evento2-title': 'Aceptaste ser mi novia',
    'evento2-text': 'Aunque te resistías, aceptaste ser mi novia a pesar del tiempo y, en mi opinión, fue una buena decisión.',
    'evento3-date': '23 de Junio, 2026',
    'evento3-title': 'Hablé por primera vez con tu mamá',
    'evento3-text': 'Recuerdo haber estado tan nervioso que sudaba frío y me costaba hablar, pero fue algo lindo y no me arrepiento. Después de todo, es el día en el que se supone empezamos a ser novios.',
    'evento4-date': '26 de Septiembre, 2026',
    'evento4-title': '6 meses juntos',
    'evento4-text': 'Me sorprende lo rápido que pasó el tiempo. Ya 6 meses y la cantidad de cosas que hemos vivido juntos han sido tan lindas y divertidas que, sinceramente, con total seguridad podría decir que este es uno de los pocos años que reviviría sin ningún problema, con tal de que tú formases parte de él, obvio.',
    'album-title': 'Vol Down + Power key',
    'album-intro': '',
    'album1-caption': '',
    'album2-caption': '',
    'album3-caption': '',
    'album4-caption': '',
    'arcade-title': 'Krustyland Arcade',
    'arcade-subtitle': 'No sé qué es esto, esta sección la hizo OpenCode',
    'arcade-intro': ''
};

console.log('Cifrando textos...');
const encryptedTexts = {};
for (const [key, value] of Object.entries(texts)) {
    encryptedTexts[key] = encryptText(value, PASSWORD);
    console.log(`  ✓ ${key}`);
}

const mediaDir = path.join(__dirname, 'imgs');
const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'];

console.log('Cifrando imágenes...');
const encryptedImages = {};
for (const img of images) {
    const imgPath = path.join(mediaDir, img);
    if (fs.existsSync(imgPath)) {
        encryptedImages[img] = encryptBinary(imgPath, PASSWORD);
        console.log(`  ✓ ${img}`);
    } else {
        console.error(`  ✗ ${img} no encontrado en imgs/`);
    }
}

const output = `window._encryptedData = {
    texts: ${JSON.stringify(encryptedTexts, null, 2)},
    images: ${JSON.stringify(encryptedImages, null, 2)}
};
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), output);
console.log(`\n✓ data.js generado con ${Object.keys(encryptedTexts).length} textos y ${Object.keys(encryptedImages).length} imágenes cifrados.`);
