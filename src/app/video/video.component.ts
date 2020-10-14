import { Component, OnInit, ViewChild, ElementRef, Renderer2, ViewChildren, QueryList } from '@angular/core';
// import { CallerService } from '../caller.service';
import { HornWebRTCPluginWeb } from '@horn/api/dist/streaming/plugin/platform/web/web.plugin';
import { UsersService, HornConfiguration } from '@horn/api';
import { WidgetDisplayConfig } from '@horn/common';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  providers: [UsersService]
})
export class VideoComponent implements OnInit {
  @ViewChild('myVideo', { static: false })
  myVideo: ElementRef<HTMLVideoElement>

  @ViewChildren('peerVideo')
  peerVideos: QueryList<ElementRef<HTMLVideoElement>>

  videoWidth = 200;
  videoHeight = 200;
  mitronPeers: [];
  constructor(private renderer: Renderer2,
    // private service: CallerService,
    // private auth: AuthenticationService
  ) { }



  ngOnInit() {
    // this.startCamera();
    //   UsersService.isHandleUnique('Bob').then((isUnique) => {
    //     console.log(isUnique)
    //     // isUnique is an boolean saying either 'Bob' is an unique user handle or not
    // });

    // navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 }, audio: true })
    //   .then(stream => {

    //     this.myVideo.nativeElement.srcObject = stream
    //     this.myVideo.nativeElement.play()
    //   });
    this.start();
  }

  startCamera() {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      navigator.getUserMedia(
        { video: true, audio: true },
        stream => {
          const localVideo = document.getElementById("local-video");
          if (localVideo) {
            localVideo['srcObject'] = stream;
            this.attachVideo.bind(this)
          }
        },
        error => {
          console.warn(error.message);
        }
      );
    } else {
      alert('Sorry, camera not available.');

    }


    //   if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { 
    // navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
    //   } else {
    //       alert('Sorry, camera not available.');
    //   }
  }

  attachVideo(stream) {
    // this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  }

  handleError(error) {
    console.log('Error: ', error);
  }

  @ViewChild('startButton', { static: false }) startButton: ElementRef;
  @ViewChild('callButton', { static: false }) callButton: ElementRef;
  @ViewChild('hangupButton', { static: false }) hangupButton: ElementRef;
  @ViewChild('localVideo', { static: false }) localVideo: ElementRef;
  @ViewChild('remoteVideo', { static: false }) remoteVideo: ElementRef;

  startButtonDisabled = false;
  callButtonDisabled = true;
  hangupButtonDisabled = true;

  startTime;
  localStream;
  pc1;
  pc2;
  offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  getName(pc) {
    return (pc === this.pc1) ? 'pc1' : 'pc2';
  }

  getOtherPc(pc) {
    return (pc === this.pc1) ? this.pc2 : this.pc1;
  }

  gotStream(stream) {
    this.trace('Received local stream');
    this.localVideo.nativeElement.srcObject = stream;
    this.localStream = stream;
    this.callButtonDisabled = false;
  }

  start() {
    const plug = HornWebRTCPluginWeb.get();
    console.log(plug)
    // ({
    //   channel: '437dd6ab-499b-4e1a-9e4c-2862f1990503',
    //   display: {
    //     container: 'horn-container',
    //     width: 250,
    //     height: 300
    //   }
    // })
    this.trace('Requesting local stream');
    this.startButtonDisabled = true;
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
      .then(this.gotStream.bind(this))
      .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
      });
  }

  addVideoStream(video, stream) {
    video.srcObject = stream;
    // video.addVedio = 
  }

  call() {
    this.callButtonDisabled = true;
    this.hangupButtonDisabled = false;
    this.trace('Starting call');
    this.startTime = window.performance.now();
    var videoTracks = this.localStream.getVideoTracks();
    var audioTracks = this.localStream.getAudioTracks();
    if (videoTracks.length > 0) {
      this.trace('Using video device: ' + videoTracks[0].label);
    }
    if (audioTracks.length > 0) {
      this.trace('Using audio device: ' + audioTracks[0].label);
    }
    var servers = null;
    this.pc1 = new RTCPeerConnection(servers);
    this.trace('Created local peer connection object pc1');
    this.pc1.onicecandidate = e => {
      this.onIceCandidate(this.pc1, e);
    };
    this.pc2 = new RTCPeerConnection(servers);
    this.trace('Created remote peer connection object pc2');
    this.pc2.onicecandidate = e => {
      this.onIceCandidate(this.pc2, e);
    };
    this.pc1.oniceconnectionstatechange = e => {
      this.onIceStateChange(this.pc1, e);
    };
    this.pc2.oniceconnectionstatechange = e => {
      this.onIceStateChange(this.pc2, e);
    };
    this.pc2.ontrack = this.gotRemoteStream.bind(this);

    this.localStream.getTracks().forEach(
      track => {
        this.pc1.addTrack(
          track,
          this.localStream
        );
      }
    );
    this.trace('Added local stream to pc1');

    this.trace('pc1 createOffer start');
    this.pc1.createOffer(
      this.offerOptions
    ).then(
      this.onCreateOfferSuccess.bind(this),
      this.onCreateSessionDescriptionError.bind(this)
    );
  }

  onCreateSessionDescriptionError(error) {
    this.trace('Failed to create session description: ' + error.toString());
  }

  onCreateOfferSuccess(desc) {
    this.trace('Offer from pc1\n' + desc.sdp);
    this.trace('pc1 setLocalDescription start');
    this.pc1.setLocalDescription(desc).then(
      () => {
        this.onSetLocalSuccess(this.pc1);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
    this.trace('pc2 setRemoteDescription start');
    this.pc2.setRemoteDescription(desc).then(
      () => {
        this.onSetRemoteSuccess(this.pc2);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
    this.trace('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    this.pc2.createAnswer().then(
      this.onCreateAnswerSuccess.bind(this),
      this.onCreateSessionDescriptionError.bind(this)
    );
  }

  onSetLocalSuccess(pc) {
    this.trace(this.getName(pc) + ' setLocalDescription complete');
  }

  onSetRemoteSuccess(pc) {
    this.trace(this.getName(pc) + ' setRemoteDescription complete');
  }

  onSetSessionDescriptionError(error) {
    this.trace('Failed to set session description: ' + error.toString());
  }

  gotRemoteStream(e) {
    if (this.remoteVideo.nativeElement.srcObject !== e.streams[0]) {
      this.remoteVideo.nativeElement.srcObject = e.streams[0];
      this.trace('pc2 received remote stream');
    }
  }

  onCreateAnswerSuccess(desc) {
    this.trace('Answer from pc2:\n' + desc.sdp);
    this.trace('pc2 setLocalDescription start');
    this.pc2.setLocalDescription(desc).then(
      () => {
        this.onSetLocalSuccess(this.pc2);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
    this.trace('pc1 setRemoteDescription start');
    this.pc1.setRemoteDescription(desc).then(
      () => {
        this.onSetRemoteSuccess(this.pc1);
      },
      this.onSetSessionDescriptionError.bind(this)
    );
  }

  onIceCandidate(pc, event) {
    this.getOtherPc(pc).addIceCandidate(event.candidate)
      .then(
        () => {
          this.onAddIceCandidateSuccess(pc);
        },
        (err) => {
          this.onAddIceCandidateError(pc, err);
        }
      );
    this.trace(this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
      event.candidate.candidate : '(null)'));
  }

  onAddIceCandidateSuccess(pc) {
    this.trace(this.getName(pc) + ' addIceCandidate success');
  }

  onAddIceCandidateError(pc, error) {
    this.trace(this.getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
  }

  onIceStateChange(pc, event) {
    if (pc) {
      this.trace(this.getName(pc) + ' ICE state: ' + pc.iceConnectionState);
      console.log('ICE state change event: ', event);
    }
  }

  hangup() {
    this.trace('Ending call');
    this.pc1.close();
    this.pc2.close();
    this.pc1 = null;
    this.pc2 = null;
    this.hangupButtonDisabled = true;
    this.callButtonDisabled = false;
  }

  trace(arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', arg);
  }
}
