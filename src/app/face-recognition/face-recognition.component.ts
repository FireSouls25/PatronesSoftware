import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FaceService } from '../face.service';
import { CommonModule } from '@angular/common';
import { WebcamComponent } from '../webcam/webcam.component';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-recognition.component.html',
  styleUrl: './face-recognition.component.css',
})
export class FaceRecognitionComponent implements OnInit {
  @ViewChild(WebcamComponent) webcamComponent!: WebcamComponent;
  @Input() users: { name: string; descriptors: Float32Array[] }[] = [];

  public recognizedName: string = 'Unknown';

  constructor(private faceService: FaceService) {}

  ngOnInit(): void {}

  async recognizeFace() {
    if (!this.webcamComponent.webcamImage) {
      alert('Please take a snapshot first.');
      return;
    }

    const image = new Image();
    image.src = this.webcamComponent.webcamImage.imageAsDataUrl;
    image.onload = async () => {
      try {
        const descriptors = await this.faceService.getFaceDescriptors(image);
        if (descriptors.length === 0) {
          alert('No face detected. Please try again.');
          return;
        }

        // Assuming only one face is detected
        const descriptor = descriptors[0];

        // Load users and their descriptors (replace with your actual data loading)
        const labeledFaceDescriptors = await this.usersToLabeledFaceDescriptors();

        if (labeledFaceDescriptors.length === 0) {
          alert('No users registered yet.');
          return;
        }

        await this.faceService.createFaceMatcher(labeledFaceDescriptors);
        const bestMatch = await this.faceService.findBestMatch(image, descriptor);
        this.recognizedName = bestMatch;
      } catch (error) {
        console.error('Error recognizing face:', error);
        alert('Failed to recognize face. See console for details.');
      }
    };
  }

  async usersToLabeledFaceDescriptors(): Promise<faceapi.LabeledFaceDescriptors[]> {
    const labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[] = [];

    for (const user of this.users) {
      if (user.descriptors && user.descriptors.length > 0) {
        const descriptors = user.descriptors.map(d => new Float32Array(d));
        labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(user.name, descriptors));
      }
    }

    return labeledFaceDescriptors;
  }
}
