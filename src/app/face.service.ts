import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class FaceService {

  private faceMatcher: faceapi.FaceMatcher | null = null;

  constructor() {
    this.loadModels();
  }

  async loadModels() {
    const MODEL_URL = '/assets/models'; // Path to the models directory

    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    console.log('FaceAPI models loaded!');
  }

  async getFaceDescriptors(image: HTMLImageElement | HTMLVideoElement) {
    const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    return detections.map(d => d.descriptor);
  }

  async createFaceMatcher(labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[]) {
    this.faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
  }

  async findBestMatch(image: HTMLImageElement | HTMLVideoElement, faceDescriptor: Float32Array) {
    if (!this.faceMatcher) {
      console.warn('FaceMatcher not initialized. Call createFaceMatcher first.');
      return 'unknown';
    }
    const bestMatch = this.faceMatcher.findBestMatch(faceDescriptor);
    return bestMatch.toString();
  }

}
