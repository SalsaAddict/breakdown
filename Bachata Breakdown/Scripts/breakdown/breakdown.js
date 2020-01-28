/// <reference path="../typings/angularjs/angular.d.ts" />
var Breakdown;
(function (Breakdown) {
    var Instrument = /** @class */ (function () {
        function Instrument(context, name) {
            this.name = name;
            this.audio = document.createElement("audio");
            var s = document.createElement("source");
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
            if (this.muted)
                this.volume = this._previousVolume || 1;
            else
                this.volume = 0;
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
            bongo.audio.ontimeupdate = this.$scope.$apply;
        }
        Object.defineProperty(MainCtrl.prototype, "elapsed", {
            get: function () {
                var bongo = this.instruments[0];
                return bongo.audio.currentTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainCtrl.prototype, "percentage", {
            get: function () {
                var bongo = this.instruments[0];
                return bongo.audio.currentTime / bongo.audio.duration;
            },
            enumerable: true,
            configurable: true
        });
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
        MainCtrl.prototype.mute = function () {
            if (this.muted)
                this.volume = this._previousVolume || 1;
            else
                this.volume = 0;
        };
        MainCtrl.prototype.$postLink = function () { };
        MainCtrl.$inject = ["$scope"];
        return MainCtrl;
    }());
    Breakdown.MainCtrl = MainCtrl;
})(Breakdown || (Breakdown = {}));
var breakdown = angular.module("breakdown", []);
breakdown.controller("mainCtrl", Breakdown.MainCtrl);
//# sourceMappingURL=breakdown.js.map