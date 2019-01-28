export const enum Gender {
  Male = 1,
  Female,
  Other,
  Unknown,
}

export const enum Truncation {
  Truncated,
  None,
  Unknown,
}

export const enum HairColor {
  Bald = 1,
  Black,
  Blond,
  Brown,
  Grey,
  Red,
  Sandy,
  White,
  Unknown,
}

export const enum EyeColor {
  Black,
  Blue,
  Brown,
  Gray,
  Green,
  Hazel,
  Maroon,
  Pink,
  Dichromatic,
  Unknown,
}

export const enum IssuingCountry {
  UnitedStates,
  Canada,
  Unknown,
}

export const enum NameSuffix {
  Junior,
  Senior,
  First,
  Second,
  Third,
  Fourth,
  Fifth,
  Sixth,
  Seventh,
  Eighth,
  Ninth,
  Unknown,
}

export interface LicenseData {
  jurisdictionSpecificVehicleClass?: string;
  jurisdictionSpecificRestrictionCodes?: string;
  jurisdictionSpecificEndorsementCodes?: string;
  expirationDate: Date;
  lastName: string;
  middleName: string;
  firstName: string;
  issueDate: Date;
  dateOfBirth: Date;
  gender: Gender;
  eyeColor: EyeColor;
  height: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  id: string;
  country: IssuingCountry;
  inventoryControlNumber: string;
  customerId: string;
  firstNameTruncated: Truncation;
  middleNameTruncation: Truncation;
  lastNameTruncation: Truncation;
  secondStreet?: string;
  hairColor?: HairColor;
  placeOfBirth?: string;
  auditInformation?: string;
  firstNameAlias?: string;
  lastNameAlias?: string;
  suffixAlias?: string;
  nameSuffix?: NameSuffix;
  version: number;
  unmatchedCodes: string[];
}

function dateTransform(
  raw: string,
  normalisation: DateNormalisation,
  issuingCountry?: IssuingCountry,
): Date {
  if (normalisation === DateNormalisation.Country && issuingCountry !== undefined) {
    switch (issuingCountry) {
      case IssuingCountry.UnitedStates: // MMDDYYYY
        return new Date(`${raw.substr(4, 4)}-${raw.substr(0, 2)}-${raw.substr(2, 2)}`);
      case IssuingCountry.Canada: // YYYYMMDD
        return new Date(`${raw.substr(0, 4)}-${raw.substr(4, 2)}-${raw.substr(6, 2)}Z`);
      default:
        return new Date(NaN);
    }
  }
  return new Date(`${raw.substr(0, 4)}-${raw.substr(4, 2)}-${raw.substr(6, 2)}Z`);
}

function truncationTransform(raw: string): Truncation {
  switch (raw) {
    case 'T':
      return Truncation.Truncated;
    case 'N':
      return Truncation.None;
    default:
      return Truncation.Unknown;
  }
}

interface DataMapper<V> {
  codes: string[];
  default?: V;
  required?: true;
  transform?(str: string, normalisation: DateNormalisation, issuingCountry: IssuingCountry): V;
}

const mapping: { [key in keyof LicenseData]-?: DataMapper<LicenseData[key]> } = {
  auditInformation: {
    codes: ['DCJ'],
  },
  city: {
    codes: ['DAI'],
    required: true,
  },
  country: {
    codes: ['DCG'],
    transform(val): IssuingCountry {
      switch (val) {
        case 'USA':
          return IssuingCountry.UnitedStates;
        case 'CAN':
          return IssuingCountry.Canada;
        default:
          return IssuingCountry.Unknown;
      }
    },
    default: IssuingCountry.UnitedStates,
  },
  customerId: {
    codes: ['DBJ', 'DAQ'],
  },
  dateOfBirth: {
    codes: ['DBB'],
    required: true,
    transform: dateTransform,
  },
  expirationDate: {
    codes: ['DBA'],
    required: true,
    transform: dateTransform,
  },
  eyeColor: {
    codes: ['DAY'],
    transform(val): EyeColor {
      switch (val) {
        case 'BLK':
          return EyeColor.Black;
        case 'BLU':
          return EyeColor.Blue;
        case 'BRO':
          return EyeColor.Brown;
        case 'GRY':
          return EyeColor.Gray;
        case 'GRN':
          return EyeColor.Green;
        case 'HAZ':
          return EyeColor.Hazel;
        case 'MAR':
          return EyeColor.Maroon;
        case 'PNK':
          return EyeColor.Pink;
        case 'DIC':
          return EyeColor.Dichromatic;
        default:
          return EyeColor.Unknown;
      }
    },
  },
  firstName: {
    codes: ['DAC', 'DCT'],
    required: true,
  },
  firstNameAlias: {
    codes: ['DBP', 'DBG'],
  },
  firstNameTruncated: {
    codes: ['DDF'],
    transform: truncationTransform,
  },
  gender: {
    codes: ['DBC'],
    transform(raw) {
      switch (raw) {
        case '1':
          return Gender.Male;
        case '2':
          return Gender.Female;
        default:
          return Gender.Other;
      }
    },
    required: true,
  },
  hairColor: {
    codes: ['DAZ'],
    transform(raw): HairColor {
      switch (raw) {
        case 'BAL':
          return HairColor.Bald;
        case 'BLK':
          return HairColor.Black;
        case 'BLN':
          return HairColor.Blond;
        case 'BRO':
        case 'BROWN':
          return HairColor.Brown;
        case 'GRY':
          return HairColor.Grey;
        case 'RED':
          return HairColor.Red;
        case 'SDY':
          return HairColor.Sandy;
        case 'WHI':
          return HairColor.White;
        default:
          return HairColor.Unknown;
      }
    },
  },
  height: {
    codes: ['DAU'],
  },
  id: {
    codes: ['DCF'],
  },
  inventoryControlNumber: {
    codes: ['DCK'],
  },
  issueDate: {
    codes: ['DBD'],
    required: true,
    transform: dateTransform,
  },
  jurisdictionSpecificEndorsementCodes: {
    codes: ['DCD'],
  },
  jurisdictionSpecificRestrictionCodes: {
    codes: ['DCB'],
  },
  jurisdictionSpecificVehicleClass: {
    codes: ['DCA'],
  },
  lastName: {
    codes: ['DAB', 'DCS'],
    required: true,
  },
  lastNameAlias: {
    codes: ['DBO', 'DBN'],
  },
  lastNameTruncation: {
    codes: ['DDE'],
    transform: truncationTransform,
  },
  middleName: {
    codes: ['DAD'],
  },
  middleNameTruncation: {
    codes: ['DDG'],
    transform: truncationTransform,
  },
  nameSuffix: {
    codes: ['DBN', 'DCU'],
    transform(raw): NameSuffix {
      switch (raw) {
        case 'JR':
          return NameSuffix.Junior;
        case 'SR':
          return NameSuffix.Senior;
        case '1ST':
        case 'I':
          return NameSuffix.First;
        case '2ND':
        case 'II':
          return NameSuffix.Second;
        case '3RD':
        case 'III':
          return NameSuffix.Third;
        case '4TH':
        case 'IV':
          return NameSuffix.Fourth;
        case '5TH':
        case 'V':
          return NameSuffix.Fifth;
        case '6TH':
        case 'VI':
          return NameSuffix.Sixth;
        case '7TH':
        case 'VII':
          return NameSuffix.Seventh;
        case '8TH':
        case 'VIII':
          return NameSuffix.Eighth;
        case '9TH':
        case 'IX':
          return NameSuffix.Ninth;
        default:
          return NameSuffix.Unknown;
      }
    },
  },
  placeOfBirth: {
    codes: ['DCI'],
  },
  secondStreet: {
    codes: ['DAH'],
  },
  state: {
    codes: ['DAJ'],
    required: true,
  },
  street: {
    codes: ['DAG'],
    required: true,
  },
  suffixAlias: {
    codes: ['DBR', 'DBS'],
  },
  unmatchedCodes: {
    codes: ['XXXXXXX'],
  },
  version: {
    codes: ['XXXXXXX'],
  },
  zip: {
    codes: ['DAK'],
    required: true,
  },
};

export class LicenseDecodeError extends Error {}

export class MissingAttributeError extends LicenseDecodeError {
  constructor(public readonly property: string) {
    super(`Missing property code ${property}`);
  }
}

export const enum DateNormalisation {
  None,
  Country,
}

export interface DecodeOptions {
  /**
   * If `NONE` it will default to parsing `YYYYMMDD`.
   */
  dateNormalisation?: DateNormalisation;
  /**
   * If specified the function will throw when required properties are missing or when
   * and unknown code is encountered.
   */
  strict?: boolean;
  delimiter?: string | RegExp;
}

/**
 * Parses a license data string, version agnostic for simplicity.
 */
export function decodeLicense(
  str: string,
  {
    strict,
    delimiter = /[\n\r]+/,
    dateNormalisation = DateNormalisation.Country,
  }: DecodeOptions = {},
): Partial<LicenseData> {
  if (strict) {
    if (!str.startsWith('@\n\nANSI')) {
      throw new LicenseDecodeError('Bad encoding');
    }
  }
  const [, version] = str.match(/^@\n\nANSI \d{6}(\d{2})/) || <string[]>[];
  const parsedVersion = parseInt(version, 10);
  str = str.replace(/^@\n\nANSI .*DL/, '');
  const groups = str.split(delimiter);
  const out: Partial<LicenseData> = {
    unmatchedCodes: <string[]>[],
    version: parsedVersion,
  };
  // We need to extract the country beforehand so we can correctly parse dates...
  const country: IssuingCountry = groups.find(g => g.includes(`${mapping.country.codes[0]}USA`))
    ? IssuingCountry.UnitedStates
    : IssuingCountry.Canada;
  groups.forEach(group => {
    const code = group.substr(0, 3);
    const value = group.substr(3).trim();
    let matched = false;
    for (const [fieldName, { codes, transform }] of Object.entries(mapping)) {
      if (codes.includes(code)) {
        matched = true;
        out[<keyof LicenseData>fieldName] = transform
          ? transform(value, dateNormalisation, country)
          : value;
      }
    }
    if (strict && !matched) {
      out.unmatchedCodes!.push(code);
    }
  });
  if (strict) {
    for (const [fieldName, { required }] of Object.entries(mapping)) {
      if (required && !(fieldName in out)) {
        throw new MissingAttributeError(fieldName);
      }
    }
  }
  return <LicenseData>out;
}
