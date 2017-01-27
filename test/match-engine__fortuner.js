'use strict';

const MatchEngine = require('../src/match-engine.js');
var matchEngine = new MatchEngine();

const variantNames = [
  "New SRZ A/T",
  "New VRZ A/T",
  "New VRZ A/T 4x4",
  "New G A/T",
  "New G A/T 4x4",
  "2.5 G Diesel TRD",
  "2.5 G Diesel A/T",
  "2.5 G Diesel A/T Facelift",
  "2.7 G 4x2 A/T",
  "2.7 G 4x2 A/T Facelift",
  "2.7 G-Lux 4x2 A/T",
  "2.7 G-Lux 4x2 A/T Facelift",
  "2.7 V 4x4",
  "2.7 V 4x4 Facelift",
  "2.7 Bensin TRD"
]
variantNames.forEach(function (variant) {
  matchEngine.addTerm(variant);
})

const testCases = [
  "fortuner vrz 2016", // New VRZ A/T
  "fortuner vnt trd 2014 putih a/t", // 2.5 G Diesel TRD
  "fortuner 2013 warna putih disel vnt matic siap pakai", // 2.5 G Diesel A/T Facelift
  "toyota fortuner glux 2.7 at bensin th. 2010 full original" // 2.7 G Lux 4x2 A/T
];
testCases.forEach(function (testCase) {
  console.log(testCase);
  console.log(matchEngine.match(testCase));
});
