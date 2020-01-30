/// <reference path="../typings/angularjs/angular.d.ts" />

declare var Tone, Vue;

namespace BB {
    const eight: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    class Section {
        constructor(
            public readonly title: string,
            public readonly rhythm: string,
            public readonly start: number,
            public readonly bars: number) {
            this.measures = Math.ceil(this.bars / 2);
        }
        public readonly measures: number;
        public measureMarkers(): number[] { return eight.slice(0, this.measures); }
        public beatsInMeasure(measure: number): number { return this.bars % 2 === 1 && measure === this.measures ? 4 : 8; }
        public beatMarkers(measure: number): number[] { return eight.slice(0, this.beatsInMeasure(measure)); }
    }
    class Sections {
        [section: number]: Section;
        private _count: number = 0;
        public get count(): number { return this._count; }
        public add(title: string, rhythm: string, bars: number): this {
            let start: number = this._count === 0 ? 1 : this[this._count - 1].bars * 4 + this[this._count - 1].start;
            this[this._count] = new Section(title, rhythm, start, bars);
            this._count++;
            return this;
        }
        sectionAtBeatIndex(beatIndex: number): Section {
            for (var i: number = this._count - 1; i > 0; i--) {
                if (this[i].start <= beatIndex) break;
            }
            return this[i];
        }
    }
    type Level = "mute" | "normal" | "loud";
    class Instrument {
        constructor(
            public readonly name: string,
            public readonly startTime: number = 0,
            public readonly normalVolume: number = -15,
            public readonly loudVolume: number = 0) {
            this.player = new Tone.Player("audio/" + name + ".mp3").sync().start(startTime).toMaster();
            this.player.volume.value = normalVolume;
        }
        public readonly player: any;
        public level: Level = "normal"
    }
    export class MainCtrl implements ng.IController {
        static $inject: string[] = ["$scope"];
        constructor(private $scope: ng.IScope) {
            Tone.Transport.timeSignature = 4;
            Tone.Transport.bpm.value = 124;
            this.sections
                .add("Count-In", "Count-In", 1)
                .add("Intro", "Majao", 8)
                .add("Verse 1", "Derecho", 8)
                .add("Chorus", "Majao", 8)
                .add("Bridge", "Derecho", 8)
                .add("Verse 2", "Derecho", 8)
                .add("Chorus", "Majao", 8)
                .add("Bridge", "Urban/Majao", 4)
                .add("Mambo", "Majao", 8)
                .add("Breakdown", "Urban", 9)
                .add("Chorus", "Majao", 8);
            this.instruments.push(new Instrument("bongo"));
            this.instruments.push(new Instrument("guira"));
            this.instruments.push(new Instrument("bass"));
            this.instruments.push(new Instrument("segunda", 2.1));
            this.instruments.push(new Instrument("requinto", 1.4, -15, -5));
            Tone.Buffer.on("load", () => {
                this.ready = true;
                $scope.$apply();
                Tone.Transport.scheduleRepeat((): void => {
                    let segments: string = Tone.Transport.position.split(":");
                    this.beatIndex = (parseInt(segments[0]) * 4) + parseInt(segments[1]);
                    $scope.$apply();
                }, "4n", "0:1");
            });
        }
        public ready: boolean = false;
        public beatIndex: number = 0;
        public get measure(): number {
            if (!this.section) return;
            return Math.floor((this.beatIndex - this.section.start) / 8) + 1;
        }
        public get beat(): number {
            if (!this.section) return;
            return ((this.beatIndex - this.section.start) % this.section.beatsInMeasure(this.measure)) + 1;
        }
        public sections: Sections = new Sections();
        public get section(): Section {
            if (!this.beatIndex) return;
            return this.sections.sectionAtBeatIndex(this.beatIndex);
        }
        public instruments: Instrument[] = [];

        public playing: boolean = false;
        public toggle(): void {
            if (Tone.Transport.state === "started") {
                Tone.Transport.pause();
                this.playing = false;
            } else {
                Tone.Transport.start();
                this.playing = true;
            }
        }


        public $postLink(): void { }
    }
}


namespace Breakdown {
    export type Level = "mute" | "quiet" | "normal";
    export interface Instrument { name: string; start?: number; quiet?: number; normal?: number; level?: Level; }
    export interface Phrasex { start: number; length: number; title: string; rhythm: string; }






    export class MainCtrl implements ng.IController {
        static $inject: string[] = ["$scope"];
        constructor($scope: ng.IScope) {
            Tone.Transport.timeSignature = 4;
            Tone.Transport.bpm.value = 124;
            angular.forEach(this.instruments, (i: Instrument): void => {
                this[i.name] = new Tone.Player("audio/" + i.name + ".mp3").sync().start(i.start || 0).toMaster();
                this[i.name].volume.value = i.normal || 0;
                i.level = "normal";
            });
            Tone.Buffer.on("load", () => {
                this.ready = true;
                $scope.$apply();
                Tone.Transport.scheduleRepeat((): void => {
                    let segments: string = Tone.Transport.position.split(":");
                    this.counter = ((parseInt(segments[0]) - 1) * 4) + parseInt(segments[1]);
                    if (this.counter < 1) this.phrase = null;
                    else if (this.counter <= 32) this.phrase = this.phrases[0];
                    else if (this.counter <= 64) this.phrase = this.phrases[1];
                    else if (this.counter <= 96) this.phrase = this.phrases[2];
                    else if (this.counter <= 128) this.phrase = this.phrases[3];
                    else if (this.counter <= 160) this.phrase = this.phrases[4];
                    else if (this.counter <= 192) this.phrase = this.phrases[5];
                    else this.phrase = null;
                    $scope.$apply();
                }, "4n", "0:1");
            });
        }
        public counter: number;
        public get beat(): number { return ((this.counter - 1) % 4) + 1; }
        public get step(): number { return ((this.counter - 1) % 8) + 1; }
        public get measures(): number {
            if (!this.phrase) return;
            return this.phrase.length / 8;
        }
        public get measure(): number {
            if (!this.phrase) return;
            return (Math.floor((this.counter - 1) / 8) % this.measures) + 1;
        }

        public readonly blocks: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

        public ready: boolean = false;
        public readonly instruments: Instrument[] = [
            { name: "bongo" },
            { name: "guira" },
            { name: "bass" },
            { name: "segunda", start: 2.1 },
            { name: "requinto", start: 1.4, quiet: -15, normal: -5 }
        ];
        public level(i: Instrument, level: Level): void {
            i.level = level;
            switch (i.level) {
                case "mute": this[i.name].mute = true; break;
                case "quiet": this[i.name].mute = false; this[i.name].volume.value = i.quiet || - 15; break;
                case "normal": this[i.name].mute = false; this[i.name].volume.value = i.normal || 0; break;
            }
        }
        public rewind(): void {
            let restart: boolean = Tone.Transport.state === "started";
            Tone.Transport.stop();
            if (restart) Tone.Transport.start(0);
        }
        public toggle(): void {
            if (Tone.Transport.state === "started")
                Tone.Transport.pause();
            else
                Tone.Transport.start();
        }
        public phrase: Phrasex;
        public phrases: Phrasex[] = [
            { start: 1, length: 32, title: "Intro", rhythm: "Majao" },
            { start: 33, length: 32, title: "Verse 1", rhythm: "Derecho" },
            { start: 65, length: 32, title: "Chorus", rhythm: "Majao" },
            { start: 97, length: 32, title: "Bridge", rhythm: "Derecho" },
            { start: 129, length: 32, title: "Verse 2", rhythm: "Derecho" },
            { start: 161, length: 32, title: "Chorus", rhythm: "Majao" },
        ];
        public $postLink(): void { }
    }
}

var breakdown: angular.IModule = angular.module("breakdown", []);
breakdown.controller("mainCtrl", BB.MainCtrl);


