import * as cocoSsd from "@tensorflow-models/coco-ssd";
import fs from 'fs';
import jpeg from 'jpeg-js';
import * as tf from '@tensorflow/tfjs-node';
import Recorder from './recorder';
import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || null;
const RTSP_URL = process.env.RTSP_URL || null;
const CAPTURE_TIMEOUT = process.env.CAPTURE_TIMEOUT || 5000;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    console.log(`Start capture (${chatId})`);
    bot.sendMessage(chatId, 'Start capture...');
    startCapture(chatId);
});

const startCapture = (chatId) => {
    const rec = new Recorder({
        url: RTSP_URL,
        folder: './images',
        name: 'cam1',
        type: 'image'
    });
    
    let image = null;
    let input = null;
    let photo = null;

    cocoSsd.load()
        .then(model => {
            setInterval(() => {
                rec.captureImage(() => {
                    try {
                        image = readImage('./images/capture.jpg');
                        input = imageToInput(image, 3);

                        model.detect(input)
                            .then(predictions => {
                                if (predictions.filter(item => item.class === 'person').length > 2) {
                                    console.log(`Persons: ${predictions.filter(item => item.class === 'person').length}`);
        
                                    // fs.copyFile('./images/capture.jpg', `./images/${new Date().toISOString().replace(/:/g, '-')}.jpg`, (err) => {
                                    //     if (err) {
                                    //         console.log(err);
                                    //     }
                                    // });
        
                                    photo = fs.readFileSync('./images/capture.jpg');
                                    bot.sendPhoto(chatId, photo);
                                }
                            });

                        input.dispose();
                    } catch(err) {
                        console.log(err);
                    }
                });
            }, CAPTURE_TIMEOUT);
        });
}

const readImage = path => {
    const buf = fs.readFileSync(path);
    const pixels = jpeg.decode(buf, true);
    return pixels;
}

const imageByteArray = (image, numChannels) => {
    const pixels = image.data;
    const numPixels = image.width * image.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let channel = 0; channel < numChannels; ++channel) {
            values[i * numChannels + channel] = pixels[i * 4 + channel];
        }
    }

    return values;
}

const imageToInput = (image, numChannels) => {
    const values = imageByteArray(image, numChannels);
    const outShape = [image.height, image.width, numChannels];
    const input = tf.tensor3d(values, outShape, 'int32');

    return input;
}
