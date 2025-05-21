import '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';

const MODEL_URL = 'https://raw.githubusercontent.com/GMTteam/kitvn/main/model/model.json';
let model: tf.LayersModel | null = null;

export async function loadModel(): Promise<tf.LayersModel> {
  if (model) return model;
  try {
    await tf.ready();

    // Test backend rn-webgl, nếu lỗi thì fallback cpu
    try {
      await tf.setBackend('rn-webgl');
    } catch (e) {
      console.warn('rn-webgl backend failed, fallback to cpu', e);
      await tf.setBackend('cpu');
    }

    // Load model
    model = await tf.loadLayersModel(MODEL_URL);

    const inputShape = model.inputs[0].shape;
    const dim = inputShape && inputShape[1] ? inputShape[1] : 1;
    
    const dummy = tf.zeros([1, dim]);
    model.predict(dummy as tf.Tensor);
    dummy.dispose();

    return model;
  } catch (e) {
    console.error('Error loading TFJS model:', e);
    throw e;
  }
}