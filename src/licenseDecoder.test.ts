import { expect } from 'chai';
import { address, date, name } from 'faker';
import {
  DateNormalisation,
  decodeLicense,
  EyeColor,
  Gender,
  HairColor,
  IssuingCountry,
  MissingAttributeError,
  NameSuffix,
} from './licenseDecoder';

function getUTCStuff(inDate: Date): [string, string, string] {
  const iso = inDate.toISOString();
  return <[string, string, string]>iso.substring(0, iso.indexOf('T')).split('-');
}

function usDateFormat(inDate: Date): string {
  const [year, month, day] = getUTCStuff(inDate);
  return `${month}${day}${year}`;
}

function canDateFormat(inDate: Date): string {
  const [year, month, day] = getUTCStuff(inDate);
  return `${year}${month}${day}`;
}

function roundDate(inDate: Date) {
  return new Date(Date.UTC(inDate.getFullYear(), inDate.getMonth(), inDate.getDate()));
}

describe('licenseDecoder', () => {
  it('parses a valid partial license', () => {
    const firstName = name.firstName().toLocaleUpperCase();
    const lastName = name.lastName().toLocaleUpperCase();
    const dateOfBirth = roundDate(date.past());
    const expirationDate = roundDate(date.future());
    // tslint:disable-next-line:max-line-length
    expect(
      decodeLicense(
        `@\n\nANSI 00000001\nDCGCAN\nDBA${canDateFormat(expirationDate)}\nDBB${canDateFormat(
          dateOfBirth,
        )}\nDCS${lastName}\nDAC${firstName}`,
      ),
    ).to.deep.equal({
      country: IssuingCountry.Canada,
      dateOfBirth,
      expirationDate,
      firstName,
      lastName,
      unmatchedCodes: [],
      version: 1,
    });
  });

  it('parses full licenses', function() {
    this.timeout(10000);
    this.slow(50000);
    for(let i = 0;i < 10000;++i) {
      const firstName = name.firstName().toLocaleUpperCase();
      const lastName = name.lastName().toLocaleUpperCase();
      const dateOfBirth = roundDate(date.past());
      const expirationDate = roundDate(date.future());
      const issueDate = roundDate(date.past());
      const city = address.city().toUpperCase();
      const state = address.stateAbbr();
      const street = address.streetAddress().toUpperCase();
      const zip = address.zipCode();
      expect(
        decodeLicense(
          // tslint:disable-next-line:max-line-length
          `@\n\nANSI 12311203002DL00412312ZN123123123DLDCACM\nDCBNONE\nDCDNONE\nDBA${usDateFormat(
            expirationDate,
          )}\nDCS${lastName}\nDCT${firstName}\nDBD${usDateFormat(issueDate)}\nDBB${usDateFormat(
            dateOfBirth,
            // tslint:disable-next-line:max-line-length
          )}\nDBC1\nDAYBLU\nDAU069 in\nDAG${street}\nDAI${city}\nDAJ${state}\nDAK${zip}\nDAQ12312312312\nDCF12312312312312312312123\nDCGUSA\nDCHNONE\nDAH\nDAZBROWN\nDCE6\nDCK12312312312312\nDCU\nZNZNAY\nZNB10102008\nZNC5\'09\'\'\nZND245\nZNENCDL\nZNFNCDL\nZNGN\nZNH00117376822\nZNI00000007255`,
          {
            strict: true,
          },
        ),
      ).to.deep.equal({
        city,
        country: IssuingCountry.UnitedStates,
        customerId: '12312312312',
        dateOfBirth,
        expirationDate,
        eyeColor: EyeColor.Blue,
        firstName,
        gender: Gender.Male,
        hairColor: HairColor.Brown,
        height: '069 in',
        id: '12312312312312312312123',
        inventoryControlNumber: '12312312312312',
        issueDate,
        jurisdictionSpecificEndorsementCodes: 'NONE',
        jurisdictionSpecificRestrictionCodes: 'NONE',
        jurisdictionSpecificVehicleClass: 'CM',
        lastName,
        nameSuffix: NameSuffix.Unknown,
        secondStreet: '',
        state,
        street,
        unmatchedCodes: ['DCH', 'DCE', 'ZNZ', 'ZNB', 'ZNC', 'ZND', 'ZNE', 'ZNF', 'ZNG', 'ZNH', 'ZNI'],
        version: 3,
        zip,
      });
    }
  });

  it('parses non drivers licenses', () => {
    const firstName = name.firstName().toLocaleUpperCase();
    const lastName = name.lastName().toLocaleUpperCase();
    const dateOfBirth = roundDate(date.past());
    const expirationDate = roundDate(date.future());
    const issueDate = roundDate(date.past());
    const city = address.city().toUpperCase();
    const state = address.stateAbbr();
    const street = address.streetAddress().toUpperCase();
    const zip = address.zipCode();
    // tslint:disable-next-line:max-line-length
    expect(
      decodeLicense(
        // tslint:disable-next-line:max-line-length
        `@\n\nANSI 123123030002DL001231231ZW1231231231DLDCS${lastName}\nDCT${firstName}\nDCU\nDAG${street}\nDAI${city}\nDAJ${state}\nDAK${zip}\nDCGUSA\nDAQ${lastName}**KD123QT\nDCANONE\nDCBNONE\nDCDNONE\nDCF${lastName}**KD123QT12312312323123\nDCHNONE\nDBA${usDateFormat(
          expirationDate,
        )}\nDBB${usDateFormat(dateOfBirth)}\nDBC2\nDBD${usDateFormat(
          issueDate,
        )}\nDAU074 in\nDCE4\nDAYBRO\nZWZWA123123123123\nZWB\nZWC22\nZWD\nZWE\nZWFRev03122007`,
      ),
    ).to.deep.equal({
      city,
      country: 0,
      customerId: `${lastName}**KD123QT`,
      dateOfBirth,
      expirationDate,
      eyeColor: EyeColor.Brown,
      firstName,
      gender: Gender.Female,
      height: '074 in',
      id: `${lastName}**KD123QT12312312323123`,
      issueDate,
      jurisdictionSpecificEndorsementCodes: 'NONE',
      jurisdictionSpecificRestrictionCodes: 'NONE',
      jurisdictionSpecificVehicleClass: 'NONE',
      lastName,
      nameSuffix: 11,
      state,
      street,
      unmatchedCodes: [],
      version: 3,
      zip,
    });
  });

  it('parses a short form sting', () => {
    const firstName = name.firstName().toLocaleUpperCase();
    const lastName = name.lastName().toLocaleUpperCase();
    const dateOfBirth = roundDate(date.past());
    const expirationDate = roundDate(date.future());
    // tslint:disable-next-line:max-line-length
    expect(
      decodeLicense(
        `@ANSI;DBA${canDateFormat(expirationDate)};DBB${canDateFormat(
          dateOfBirth,
        )};DCS${lastName};DAC${firstName}`,
        {
          dateNormalisation: DateNormalisation.None,
          delimiter: ';',
        },
      ),
    ).to.deep.equal({
      dateOfBirth,
      expirationDate,
      firstName,
      lastName,
      unmatchedCodes: [],
      version: Number.NaN,
    });
  });

  it('parses eye colors correctly', () => {
    const firstName = name.firstName().toLocaleUpperCase();
    const lastName = name.lastName().toLocaleUpperCase();
    const dateOfBirth = roundDate(date.past());
    const expirationDate = roundDate(date.future());
    const eyeColors = [
      { code: 'BLK', color: EyeColor.Black },
      { code: 'BLU', color: EyeColor.Blue },
      { code: 'BRO', color: EyeColor.Brown },
      { code: 'GRY', color: EyeColor.Gray },
      { code: 'GRN', color: EyeColor.Green },
      { code: 'HAZ', color: EyeColor.Hazel },
      { code: 'MAR', color: EyeColor.Maroon },
      { code: 'PNK', color: EyeColor.Pink },
      { code: 'DIC', color: EyeColor.Dichromatic },
      { code: 'UNK', color: EyeColor.Unknown },
    ];
    for (const color of eyeColors) {
      // tslint:disable-next-line:max-line-length
      expect(
        decodeLicense(
          `@\n\nANSI 00000001\nDCGCAN\nDBA${canDateFormat(expirationDate)}\nDBB${canDateFormat(
            dateOfBirth,
          )}\nDCS${lastName}\nDAC${firstName}\nDAY${color.code}`,
        ),
      ).to.deep.equal({
        country: IssuingCountry.Canada,
        dateOfBirth,
        expirationDate,
        eyeColor: color.color,
        firstName,
        lastName,
        unmatchedCodes: [],
        version: 1,
      });
    }
  });

  it('parses hair colors correctly', () => {
    const firstName = name.firstName().toLocaleUpperCase();
    const lastName = name.lastName().toLocaleUpperCase();
    const dateOfBirth = roundDate(date.past());
    const expirationDate = roundDate(date.future());
    const hairColors = [
      { code: 'BAL', color: HairColor.Bald },
      { code: 'BLK', color: HairColor.Black },
      { code: 'BLN', color: HairColor.Blond },
      { code: 'BRO', color: HairColor.Brown },
      { code: 'GRY', color: HairColor.Grey },
      { code: 'RED', color: HairColor.Red },
      { code: 'SDY', color: HairColor.Sandy },
      { code: 'WHI', color: HairColor.White },
      { code: 'UNK', color: HairColor.Unknown },
    ];
    for (const color of hairColors) {
      // tslint:disable-next-line:max-line-length
      expect(
        decodeLicense(
          `@\n\nANSI 00000001\nDCGCAN\nDBA${canDateFormat(expirationDate)}\nDBB${canDateFormat(
            dateOfBirth,
          )}\nDCS${lastName}\nDAC${firstName}\nDAZ${color.code}`,
        ),
      ).to.deep.equal({
        country: IssuingCountry.Canada,
        dateOfBirth,
        expirationDate,
        firstName,
        hairColor: color.color,
        lastName,
        unmatchedCodes: [],
        version: 1,
      });
    }
  });

  it('parses name suffixes correctly', () => {
    const firstName = name.firstName().toLocaleUpperCase();
    const lastName = name.lastName().toLocaleUpperCase();
    const dateOfBirth = roundDate(date.past());
    const expirationDate = roundDate(date.future());
    const nameSuffix = [
      { code: 'JR', suffix: NameSuffix.Junior },
      { code: 'SR', suffix: NameSuffix.Senior },
      { code: '1ST', suffix: NameSuffix.First },
      { code: 'I', suffix: NameSuffix.First },
      { code: '2ND', suffix: NameSuffix.Second },
      { code: 'II', suffix: NameSuffix.Second },
      { code: '3RD', suffix: NameSuffix.Third },
      { code: 'III', suffix: NameSuffix.Third },
      { code: '4TH', suffix: NameSuffix.Fourth },
      { code: 'IV', suffix: NameSuffix.Fourth },
      { code: '5TH', suffix: NameSuffix.Fifth },
      { code: 'V', suffix: NameSuffix.Fifth },
      { code: '6TH', suffix: NameSuffix.Sixth },
      { code: 'VI', suffix: NameSuffix.Sixth },
      { code: '7TH', suffix: NameSuffix.Seventh },
      { code: 'VII', suffix: NameSuffix.Seventh },
      { code: '8TH', suffix: NameSuffix.Eighth },
      { code: 'VIII', suffix: NameSuffix.Eighth },
      { code: '9TH', suffix: NameSuffix.Ninth },
      { code: 'IX', suffix: NameSuffix.Ninth },
    ];
    for (const suffix of nameSuffix) {
      // tslint:disable-next-line:max-line-length
      expect(
        decodeLicense(
          `@\n\nANSI 00000001\nDCGCAN\nDBA${canDateFormat(expirationDate)}\nDBB${canDateFormat(
            dateOfBirth,
          )}\nDCS${lastName}\nDAC${firstName}\nDBN${suffix.code}`,
        ),
      ).to.deep.equal({
        country: IssuingCountry.Canada,
        dateOfBirth,
        expirationDate,
        firstName,
        lastName,
        lastNameAlias: suffix.code,
        nameSuffix: suffix.suffix,
        unmatchedCodes: [],
        version: 1,
      });
    }
  });

  it('throws error in strict mode if license does not start correctly', () => {
    expect(() => decodeLicense('@ANSI;DBA99990101', { strict: true })).to.throw(/Bad encoding/);
  });

  it('throws error in strict mode if license is missing required fields', () => {
    expect(() =>
      decodeLicense('@\n\nANSI 123123030002DL001231231ZW1231231231DLDCSTEST', { strict: true }),
    ).to.throw(MissingAttributeError);
  });
});
