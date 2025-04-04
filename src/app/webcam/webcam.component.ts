import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamModule, WebcamUtil } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { JsonPipe, CommonModule } from '@angular/common';
import { FaceService } from '../face.service';
import { Loggable } from '../logging.decorator';

@Loggable
@Component({
  selector: 'app-webcam',
  standalone: true,
  imports: [WebcamModule, JsonPipe, CommonModule],
  templateUrl: './webcam.component.html',
  styleUrl: './webcam.component.css'
})
export class WebcamComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement', { static: false }) videoElementRef!: ElementRef;
  log: (message: string) => void;
    // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string = "";
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage | null = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  constructor(private faceService: FaceService) {
    this.log = (message: string) => {};
   }

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public ngAfterViewInit(): void {
    this.faceService.loadModels().then(() => {
      console.log('FaceAPI models loaded!');
    });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public async handleImage(webcamImage: WebcamImage): Promise<void> {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;

    const videoElement = this.videoElementRef.nativeElement;
    try {
      const descriptors = await this.faceService.getFaceDescriptors(videoElement);

      if (descriptors.length > 0) {
        this.log('Face detected!');
      } else {
        this.log('No face detected.');
      }
    } catch (error) {
      console.error('Error detecting faces:', error);
    }
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
}
