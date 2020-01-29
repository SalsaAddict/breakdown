/// <reference path="../typings/angularjs/angular.d.ts" />
var Breakdown;
(function (Breakdown) {
    var Instrument = /** @class */ (function () {
        function Instrument(_context, name) {
            this._context = _context;
            this.name = name;
            this.audio = document.createElement("audio");
            var s = document.createElement("source");
            s.src = "audio/" + name + ".mp3";
            s.type = "audio/mp3";
            this.audio.id = "#" + name;
            this.audio.preload = "auto";
            this.audio.appendChild(s);
            document.body.appendChild(this.audio);
            this.source = _context.createMediaElementSource(this.audio);
            this.gain = _context.createGain();
            this.gain.gain.value = this.volume = 1;
            this.source.connect(this.gain);
        }
        Object.defineProperty(Instrument.prototype, "volume", {
            get: function () { return this.gain.gain.value; },
            set: function (value) {
                this._previousVolume = this.gain.gain.value;
                this.gain.gain.value = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Instrument.prototype, "muted", {
            get: function () { return this.volume === 0; },
            enumerable: true,
            configurable: true
        });
        Instrument.prototype.mute = function () {
            console.warn("mute", this.name);
            var volume = this.muted ? this._previousVolume || 1 : 0;
            this.gain.gain.linearRampToValueAtTime(volume, this._context.currentTime + 2.5);
        };
        return Instrument;
    }());
    Breakdown.Instrument = Instrument;
    var MainCtrl = /** @class */ (function () {
        function MainCtrl($scope) {
            this.$scope = $scope;
            this.instruments = [];
            this._playing = false;
            this.context = new AudioContext();
            this.gain = this.context.createGain();
            this.gain.connect(this.context.destination);
            this._addInstrument("bongo");
            this._addInstrument("guira");
            this._addInstrument("bass");
            var bongo = this.instruments[0];
            //bongo.audio.ontimeupdate = this.$scope.$apply;
        }
        MainCtrl.prototype._addInstrument = function (name) {
            var i = new Instrument(this.context, name);
            i.gain.connect(this.gain);
            this.instruments.push(i);
        };
        Object.defineProperty(MainCtrl.prototype, "playing", {
            get: function () { return this._playing; },
            enumerable: true,
            configurable: true
        });
        MainCtrl.prototype.play = function () {
            if (this.context.state === 'suspended')
                this.context.resume();
            if (this.playing) {
                this.instruments.forEach(function (instrument) {
                    instrument.audio.pause();
                });
                this._playing = false;
            }
            else {
                this.instruments.forEach(function (instrument) {
                    instrument.audio.play();
                });
                this._playing = true;
            }
        };
        Object.defineProperty(MainCtrl.prototype, "volume", {
            get: function () { return this.gain.gain.value; },
            set: function (value) {
                this._previousVolume = this.gain.gain.value;
                this.gain.gain.value = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainCtrl.prototype, "muted", {
            get: function () { return this.volume === 0; },
            enumerable: true,
            configurable: true
        });
        MainCtrl.prototype.mute = function () { this.volume = this.muted ? this._previousVolume || 1 : 0; };
        MainCtrl.prototype.$postLink = function () { };
        MainCtrl.$inject = ["$scope"];
        return MainCtrl;
    }());
    Breakdown.MainCtrl = MainCtrl;
})(Breakdown || (Breakdown = {}));
var BBTone;
(function (BBTone) {
    var MainCtrl = /** @class */ (function () {
        function MainCtrl($scope) {
            var _this = this;
            this.ready = false;
            this.instruments = [
                { name: "bongo" },
                { name: "guira" },
                { name: "bass" },
                { name: "segunda", start: 2.1 },
                { name: "requinto", start: 1.4, quiet: -15, normal: -5 }
            ];
            angular.forEach(this.instruments, function (i) {
                _this[i.name] = new Tone.Player("audio/" + i.name + ".mp3").sync().start(i.start || 0).toMaster();
                _this[i.name].volume.value = i.normal || 0;
                i.level = "normal";
            });
            Tone.Buffer.on("load", function () {
                _this.ready = true;
                $scope.$apply();
            });
        }
        MainCtrl.prototype.level = function (i, level) {
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
        };
        MainCtrl.prototype.rewind = function () {
            var restart = Tone.Transport.state === "started";
            Tone.Transport.stop();
            if (restart)
                Tone.Transport.start(0);
        };
        MainCtrl.prototype.toggle = function () {
            if (Tone.Transport.state === "started")
                Tone.Transport.pause();
            else
                Tone.Transport.start();
        };
        MainCtrl.prototype.$postLink = function () { };
        MainCtrl.$inject = ["$scope"];
        return MainCtrl;
    }());
    BBTone.MainCtrl = MainCtrl;
})(BBTone || (BBTone = {}));
var breakdown = angular.module("breakdown", []);
breakdown.controller("mainCtrl", BBTone.MainCtrl);
//# sourceMappingURL=breakdown.js.map