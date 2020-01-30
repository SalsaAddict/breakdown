/// <reference path="../typings/angularjs/angular.d.ts" />
var BB;
(function (BB) {
    const eight = [1, 2, 3, 4, 5, 6, 7, 8];
    class Section {
        constructor(title, rhythm, start, bars) {
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
        add(title, rhythm, bars) {
            let start = this._count === 0 ? 1 : this[this._count - 1].bars * 4 + this[this._count - 1].start;
            this[this._count] = new Section(title, rhythm, start, bars);
            this._count++;
            return this;
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
                Tone.Transport.scheduleRepeat(() => {
                    let segments = Tone.Transport.position.split(":");
                    this.beatIndex = (parseInt(segments[0]) * 4) + parseInt(segments[1]);
                    $scope.$apply();
                }, "4n", "0:1");
            });
        }
        get measure() {
            if (!this.section)
                return;
            return Math.floor((this.beatIndex - this.section.start) / 8) + 1;
        }
        get beat() {
            if (!this.section)
                return;
            return ((this.beatIndex - this.section.start) % this.section.beatsInMeasure(this.measure)) + 1;
        }
        get section() {
            if (!this.beatIndex)
                return;
            return this.sections.sectionAtBeatIndex(this.beatIndex);
        }
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
        $postLink() { }
    }
    MainCtrl.$inject = ["$scope"];
    BB.MainCtrl = MainCtrl;
})(BB || (BB = {}));
var Breakdown;
(function (Breakdown) {
    class MainCtrl {
        constructor($scope) {
            this.blocks = [1, 2, 3, 4, 5, 6, 7, 8];
            this.ready = false;
            this.instruments = [
                { name: "bongo" },
                { name: "guira" },
                { name: "bass" },
                { name: "segunda", start: 2.1 },
                { name: "requinto", start: 1.4, quiet: -15, normal: -5 }
            ];
            this.phrases = [
                { start: 1, length: 32, title: "Intro", rhythm: "Majao" },
                { start: 33, length: 32, title: "Verse 1", rhythm: "Derecho" },
                { start: 65, length: 32, title: "Chorus", rhythm: "Majao" },
                { start: 97, length: 32, title: "Bridge", rhythm: "Derecho" },
                { start: 129, length: 32, title: "Verse 2", rhythm: "Derecho" },
                { start: 161, length: 32, title: "Chorus", rhythm: "Majao" },
            ];
            Tone.Transport.timeSignature = 4;
            Tone.Transport.bpm.value = 124;
            angular.forEach(this.instruments, (i) => {
                this[i.name] = new Tone.Player("audio/" + i.name + ".mp3").sync().start(i.start || 0).toMaster();
                this[i.name].volume.value = i.normal || 0;
                i.level = "normal";
            });
            Tone.Buffer.on("load", () => {
                this.ready = true;
                $scope.$apply();
                Tone.Transport.scheduleRepeat(() => {
                    let segments = Tone.Transport.position.split(":");
                    this.counter = ((parseInt(segments[0]) - 1) * 4) + parseInt(segments[1]);
                    if (this.counter < 1)
                        this.phrase = null;
                    else if (this.counter <= 32)
                        this.phrase = this.phrases[0];
                    else if (this.counter <= 64)
                        this.phrase = this.phrases[1];
                    else if (this.counter <= 96)
                        this.phrase = this.phrases[2];
                    else if (this.counter <= 128)
                        this.phrase = this.phrases[3];
                    else if (this.counter <= 160)
                        this.phrase = this.phrases[4];
                    else if (this.counter <= 192)
                        this.phrase = this.phrases[5];
                    else
                        this.phrase = null;
                    $scope.$apply();
                }, "4n", "0:1");
            });
        }
        get beat() { return ((this.counter - 1) % 4) + 1; }
        get step() { return ((this.counter - 1) % 8) + 1; }
        get measures() {
            if (!this.phrase)
                return;
            return this.phrase.length / 8;
        }
        get measure() {
            if (!this.phrase)
                return;
            return (Math.floor((this.counter - 1) / 8) % this.measures) + 1;
        }
        level(i, level) {
            i.level = level;
            switch (i.level) {
                case "mute":
                    this[i.name].mute = true;
                    break;
                case "quiet":
                    this[i.name].mute = false;
                    this[i.name].volume.value = i.quiet || -15;
                    break;
                case "normal":
                    this[i.name].mute = false;
                    this[i.name].volume.value = i.normal || 0;
                    break;
            }
        }
        rewind() {
            let restart = Tone.Transport.state === "started";
            Tone.Transport.stop();
            if (restart)
                Tone.Transport.start(0);
        }
        toggle() {
            if (Tone.Transport.state === "started")
                Tone.Transport.pause();
            else
                Tone.Transport.start();
        }
        $postLink() { }
    }
    MainCtrl.$inject = ["$scope"];
    Breakdown.MainCtrl = MainCtrl;
})(Breakdown || (Breakdown = {}));
var breakdown = angular.module("breakdown", []);
breakdown.controller("mainCtrl", BB.MainCtrl);
//# sourceMappingURL=breakdown.js.map