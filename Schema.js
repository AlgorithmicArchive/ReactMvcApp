[
    {
        "id": "section-1",
        "section": "Location",
        "fields": [
            {
                "id": "field-1740112986647",
                "type": "select",
                "label": "Select District",
                "name": "District",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": 1,
                        "label": "Anantnag"
                    },
                    {
                        "value": 2,
                        "label": "Budgam"
                    },
                    {
                        "value": 3,
                        "label": "Baramulla"
                    },
                    {
                        "value": 4,
                        "label": "Doda"
                    },
                    {
                        "value": 5,
                        "label": "Jammu"
                    },
                    {
                        "value": 7,
                        "label": "Kathua"
                    },
                    {
                        "value": 8,
                        "label": "Kupwara"
                    },
                    {
                        "value": 10,
                        "label": "Poonch"
                    },
                    {
                        "value": 11,
                        "label": "Pulwama"
                    },
                    {
                        "value": 12,
                        "label": "Rajouri"
                    },
                    {
                        "value": 13,
                        "label": "Srinagar"
                    },
                    {
                        "value": 14,
                        "label": "Udhampur"
                    },
                    {
                        "value": 620,
                        "label": "Kishtwar"
                    },
                    {
                        "value": 621,
                        "label": "Ramban"
                    },
                    {
                        "value": 622,
                        "label": "Kulgam"
                    },
                    {
                        "value": 623,
                        "label": "Bandipora"
                    },
                    {
                        "value": 624,
                        "label": "Samba"
                    },
                    {
                        "value": 625,
                        "label": "Shopian"
                    },
                    {
                        "value": 626,
                        "label": "Ganderbal"
                    },
                    {
                        "value": 627,
                        "label": "Reasi"
                    }
                ],
                "span": 12,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113022969",
                "type": "select",
                "label": "Select Tehsil Social Welfare Office (TSWO)",
                "name": "Tehsil",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    }
                ],
                "span": 12,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    },
    {
        "id": "section-1745729826495",
        "section": "Pension Type",
        "fields": [
            {
                "id": "field-1745729838016",
                "type": "select",
                "label": "Pension Type",
                "name": "PensionType",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "OLD AGE PENSION",
                        "label": "OLD AGE PENSION"
                    },
                    {
                        "value": "PHYSICALLY CHALLENGED PERSON",
                        "label": "PHYSICALLY CHALLENGED PERSON"
                    },
                    {
                        "value": "WOMEN IN DISTRESS",
                        "label": "WOMEN IN DISTRESS"
                    },
                    {
                        "value": "TRANSGENDER",
                        "label": "TRANSGENDER"
                    }
                ],
                "span": 12,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {
                    "WOMEN IN DISTRESS": [
                        {
                            "id": 1747887214999,
                            "type": "select",
                            "label": "Civil Condition",
                            "name": "CivilCondition",
                            "minLength": 5,
                            "maxLength": 50,
                            "options": [
                                {
                                    "value": "Please Select",
                                    "label": "Please Select"
                                },
                                {
                                    "value": "WIDOW",
                                    "label": "WIDOW"
                                },
                                {
                                    "value": "DIVORCEE",
                                    "label": "DIVORCEE"
                                }
                            ],
                            "span": 12,
                            "validationFunctions": [
                                "notEmpty"
                            ],
                            "transformationFunctions": [],
                            "additionalFields": {},
                            "accept": "",
                            "editable": true,
                            "isDependentEnclosure": false,
                            "dependentValues": []
                        }
                    ],
                    "PHYSICALLY CHALLENGED PERSON": [
                        {
                            "id": 1747887347006,
                            "type": "select",
                            "label": "Type of Disability as per UDID Card",
                            "name": "TypeOfDisabilityAsPerUdidCard",
                            "minLength": 5,
                            "maxLength": 50,
                            "options": [
                                {
                                    "value": "Please Select",
                                    "label": "Please Select"
                                },
                                {
                                    "value": "BLINDNESS",
                                    "label": "BLINDNESS"
                                },
                                {
                                    "value": "CEREBRAL PALSY",
                                    "label": "CEREBRAL PALSY"
                                },
                                {
                                    "value": "LOW VISION",
                                    "label": "LOW VISION"
                                },
                                {
                                    "value": "LEPROSY-CURED",
                                    "label": "LEPROSY-CURED"
                                },
                                {
                                    "value": "MENTAL RETARDATION",
                                    "label": "MENTAL RETARDATION"
                                },
                                {
                                    "value": "MENTAL ILLNESS",
                                    "label": "MENTAL ILLNESS"
                                },
                                {
                                    "value": "HEARING IMPAIRMENT",
                                    "label": "HEARING IMPAIRMENT"
                                },
                                {
                                    "value": "OTHERS",
                                    "label": "OTHERS"
                                }
                            ],
                            "span": 12,
                            "validationFunctions": [
                                "notEmpty"
                            ],
                            "transformationFunctions": [],
                            "additionalFields": {
                                "OTHERS": [
                                    {
                                        "id": 1747887517044,
                                        "type": "text",
                                        "label": "If Others, Enter Type of Disability as per UDID Card",
                                        "name": "IfOthersEnterTypeOfDisabilityAsPerUdidCard",
                                        "minLength": 5,
                                        "maxLength": 255,
                                        "options": [],
                                        "span": 12,
                                        "validationFunctions": [
                                            "notEmpty"
                                        ],
                                        "transformationFunctions": [],
                                        "additionalFields": {},
                                        "accept": "",
                                        "editable": true,
                                        "dependentOptions": {},
                                        "isDependentEnclosure": false,
                                        "dependentValues": []
                                    }
                                ]
                            },
                            "accept": "",
                            "editable": true,
                            "isDependentEnclosure": false,
                            "dependentValues": []
                        },
                        {
                            "id": 1747887626854,
                            "type": "select",
                            "label": "Kind of Disability",
                            "name": "KindOfDisability",
                            "minLength": 5,
                            "maxLength": 50,
                            "options": [
                                {
                                    "value": "Please Select",
                                    "label": "Please Select"
                                },
                                {
                                    "value": "PERMANENT",
                                    "label": "PERMANENT"
                                },
                                {
                                    "value": "TEMPORARY",
                                    "label": "TEMPORARY"
                                }
                            ],
                            "span": 12,
                            "validationFunctions": [
                                "notEmpty"
                            ],
                            "transformationFunctions": [],
                            "additionalFields": {
                                "TEMPORARY": [
                                    {
                                        "id": 1747887705443,
                                        "type": "date",
                                        "label": "If Temporary Disability, UDID Card Valid upto",
                                        "name": "IfTemporaryDisabilityUdidCardValidUpto",
                                        "minLength": 5,
                                        "maxLength": 50,
                                        "options": [],
                                        "span": 12,
                                        "validationFunctions": [
                                            "notEmpty"
                                        ],
                                        "transformationFunctions": [],
                                        "additionalFields": {},
                                        "accept": "",
                                        "editable": true,
                                        "isDependentEnclosure": false,
                                        "dependentValues": []
                                    }
                                ]
                            },
                            "accept": "",
                            "editable": true,
                            "isDependentEnclosure": false,
                            "dependentValues": []
                        },
                        {
                            "id": 1747887750921,
                            "type": "select",
                            "label": "Percentage of Disability",
                            "name": "PercentageOfDisability",
                            "minLength": 5,
                            "maxLength": 50,
                            "options": [
                                {
                                    "value": "Please Select",
                                    "label": "Please Select"
                                },
                                {
                                    "value": "1",
                                    "label": "1"
                                },
                                {
                                    "value": "2",
                                    "label": "2"
                                },
                                {
                                    "value": "3",
                                    "label": "3"
                                },
                                {
                                    "value": "4",
                                    "label": "4"
                                },
                                {
                                    "value": "5",
                                    "label": "5"
                                },
                                {
                                    "value": "6",
                                    "label": "6"
                                },
                                {
                                    "value": "7",
                                    "label": "7"
                                },
                                {
                                    "value": "8",
                                    "label": "8"
                                },
                                {
                                    "value": "9",
                                    "label": "9"
                                },
                                {
                                    "value": "10",
                                    "label": "10"
                                },
                                {
                                    "value": "11",
                                    "label": "11"
                                },
                                {
                                    "value": "12",
                                    "label": "12"
                                },
                                {
                                    "value": "13",
                                    "label": "13"
                                },
                                {
                                    "value": "14",
                                    "label": "14"
                                },
                                {
                                    "value": "15",
                                    "label": "15"
                                },
                                {
                                    "value": "16",
                                    "label": "16"
                                },
                                {
                                    "value": "17",
                                    "label": "17"
                                },
                                {
                                    "value": "18",
                                    "label": "18"
                                },
                                {
                                    "value": "19",
                                    "label": "19"
                                },
                                {
                                    "value": "20",
                                    "label": "20"
                                },
                                {
                                    "value": "21",
                                    "label": "21"
                                },
                                {
                                    "value": "22",
                                    "label": "22"
                                },
                                {
                                    "value": "23",
                                    "label": "23"
                                },
                                {
                                    "value": "24",
                                    "label": "24"
                                },
                                {
                                    "value": "25",
                                    "label": "25"
                                },
                                {
                                    "value": "26",
                                    "label": "26"
                                },
                                {
                                    "value": "27",
                                    "label": "27"
                                },
                                {
                                    "value": "28",
                                    "label": "28"
                                },
                                {
                                    "value": "29",
                                    "label": "29"
                                },
                                {
                                    "value": "30",
                                    "label": "30"
                                },
                                {
                                    "value": "31",
                                    "label": "31"
                                },
                                {
                                    "value": "32",
                                    "label": "32"
                                },
                                {
                                    "value": "33",
                                    "label": "33"
                                },
                                {
                                    "value": "34",
                                    "label": "34"
                                },
                                {
                                    "value": "35",
                                    "label": "35"
                                },
                                {
                                    "value": "36",
                                    "label": "36"
                                },
                                {
                                    "value": "37",
                                    "label": "37"
                                },
                                {
                                    "value": "38",
                                    "label": "38"
                                },
                                {
                                    "value": "39",
                                    "label": "39"
                                },
                                {
                                    "value": "40",
                                    "label": "40"
                                },
                                {
                                    "value": "41",
                                    "label": "41"
                                },
                                {
                                    "value": "42",
                                    "label": "42"
                                },
                                {
                                    "value": "43",
                                    "label": "43"
                                },
                                {
                                    "value": "44",
                                    "label": "44"
                                },
                                {
                                    "value": "45",
                                    "label": "45"
                                },
                                {
                                    "value": "46",
                                    "label": "46"
                                },
                                {
                                    "value": "47",
                                    "label": "47"
                                },
                                {
                                    "value": "48",
                                    "label": "48"
                                },
                                {
                                    "value": "49",
                                    "label": "49"
                                },
                                {
                                    "value": "50",
                                    "label": "50"
                                },
                                {
                                    "value": "51",
                                    "label": "51"
                                },
                                {
                                    "value": "52",
                                    "label": "52"
                                },
                                {
                                    "value": "53",
                                    "label": "53"
                                },
                                {
                                    "value": "54",
                                    "label": "54"
                                },
                                {
                                    "value": "55",
                                    "label": "55"
                                },
                                {
                                    "value": "56",
                                    "label": "56"
                                },
                                {
                                    "value": "57",
                                    "label": "57"
                                },
                                {
                                    "value": "58",
                                    "label": "58"
                                },
                                {
                                    "value": "59",
                                    "label": "59"
                                },
                                {
                                    "value": "60",
                                    "label": "60"
                                },
                                {
                                    "value": "61",
                                    "label": "61"
                                },
                                {
                                    "value": "62",
                                    "label": "62"
                                },
                                {
                                    "value": "63",
                                    "label": "63"
                                },
                                {
                                    "value": "64",
                                    "label": "64"
                                },
                                {
                                    "value": "65",
                                    "label": "65"
                                },
                                {
                                    "value": "66",
                                    "label": "66"
                                },
                                {
                                    "value": "67",
                                    "label": "67"
                                },
                                {
                                    "value": "68",
                                    "label": "68"
                                },
                                {
                                    "value": "69",
                                    "label": "69"
                                },
                                {
                                    "value": "70",
                                    "label": "70"
                                },
                                {
                                    "value": "71",
                                    "label": "71"
                                },
                                {
                                    "value": "72",
                                    "label": "72"
                                },
                                {
                                    "value": "73",
                                    "label": "73"
                                },
                                {
                                    "value": "74",
                                    "label": "74"
                                },
                                {
                                    "value": "75",
                                    "label": "75"
                                },
                                {
                                    "value": "76",
                                    "label": "76"
                                },
                                {
                                    "value": "77",
                                    "label": "77"
                                },
                                {
                                    "value": "78",
                                    "label": "78"
                                },
                                {
                                    "value": "79",
                                    "label": "79"
                                },
                                {
                                    "value": "80",
                                    "label": "80"
                                },
                                {
                                    "value": "81",
                                    "label": "81"
                                },
                                {
                                    "value": "82",
                                    "label": "82"
                                },
                                {
                                    "value": "83",
                                    "label": "83"
                                },
                                {
                                    "value": "84",
                                    "label": "84"
                                },
                                {
                                    "value": "85",
                                    "label": "85"
                                },
                                {
                                    "value": "86",
                                    "label": "86"
                                },
                                {
                                    "value": "87",
                                    "label": "87"
                                },
                                {
                                    "value": "88",
                                    "label": "88"
                                },
                                {
                                    "value": "89",
                                    "label": "89"
                                },
                                {
                                    "value": "90",
                                    "label": "90"
                                },
                                {
                                    "value": "91",
                                    "label": "91"
                                },
                                {
                                    "value": "92",
                                    "label": "92"
                                },
                                {
                                    "value": "93",
                                    "label": "93"
                                },
                                {
                                    "value": "94",
                                    "label": "94"
                                },
                                {
                                    "value": "95",
                                    "label": "95"
                                },
                                {
                                    "value": "96",
                                    "label": "96"
                                },
                                {
                                    "value": "97",
                                    "label": "97"
                                },
                                {
                                    "value": "98",
                                    "label": "98"
                                },
                                {
                                    "value": "99",
                                    "label": "99"
                                },
                                {
                                    "value": "100",
                                    "label": "100"
                                }
                            ],
                            "span": 12,
                            "validationFunctions": [
                                "notEmpty"
                            ],
                            "transformationFunctions": [],
                            "additionalFields": {},
                            "accept": "",
                            "editable": true,
                            "dependentOptions": {},
                            "isDependentEnclosure": false,
                            "dependentValues": []
                        }
                    ]
                },
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    },
    {
        "id": "section-2",
        "section": "Applicant Details",
        "fields": [
            {
                "id": "field-1740113295080",
                "type": "text",
                "label": "Applicant Name",
                "name": "ApplicantName",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113323210",
                "type": "file",
                "label": "Applicant Image",
                "name": "ApplicantImage",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": ".jpg,.png,.jpeg",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113369706",
                "type": "date",
                "label": "Date of Birth",
                "name": "DateOfBirth",
                "minLength": 5,
                "maxLength": {
                    "dependentOn": "PensionType",
                    "OLD AGE PENSION": 60,
                    "PHYSICALLY CHALLENGED PERSON": 1,
                    "WOMEN IN DISTRESS": 21,
                    "TRANSGENDER": 1
                },
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "isAgeGreaterThan"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113510302",
                "type": "text",
                "label": "Mobile Number",
                "name": "MobileNumber",
                "minLength": 5,
                "maxLength": 10,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyDigits",
                    "specificLength"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113552892",
                "type": "email",
                "label": "Email",
                "name": "Email",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "isEmailValid"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1745817529032",
                "type": "select",
                "label": "Category",
                "name": "Category",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "AYY",
                        "label": "AYY"
                    },
                    {
                        "value": "PHH",
                        "label": "PHH"
                    },
                    {
                        "value": "NPHH",
                        "label": "NPHH"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740214101402",
                "type": "select",
                "label": "Relation",
                "name": "Relation",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Father",
                        "label": "Father"
                    },
                    {
                        "value": "Husband",
                        "label": "Husband"
                    },
                    {
                        "value": "Guardian",
                        "label": "Guardian"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740214191466",
                "type": "text",
                "label": "Relation Name",
                "name": "RelationName",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1745817333100",
                "type": "select",
                "label": "Gender",
                "name": "Gender",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    },
    {
        "id": "section-3",
        "section": "Present Address Details",
        "fields": [
            {
                "id": "field-1751525956730",
                "type": "select",
                "label": "Address Type",
                "name": "AddressType",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Urban",
                        "label": "Urban"
                    },
                    {
                        "value": "Rural",
                        "label": "Rural"
                    }
                ],
                "span": 12,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113618417",
                "type": "text",
                "label": "Address",
                "name": "PresentAddress",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 12,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113676245",
                "type": "select",
                "label": "District",
                "name": "PresentDistrict",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": 1,
                        "label": "Anantnag"
                    },
                    {
                        "value": 2,
                        "label": "Budgam"
                    },
                    {
                        "value": 3,
                        "label": "Baramulla"
                    },
                    {
                        "value": 4,
                        "label": "Doda"
                    },
                    {
                        "value": 5,
                        "label": "Jammu"
                    },
                    {
                        "value": 7,
                        "label": "Kathua"
                    },
                    {
                        "value": 8,
                        "label": "Kupwara"
                    },
                    {
                        "value": 10,
                        "label": "Poonch"
                    },
                    {
                        "value": 11,
                        "label": "Pulwama"
                    },
                    {
                        "value": 12,
                        "label": "Rajouri"
                    },
                    {
                        "value": 13,
                        "label": "Srinagar"
                    },
                    {
                        "value": 14,
                        "label": "Udhampur"
                    },
                    {
                        "value": 620,
                        "label": "Kishtwar"
                    },
                    {
                        "value": 621,
                        "label": "Ramban"
                    },
                    {
                        "value": 622,
                        "label": "Kulgam"
                    },
                    {
                        "value": 623,
                        "label": "Bandipora"
                    },
                    {
                        "value": 624,
                        "label": "Samba"
                    },
                    {
                        "value": 625,
                        "label": "Shopian"
                    },
                    {
                        "value": 626,
                        "label": "Ganderbal"
                    },
                    {
                        "value": 627,
                        "label": "Reasi"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113724788",
                "type": "select",
                "label": "Tehsil",
                "name": "PresentTehsil",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113751965",
                "type": "text",
                "label": "Block",
                "name": "PresentBlock",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1748246762442",
                "type": "text",
                "label": "Halqa Panchayat / Municipality Name",
                "name": "PresentHalqaPanchayatMunicipalityName",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113790511",
                "type": "text",
                "label": "Village",
                "name": "PresentVillage",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113773920",
                "type": "text",
                "label": "Ward",
                "name": "PresentWard",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113809543",
                "type": "text",
                "label": "Pincode",
                "name": "PresentPincode",
                "minLength": 5,
                "maxLength": 6,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyDigits",
                    "specificLength"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    },
    {
        "id": "section-4",
        "section": "Permanent Address Details",
        "fields": [
            {
                "id": "field-1740113835649-ynebn6g",
                "type": "text",
                "label": "Address",
                "name": "PermanentAddress",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 12,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113835650-1u1dysc",
                "type": "select",
                "label": "District",
                "name": "PermanentDistrict",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": 1,
                        "label": "Anantnag"
                    },
                    {
                        "value": 2,
                        "label": "Budgam"
                    },
                    {
                        "value": 3,
                        "label": "Baramulla"
                    },
                    {
                        "value": 4,
                        "label": "Doda"
                    },
                    {
                        "value": 5,
                        "label": "Jammu"
                    },
                    {
                        "value": 7,
                        "label": "Kathua"
                    },
                    {
                        "value": 8,
                        "label": "Kupwara"
                    },
                    {
                        "value": 10,
                        "label": "Poonch"
                    },
                    {
                        "value": 11,
                        "label": "Pulwama"
                    },
                    {
                        "value": 12,
                        "label": "Rajouri"
                    },
                    {
                        "value": 13,
                        "label": "Srinagar"
                    },
                    {
                        "value": 14,
                        "label": "Udhampur"
                    },
                    {
                        "value": 620,
                        "label": "Kishtwar"
                    },
                    {
                        "value": 621,
                        "label": "Ramban"
                    },
                    {
                        "value": 622,
                        "label": "Kulgam"
                    },
                    {
                        "value": 623,
                        "label": "Bandipora"
                    },
                    {
                        "value": 624,
                        "label": "Samba"
                    },
                    {
                        "value": 625,
                        "label": "Shopian"
                    },
                    {
                        "value": 626,
                        "label": "Ganderbal"
                    },
                    {
                        "value": 627,
                        "label": "Reasi"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113835650-sg4eh7t",
                "type": "select",
                "label": "Tehsil",
                "name": "PermanentTehsil",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113835650-5ik8q7z",
                "type": "text",
                "label": "Block",
                "name": "PermanentBlock",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1748246863285",
                "type": "text",
                "label": "Halqa Panchayat / Municipality Name ",
                "name": "PermanentHalqaPanchayatMunicipalityName",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113835650-9dnwkdb",
                "type": "text",
                "label": "Village",
                "name": "PermanentVillage",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113835650-u8jdlbr",
                "type": "text",
                "label": "Ward",
                "name": "PermanentWard",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740113835650-ozlqf46",
                "type": "text",
                "label": "Pincode",
                "name": "PermanentPincode",
                "minLength": 5,
                "maxLength": 6,
                "options": [],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "onlyDigits",
                    "specificLength"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    },
    {
        "id": "section-5",
        "section": "Bank Details",
        "fields": [
            {
                "id": "field-1740199601220",
                "type": "select",
                "label": "Select Bank",
                "name": "BankName",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "JAMMU AND KASHMIR BANK",
                        "label": "JAMMU AND KASHMIR BANK"
                    },
                    {
                        "value": "PUNJAB NATIONAL BANK",
                        "label": "PUNJAB NATIONAL BANK"
                    },
                    {
                        "value": "JK GRAMEEN BANK",
                        "label": "JK GRAMEEN BANK"
                    }
                ],
                "span": 12,
                "validationFunctions": [],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740199834738",
                "type": "text",
                "label": "Branch Name",
                "name": "BranchName",
                "minLength": 5,
                "maxLength": 50,
                "options": [],
                "span": 12,
                "validationFunctions": [
                    "notEmpty",
                    "onlyAlphabets"
                ],
                "transformationFunctions": [
                    "CaptilizeAlphabet"
                ],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740199859569",
                "type": "text",
                "label": "IFSC Code",
                "name": "IfscCode",
                "minLength": 5,
                "maxLength": 11,
                "options": [],
                "span": 12,
                "validationFunctions": [
                    "notEmpty",
                    "specificLength"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1740199893324",
                "type": "text",
                "label": "Account Number",
                "name": "AccountNumber",
                "minLength": 5,
                "maxLength": 16,
                "options": [],
                "span": 12,
                "validationFunctions": [
                    "notEmpty",
                    "onlyDigits",
                    "specificLength",
                    "duplicateAccountNumber"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    },
    {
        "id": "section-6",
        "section": "Documents",
        "fields": [
            {
                "id": "field-1751348702518",
                "type": "enclosure",
                "label": "Domicile Certificate",
                "name": "DomicileCertificate",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Domicile Certificate",
                        "label": "Domicile Certificate"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1751349651032",
                "type": "enclosure",
                "label": "Proof Of Residence",
                "name": "ProofOfResidence",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Voter Card",
                        "label": "Voter Card"
                    },
                    {
                        "value": "Electricity Bill",
                        "label": "Electricity Bill"
                    },
                    {
                        "value": "Aadhaar Card",
                        "label": "Aadhaar Card"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1745818036287",
                "type": "enclosure",
                "label": "Proof Of Age",
                "name": "ProofOfAge",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Adhaar Card",
                        "label": "Adhaar Card"
                    },
                    {
                        "value": "Domicile Certificate",
                        "label": "Domicile Certificate"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": true,
                "dependentField": "PensionType",
                "dependentValues": [
                    "OLD AGE PENSION",
                    "WOMEN IN DISTRESS"
                ]
            },
            {
                "id": "field-1751348751648",
                "type": "enclosure",
                "label": "Ration Card",
                "name": "RationCard",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Ration Card(Inner & Outter Both)",
                        "label": "Ration Card(Inner & Outter Both)"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1751349374248",
                "type": "enclosure",
                "label": "Aadhaar Card",
                "name": "AadhaarCard",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Aadhaar Card(Both Sides)",
                        "label": "Aadhaar Card(Both Sides)"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1751349450026",
                "type": "enclosure",
                "label": "Bank Passbook",
                "name": "BankPassbook",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Bank Passbook",
                        "label": "Bank Passbook"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1751348600186",
                "type": "enclosure",
                "label": "UDID Card",
                "name": "UdidCard",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "UDID Card",
                        "label": "UDID Card"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": true,
                "dependentField": "KindOfDisability",
                "dependentValues": [
                    "TEMPORARY"
                ]
            },
            {
                "id": "field-1751349522655",
                "type": "enclosure",
                "label": "Affidavit",
                "name": "Affidavit",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Affidavit attested by Judicial Magistrate lst Class or Executive Magistrate First Class that she/he is not in receipt of any pension/financial assistance from any other source.",
                        "label": "Affidavit attested by Judicial Magistrate lst Class or Executive Magistrate First Class that she/he is not in receipt of any pension/financial assistance from any other source."
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            },
            {
                "id": "field-1751349841039",
                "type": "enclosure",
                "label": "Death Certificate Of Husband",
                "name": "DeathCertificateOfHusband",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Death Certificate Of Husband",
                        "label": "Death Certificate Of Husband"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": true,
                "dependentField": "CivilCondition",
                "dependentValues": [
                    "WIDOW"
                ]
            },
            {
                "id": "field-1751350172624",
                "type": "enclosure",
                "label": "Divorce Certificate",
                "name": "DivorceCertificate",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Divorce Certificate",
                        "label": "Divorce Certificate"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": true,
                "dependentField": "CivilCondition",
                "dependentValues": [
                    "DIVORCEE"
                ]
            },
            {
                "id": "field-1751350272294",
                "type": "enclosure",
                "label": "Maintenance Affidavit",
                "name": "MaintenanceAffidavit",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Affidavit duly attested by Judicial Magistrate lst Class to the effect that she is not in receipt of any maintenance allowance.",
                        "label": "Affidavit duly attested by Judicial Magistrate lst Class to the effect that she is not in receipt of any maintenance allowance."
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": true,
                "dependentField": "CivilCondition",
                "dependentValues": [
                    "DIVORCEE"
                ]
            },
            {
                "id": "field-1751350390417",
                "type": "enclosure",
                "label": "Non - Remarriage Certificate",
                "name": "NonRemarriageCertificate",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Non - Remarriage Certificate by Gazetted Officer",
                        "label": "Non - Remarriage Certificate by Gazetted Officer"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "notEmpty",
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {},
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": true,
                "dependentField": "CivilCondition",
                "dependentValues": [
                    "DIVORCEE"
                ]
            },
            {
                "id": "field-1751350495787",
                "type": "enclosure",
                "label": "Other",
                "name": "Other",
                "minLength": 5,
                "maxLength": 50,
                "options": [
                    {
                        "value": "Please Select",
                        "label": "Please Select"
                    },
                    {
                        "value": "Other",
                        "label": "Other"
                    }
                ],
                "span": 6,
                "validationFunctions": [
                    "validateFile"
                ],
                "transformationFunctions": [],
                "additionalFields": {
                    "Other": [
                        {
                            "id": "field-1751445028470",
                            "type": "text",
                            "label": "Other Value",
                            "name": "OtherValue",
                            "minLength": 5,
                            "maxLength": 50,
                            "options": [],
                            "span": 12,
                            "validationFunctions": [
                                "notEmpty"
                            ],
                            "transformationFunctions": [],
                            "additionalFields": {},
                            "accept": "",
                            "editable": true,
                            "dependentOptions": {},
                            "isDependentEnclosure": false,
                            "dependentValues": []
                        }
                    ]
                },
                "accept": "",
                "editable": true,
                "dependentOptions": {},
                "isDependentEnclosure": false,
                "dependentValues": []
            }
        ],
        "editable": true
    }
]