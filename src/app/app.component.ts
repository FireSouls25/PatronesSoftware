import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebcamComponent } from './webcam/webcam.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { FaceRecognitionComponent } from './face-recognition/face-recognition.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WebcamComponent, UserManagementComponent, FaceRecognitionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mi-proyecto';
}
