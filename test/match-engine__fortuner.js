'use strict';

const expect = require('chai').expect;
const MatchEngine = require('../src/match-engine.js');

describe('MatchEngine', function () {

  it('should pass prepared Fortuner test cases', function () {

    var matchEngine = new MatchEngine();
    const variantNames = [
      'New SRZ A/T', 'New VRZ A/T', 'New VRZ A/T 4x4',
      'New G A/T', 'New G A/T 4x4',
      '2.5 G Diesel TRD', '2.5 G Diesel A/T', '2.5 G Diesel A/T Facelift',
      '2.7 G 4x2 A/T', '2.7 G 4x2 A/T Facelift',
      '2.7 G-Lux 4x2 A/T', '2.7 G-Lux 4x2 A/T Facelift',
      '2.7 V 4x4', '2.7 V 4x4 Facelift',
      '2.7 Bensin TRD'
    ]
    variantNames.forEach(function (variant) {
      matchEngine.addTerm(variant);
    })

    const testCases = [
      {
        query: 'fortuner vrz 2016',
        expectedResult: 'New VRZ A/T'
      },
      {
        query: 'fortuner vnt trd 2014 putih a/t',
        expectedResult: '2.5 G Diesel TRD'
      },
      // {
      //   query: 'fortuner 2013 warna putih disel vnt matic siap pakai',
      //   expectedResult: '2.5 G Diesel A/T Facelift'
      // },
      {
        query: 'toyota fortuner glux 2.7 at bensin th. 2010 full original',
        expectedResult: '2.7 G-Lux 4x2 A/T'
      }
    ];
    testCases.forEach(function (testCase) {
      const result = matchEngine.match(testCase.query);
      expect(result[0]).to.equal(testCase.expectedResult);
    });
  }); // end of `Prepared test case - Fortuner`

});
