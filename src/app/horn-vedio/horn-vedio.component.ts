import { Component, ElementRef, Inject, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { HornWebRTCPluginWeb } from '@horn/api/dist/streaming/plugin/platform/web/web.plugin';
import { UsersService, AuthenticationService, HornConfiguration, ChannelsService, ClientService, SearchService, PeerConnectionWrapper } from '@horn/api';
import { WidgetDisplayConfig, WidgetDisplayConfigWrapper as config } from '@horn/common';
import { HornConnection } from '@horn/api';
import { kajam } from '@horn/kajam/dist/kajam'
import * as io from 'socket.io-client';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HornService } from '../horn.service';

const connection = HornConnection.get();
// const kajam = require('@horn/kajam');

@Component({
  selector: 'app-horn-vedio',
  templateUrl: './horn-vedio.component.html',
  styleUrls: ['./horn-vedio.component.css'],
  providers: [HornService]
})

export class HornVedioComponent implements OnInit {
  @ViewChild('myVideo', { static: false })
  myVideo: ElementRef<HTMLVideoElement>

  @ViewChildren('peerVideo')
  peerVideos: QueryList<ElementRef<HTMLVideoElement>>

  videoWidth = 200;
  videoHeight = 200;
  mitronPeers: [];
  socket: any;
  channelId: any;
  constructor(private renderer: Renderer2,
    // private service: CallerService,
    // private auth: AuthenticationService
    private router: Router,
    private HornService: HornService,
    private routerActivate: ActivatedRoute,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    connection['connectionHandler']['connection']['videoHandler']['connectingTimeout'] = 100000;
  }


  userId;
  proxyChannel;
  reservationToken: string;
  AuthorizationToken: any = {
    expires: 15552000,
    provider: "google",
    scope: "base",
    providerId: "107017103915873054577",
    token: "2uhlBLJLKGDmwdZYbQdmzVT7SsKrWhwzNCoVENDvK0BZ6RUFx6gYTAVep8rormeY",
    userId: 19519
  };
  user = {
    name: 'John',
    age: '24',
    type: 'patient',
    email: ''
  }
  doctor = {
    name: 'Dr. David',
    age: '50',
    type: 'doctor'
  }
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

  userData;
  channelDetails;

  setStorage() {
    // document.domain = "horn.co";
    const data = localStorage;
    console.log(data)
  }
  async ngOnInit() {
    this.HornService.getproviders().toPromise().then((data) => {
      console.log(data)
    });
    // redirect from kajam url
    this.HornService.getAuthorized().toPromise().then((data) => {
      console.log(data)
      this.AuthorizationToken = data;
    });
    HornConfiguration.configure({
      requestHeaders: {
        authorization: `Bearer ${this.AuthorizationToken['token']}`,
      },
    });

    this.configurationHorn();
    ClientService.getClients().then((data) => {
      console.log(data, 'client')
    })
    // this.getWidget()

    AuthenticationService.getProviderProfileData().then((providers) => {
      // do something with providers
    });
  }

  getWidget() {
    // const channel = id;
    let script = this._renderer2.createElement('script');
    script.type = `text/javascript`;
    script.text = `
      co.horn.widget.run({
      channel: '437dd6ab-499b-4e1a-9e4c-2862f1990503',
      clientId: 'XOQZIpR3NNwA3sRZWac2',
      showInvitation:true,
      requireTerms: false,
      guestOnly:true,
      skipLobby: true,
      display: {
      container: 'horn-container',
      width: '250',
      height: '300'
      }})`;

    this._renderer2.appendChild(this._document.body, script);
  }

  // 437dd6ab-499b-4e1a-9e4c-2862f1990503

  async configurationHorn() {


    // HornConfiguration.configure({
    //   requestHeaders: {
    //     authorization: 'Bearer LqijpeyHSayC4itOkiktcoZP1SS0zMYNGht4RGeO6U8GZkmyBncC321EQ8LaGRYh',
    //   },
    //   // authToken: 'NjzZvBTwSMDEd56FXHnScrVBaIBLcNLXZIzdNNlH5CxB1qsb4c1yKMjGiIdE0WvL'
    // });
    AuthenticationService.getIdAndAuth().then((data) => {
      this.userId = data;
    });
    // UsersService.register('NjzZvBTwSMDEd56FXHnScrVBaIBLcNLXZIzdNNlH5CxB1qsb4c1yKMjGiIdE0WvL', '', '', 'pooja', 'test').then((data) => {
    //   console.log(data)
    // })
    await SearchService.getChannelsOwned().then((channels) => {
      this.channelDetails = channels
      console.log(channels, 'channel');
    });
    ChannelsService.createChannel('channel_123').then((channels) => {
      this.channelDetails = channels
    });
    // console.log(this.channelDetails, this.channelDetails['channelUuid'])
    // ChannelsService.getChannelTURNCredentials(this.channelDetails['channelUuid']).then((data) => {
    // })
    // await ChannelsService.getProxyForChannel(this.channelDetails.channelUuid).then(data => {
    //   this.proxyChannel = data;
    // });
    // await UsersService.reserveHandle('Teleview').then((handle) => {
    //   console.log(handle);
    //   this.reservationToken = handle;
    // })
    // console.log(this.reservationToken)
    // UsersService.register(this.reservationToken, 'pooja@gmail.com', 'pooja', 'test').then((data) => {
    //   console.log(data);
    // });
    UsersService.isHandleUnique('Rasika').then((isUnique) => {
      console.log(isUnique, 'user');
    });

    AuthenticationService.getAccountContexts('XOQZIpR3NNwA3sRZWac2').then((data) => {
    })

  }

  start() {
    this.configurationHorn()
    // LqijpeyHSayC4itOkiktcoZP1SS0zMYNGht4RGeO6U8GZkmyBncC321EQ8LaGRYh

    this.startButtonDisabled = true;
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
      .then((stream) => {
        this.localVideo.nativeElement.srcObject = stream;
        this.localStream = stream;
        this.callButtonDisabled = false;
        const peer = new PeerConnectionWrapper(null);
        peer.getConnection();
        peer.setLocalStream(stream);
        // this.call()
        const connection = HornConnection.get();
        connection.configure('0bee9dbc-cef4-4ce9-b496-b482f7dd82c8');
        // ChannelsService.deleteBreakoutRoomParticipant
        connection.onConnected(() => {
          console.log('Connected!!!');
        });

        connection.start()
      })
      .catch(function (e) {
        // alert('getUserMedia() error: ' + e.name);
      });
    // UsersService.register('', '', '', 'Bob')
  }

}
