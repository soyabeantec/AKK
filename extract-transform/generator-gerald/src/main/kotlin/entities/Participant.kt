package eu.akkalytics.et.gen.entities

/**
 * Commun data structure of the
 * exporters, importers and suppliers.
 */
data class Participant(
    /**
     * House number
     */
    val addressNumber: String,
    /**
     * Address of the legal entity
     */
    val address: String,
    /**
     * Registration number of the legal entity
     */
    val registrationNumber: String,
    /**
     * Name of the legal entity, e.g a company
     */
    val name: String,
    /**
     * Region in the country
     */
    val region: String,
    /**
     * Home country
     */
    val country: String
)

/**
 * All possible values an exporter can have.
 * Used for the random selection of one exporter.
 */
val EXPORTERS = arrayOf(
    Participant(
        "78",
        "Floridusgasse, 1010 WIEN",
        "443-78574",
        "Fedco",
        "Vienna",
        "AT"),
    Participant(
        "bld. 30",
        "Lidonu, RIGA",
        "46-19-96",
        "Complete Tech",
        "Riga",
        "LV"),
    Participant(
        "2550",
        "Brigadier Pumacahua, LINCE",
        "471-7607",
        "Rhodes Furniture",
        "Lima",
        "PE"
    ),
    Participant(
        "1250long 9hao 601",
        "Zhen Jin Lu, 200442 BAOSHAN DISTRICT",
        "52888799",
        "Yanfa",
        "Shanghai",
        "CN"
    ),
    Participant(
        "1492",
        "Seth Street, 76903 SAN ANGELO",
        "658-9807",
        "Unity Frankford",
        "Texas",
        "US"
    )
)

/**
 * All possible values an importer can have.
 * Used for the random selection of one importer.
 */
val IMPORTERS = arrayOf(
    Participant(
        "62",
        "Leobnerstrasse, 8042 GRAZ",
        "511-57180",
        "RaseN",
        "Styria",
        "AT"),
    Participant(
        "bld. 7",
        "Motoru, RIGA",
        "46-85-28",
        "Chief Auto Parts",
        "Riga",
        "LV"),
    Participant(
        "117",
        "Avenida Imperio De Los Incas, MACHUPICCHU",
        "21-1364",
        "Cuppy",
        "Cuzco",
        "PE"),
    Participant(
        "239hao Kang He Li Jing 5dong 2dan Yuan 301shi",
        "Cheng Du Shi Da Shi Xi Lu, 610041 WUHOU DISTRICT",
        "13845839",
        "Beijing Sika Deer Breeding Base",
        "Sichuan",
        "CN"
    ),
    Participant(
        "1343",
        "Twin Oaks Drive, 46984 TRAVERSE CITY",
        "383-1072",
        "Production Occupations",
        "Michigan",
        "US"
    )
)

/**
 * All possible values a supplier can have.
 * Used for the random selection of one supplier.
 */
val SUPPLIERS = arrayOf(
    Participant(
        "81",
        "Bahnhofstrasse, 6850 DORNBIRN",
        "781-03675",
        "Adaptas",
        "Vorarlberg",
        "AT"
    ),
    Participant(
        "bld. 38",
        "Hospitalu, RIGA",
        "37-62-24",
        "Grossman",
        "Riga",
        "LV"),
    Participant(
        "445",
        "Panamericana Norte, SANTA",
        "35-2090",
        "Recordbar",
        "Ancash",
        "PE"
    ),
    Participant(
        "43hao Hai Kou Shi Gong An Ju Wang Jing Zhi Dui",
        "Hai Kou Shi Jin Long Lu, 570125 LONGHUA DISTRICT",
        "52895659",
        "Haikou Fuli Kang New Energy Co., Ltd.",
        "Hainan",
        "CN"
    ),
    Participant(
        "4928",
        "Esdel Road, 91405 VAN NUYS",
        "373-5091",
        "Gantos",
        "California",
        "US"
    )
)