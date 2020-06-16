import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { interval } from 'rxjs';
import videojs from 'video.js';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: [
    './player.component.scss'
  ],
  encapsulation: ViewEncapsulation.None,
})
export class PlayerComponent implements OnInit {

  // videoUrl = '//vjs.zencdn.net/v/oceans.mp4';
  // videoUrl = 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4';
  // videoUrl = 'https://www.iandevlin.com/html5test/webvtt/v/upc-tobymanley.mp4';
  videoUrl = 'http://ptgmedia.pearsoncmg.com/imprint_downloads/peachpit/peachpit/downloads/0321793935/media//elephants-dream-medium.mp4';
  
  mymeType = 'video/mp4';

  seekTime = 0;

  @ViewChild('target', {static: true}) target: ElementRef;

  player: videojs.Player;

  options = {
  autoplay: true,
  controls: true,
  sources: [{ src: this.videoUrl, type: this.mymeType }],
  controlBar: {
    'pictureInPictureToggle': false
  },
  aspectRatio: '16:9',
  fluid: true,
  };

  notifyCurrentTime$ = interval(5000);
  currentPlayingTime = 0;
  notifyCurrentTime = this.notifyCurrentTime$.subscribe( () => {
    this.currentPlayingTime = this.target.nativeElement.currentTime;
  });

  lastPlayingTime$ = interval(100);
  lastPlayingTime = 0;
  _nextTimeStartAt; 
 
  volume;

  ended = false;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
        // instantiate Video.js

        this.player = videojs(this.target.nativeElement, this.options, () => {
          this.volume = this.player.volume();

          if (localStorage.getItem('videoUrl')) {
            this.videoUrl = localStorage.getItem('videoUrl');
            this.player.src(this.videoUrl);
          } 
          localStorage.setItem('videoUrl', this.videoUrl);

          this.player.on('ended', () => this.onEnd());
          this.player.on('volumechange', () => this.onVolumeChange());
          this.player.on('play', () => this.onPlay());

          this.player.play();

          console.log('videoUrl', this.videoUrl);
        });
  }

  onEnd() {
    this.ended = true;
  }

  onVolumeChange() {
    this.volume = this.player.volume();
  }

  onPlay() {
    if (localStorage.getItem('videoLatestCurrentTime')) {
      this.target.nativeElement.currentTime = localStorage.getItem('videoLatestCurrentTime');
    }
    this._nextTimeStartAt = this.lastPlayingTime$.subscribe( () => this.nextTimeStartAt(this.target.nativeElement.currentTime));
    this.ended = false;
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
    this.nextTimeStartAt(this.target.nativeElement.currentTime);
  }

  watch() {
    this.player.src(this.videoUrl);
    this.ended = false;
    localStorage.setItem('videoUrl', this.videoUrl);
  }

  nextTimeStartAt(time) {
    localStorage.setItem('videoLatestCurrentTime', time);
  }

  seek() {
    this.target.nativeElement.currentTime = this.seekTime;
    this.player.play();
  }

  mp4Selected() {
    this.mymeType = 'video/mp4';
  }

  xmpegURLSelected() {
    this.mymeType = 'application/x-mpegURL';
  }

  dashxmlSelected() {
    this.mymeType = 'application/dash+xml';
  }

  oggSelected() {
    this.mymeType = 'video/ogg';
  }
}
