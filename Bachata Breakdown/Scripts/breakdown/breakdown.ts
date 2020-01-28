/// <reference path="../typings/angularjs/angular.d.ts" />

namespace Breakdown {
    export class Instrument {
        constructor(context: AudioContext, public readonly name: string) {
            this.audio = document.createElement("audio");
            let s: HTMLSourceElement = document.createElement("source");
            s.src = "audio/" + name + ".mp3";
            s.type = "audio/mp3";
            this.audio.id = "#" + name;
            this.audio.preload = "auto";
            this.audio.appendChild(s);
            document.body.appendChild(this.audio);
            this.source = context.createMediaElementSource(this.audio);
            this.gain = context.createGain();
            this.gain.gain.value = this.volume = 1;
            this.source.connect(this.gain);
        }
        public readonly audio: HTMLAudioElement;
        public readonly source: MediaElementAudioSourceNode;
        public readonly gain: GainNode;
        private _previousVolume: number;
        public get volume(): number { return this.gain.gain.value; }
        public set volume(value: number) {
            this._previousVolume = this.gain.gain.value;
            this.gain.gain.value = value;
        }
        public get muted(): boolean { return this.volume === 0; }
        public mute(): void {
            if (this.muted)
                this.volume = this._previousVolume || 1;
            else
                this.volume = 0;
        }
    }
    export class MainCtrl implements ng.IController {
        static $inject: string[] = ["$scope"];
        constructor(private $scope: ng.IScope) {
            this.context = new AudioContext();
            this.gain = this.context.createGain();
            this.gain.connect(this.context.destination);
            this._addInstrument("bongo");
            this._addInstrument("guira");
            this._addInstrument("bass");
            let bongo: Instrument = this.instruments[0];
            bongo.audio.ontimeupdate = this.$scope.$apply;
        }

        public get elapsed(): number {
            let bongo: Instrument = this.instruments[0];
            return bongo.audio.currentTime;
        }
        public get percentage(): number {
            let bongo: Instrument = this.instruments[0];
            return bongo.audio.currentTime / bongo.audio.duration;
        }

        public readonly context: AudioContext;
        public readonly gain: GainNode;
        public readonly instruments: Instrument[] = [];
        private _addInstrument(name: string): void {
            let i: Instrument = new Instrument(this.context, name);
            i.gain.connect(this.gain);
            this.instruments.push(i);
        }
        private _playing: boolean = false;
        public get playing(): boolean { return this._playing; }
        public play(): void {
            if (this.context.state === 'suspended') this.context.resume();
            if (this.playing) {
                this.instruments.forEach((instrument: Instrument): void => {
                    instrument.audio.pause();
                });
                this._playing = false;
            } else {
                this.instruments.forEach((instrument: Instrument): void => {
                    instrument.audio.play();
                });
                this._playing = true;
            }
        }
        private _previousVolume: number;
        public get volume(): number { return this.gain.gain.value; }
        public set volume(value: number) {
            this._previousVolume = this.gain.gain.value;
            this.gain.gain.value = value;
        }
        public get muted(): boolean { return this.volume === 0; }
        public mute(): void {
            if (this.muted)
                this.volume = this._previousVolume || 1;
            else
                this.volume = 0;
        }
        public $postLink(): void { }
    }
}

var breakdown: angular.IModule = angular.module("breakdown", []);

breakdown.controller("mainCtrl", Breakdown.MainCtrl);
