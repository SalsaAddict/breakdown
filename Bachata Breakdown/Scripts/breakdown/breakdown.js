/// <reference path="../typings/angularjs/angular.d.ts" />
var Breakdown;
(function (Breakdown) {
    const eight = [1, 2, 3, 4, 5, 6, 7, 8];
    class Section {
        constructor(id, title, rhythm, start, bars) {
            this.id = id;
            this.title = title;
            this.rhythm = rhythm;
            this.start = start;
            this.bars = bars;
            this.measures = Math.ceil(this.bars / 2);
        }
        measureMarkers() { return eight.slice(0, this.measures); }
        beatsInMeasure(measure) { return this.bars % 2 === 1 && measure === this.measures ? 4 : 8; }
        beatMarkers(measure) { return eight.slice(0, this.beatsInMeasure(measure)); }
    }
    class Sections {
        constructor() {
            this._count = 0;
        }
        get count() { return this._count; }
        get end() { return this._count === 0 ? 1 : this[this._count - 1].start + (this[this._count - 1].bars * 4); }
        add(title, rhythm, bars) {
            this[this._count] = new Section(this._count, title, rhythm, this.end, bars);
            this._count++;
            return this;
        }
        previousBeatIndex(section) {
            if (section.id === 0)
                return;
            return this[section.id - 1].start;
        }
        nextBeatIndex(section) {
            if (section.id === this._count - 1)
                return;
            return this[section.id + 1].start;
        }
        sectionAtBeatIndex(beatIndex) {
            for (var i = this._count - 1; i > 0; i--) {
                if (this[i].start <= beatIndex)
                    break;
            }
            return this[i];
        }
    }
    class Instrument {
        constructor(name, startTime = 0, normalVolume = -15, loudVolume = 0) {
            this.name = name;
            this.startTime = startTime;
            this.normalVolume = normalVolume;
            this.loudVolume = loudVolume;
            this.level = "normal";
            this.player = new Tone.Player("audio/" + name + ".mp3").sync().start(startTime).toMaster();
            this.player.volume.value = normalVolume;
        }
        mute() {
            this.player.mute = true;
            this.level = "mute";
        }
        normal() {
            this.player.mute = false;
            this.player.volume.value = this.normalVolume;
            this.level = "normal";
        }
        loud() {
            this.player.mute = false;
            this.player.volume.value = this.loudVolume;
            this.level = "loud";
        }
        buttonClass(level) {
            let cls = {};
            if (this.level === level)
                cls["btn-info"] = true;
            else
                cls["btn-outline-info"] = true;
            return cls;
        }
    }
    class MainCtrl {
        constructor($scope) {
            this.$scope = $scope;
            this.ready = false;
            this.beatIndex = 0;
            this.sections = new Sections();
            this.instruments = [];
            this.playing = false;
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
                Tone.Transport.scheduleRepeat(() => {
                    let segments = Tone.Transport.position.split(":");
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
        get section() { return this.sections.sectionAtBeatIndex(this.beatIndex); }
        get measure() { return (Math.floor((this.beatIndex - this.section.start) / 8) + 1) || 1; }
        get beat() { return (((this.beatIndex - this.section.start) % this.section.beatsInMeasure(this.measure)) + 1) || 1; }
        toggle() {
            if (Tone.Transport.state === "started") {
                Tone.Transport.pause();
                this.playing = false;
            }
            else {
                Tone.Transport.start();
                this.playing = true;
            }
        }
        gotoBeatIndex(beatIndex) {
            let position = beatIndex === 0 ? "0:0:0" : Math.floor(beatIndex / 4) + ":1:0";
            Tone.Transport.position = position;
            this.beatIndex = beatIndex;
        }
        back() { this.gotoBeatIndex(this.measure > 1 ? this.section.start : this.sections.previousBeatIndex(this.section) || 0); }
        next() { this.gotoBeatIndex(this.sections.nextBeatIndex(this.section) || 0); }
        $postLink() { }
    }
    MainCtrl.$inject = ["$scope"];
    Breakdown.MainCtrl = MainCtrl;
})(Breakdown || (Breakdown = {}));
var breakdown = angular.module("breakdown", []);
breakdown.controller("mainCtrl", Breakdown.MainCtrl);
//# sourceMappingURL=breakdown.js.map