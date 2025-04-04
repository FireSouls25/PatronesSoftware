import { Component, OnInit, ViewChild } from '@angular/core';
import { FaceService } from '../face.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebcamComponent } from '../webcam/webcam.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  @ViewChild(WebcamComponent) webcamComponent!: WebcamComponent;

  public users: { name: string; descriptors: Float32Array[] }[] = [];
  public newUserName: string = '';

  constructor(private faceService: FaceService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async addUser() {
    if (!this.newUserName) {
      alert('Please enter a user name.');
      return;
    }

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

        this.users = [...this.users, { name: this.newUserName, descriptors: descriptors }];
        this.saveUsers();
        this.newUserName = '';
        alert('User added successfully!');
      } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user. See console for details.');
      }
    };
  }

  loadUsers() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }
}
