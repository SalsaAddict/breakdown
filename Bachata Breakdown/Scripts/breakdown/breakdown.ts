/// <reference path="../typings/angularjs/angular.d.ts" />

declare var Tone, Vue;

namespace Breakdown {
    const eight: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    class Section {
        constructor(
            public readonly id: number,
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
        public get end(): number { return this._count === 0 ? 1 : this[this._count - 1].start + (this[this._count - 1].bars * 4); }
        public add(title: string, rhythm: string, bars: number): this {
            this[this._count] = new Section(this._count, title, rhythm, this.end, bars);
            this._count++;
            return this;
        }
        public previousBeatIndex(section: Section): number {
            if (section.id === 0) return;
            return this[section.id - 1].start;
        }
        public nextBeatIndex(section: Section): number {
            if (section.id === this._count - 1) return;
            return this[section.id + 1].start;
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
        public mute(): void {
            this.player.mute = true;
            this.level = "mute";
        }
        public normal(): void {
            this.player.mute = false;
            this.player.volume.value = this.normalVolume;
            this.level = "normal";
        }
        public loud(): void {
            this.player.mute = false;
            this.player.volume.value = this.loudVolume;
            this.level = "loud";
        }
        public buttonClass(level: Level): any {
            let cls: any = {};
            if (this.level === level) cls["btn-info"] = true;
            else cls["btn-outline-info"] = true;
            return cls;
        }
    }
    export class MainCtrl implements ng.IController {
        static $inject: string[] = ["$scope"];
        constructor(private $scope: ng.IScope) {
            Tone.Transport.timeSignature = 4;
            Tone.Transport.bpm.value = 124;
            this.sections
                .add("Start", "Count-In", 1)
                .add("Intro", "Majao", 8)
                .add("Verse 1", "Derecho", 8)
                .add("Chorus", "Majao", 8)
                .add("Bridge", "Derecho", 8)
                .add("Verse 2", "Derecho", 8)
                .add("Chorus", "Majao", 8)
                .add("Bridge", "Urban/Majao", 4)
                .add("Chorus", "Majao", 8)
                .add("Mambo", "Majao", 8)
                .add("Breakdown", "Urban", 9)
                .add("Chorus", "Majao", 8)
                .add("Bridge", "Urban/Majao", 4)
                .add("Chorus", "Majao", 8)
                .add("End", "End", 2);
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
                    if (this.beatIndex >= this.sections.end)
                        if (Tone.Transport.state === "started") {
                            Tone.Transport.stop();
                            this.playing = false;
                            this.gotoBeatIndex(0);
                        }
                    $scope.$apply();
                }, "4n", "0:1");
            });
        }
        public ready: boolean = false;
        public beatIndex: number = 0;
        public sections: Sections = new Sections();
        public get section(): Section { return this.sections.sectionAtBeatIndex(this.beatIndex); }
        public get measure(): number { return (Math.floor((this.beatIndex - this.section.start) / 8) + 1) || 1; }
        public get beat(): number { return (((this.beatIndex - this.section.start) % this.section.beatsInMeasure(this.measure)) + 1) || 1; }
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
        private gotoBeatIndex(beatIndex: number): void {
            let position: string = beatIndex === 0 ? "0:0:0" : Math.floor(beatIndex / 4) + ":1:0";
            Tone.Transport.position = position;
            this.beatIndex = beatIndex;
        }
        public back(): void { this.gotoBeatIndex(this.measure > 1 ? this.section.start : this.sections.previousBeatIndex(this.section) || 0); }
        public next(): void { this.gotoBeatIndex(this.sections.nextBeatIndex(this.section) || 0); }
        public $postLink(): void { }
    }
}

var breakdown: angular.IModule = angular.module("breakdown", []);
breakdown.controller("mainCtrl", Breakdown.MainCtrl);


