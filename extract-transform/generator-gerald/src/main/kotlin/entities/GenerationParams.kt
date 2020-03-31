package eu.akkalytics.et.gen.entities

import kotlinx.serialization.Serializable

/**
 * A data class which holds the parameters that
 * are passed at the start of the program and are later
 * utilized as a basis for the customs data generation.
 * @param company a two letter code, e.g. ‘WV’.
 * @param plant a two digit numeric code, e.g. ’01’.
 * @param importCountry a country code, e.g. ‘DE’.
 * @param periodRangeStart a date (date format: yyyyMM), e.g. '201904'. Must be smaller than *periodRangeEnd*.
 * @param periodRangeEnd a date (date format: yyyyMM)e.g. '201905'. Must be bigger than *periodRangeStart*.
 */
@Serializable
data class GenerationParams(
    val company: String,
    val plant: String,
    val importCountry: String,
    val periodRangeStart: Int,
    val periodRangeEnd: Int
) {
    /**
     * Validates the given [GenerationParams] parameters.
     * @return 'true' when all are parameters are legal.
     */
    fun validate(): Boolean {
        return validCompanyCode(company) &&
                validPlantCode(plant) &&
                importCountry.validCountryCode() &&
                validPeriodRange(periodRangeStart) &&
                validPeriodRange(periodRangeEnd) &&
                periodRangeStart < periodRangeEnd;
    }

    /**
     * Checks if a [String] is a valid company code.
     * To be valid is has to consist of only two characters and
     * those have to be upper-case letters.
     * @param checkCode the to be checked company code.
     * @return 'true' when it fulfills the given requirements.
     */
    private fun validCompanyCode(checkCode: String): Boolean {
        return checkCode.length == 2 && checkCode[0].isUpperCase() && checkCode[1].isUpperCase()
    }

    /**
     * Checks if a [String] is a valid plant code.
     * To be valid is has to consist of only two characters and
     * those have to be numeric.
     * @param checkCode the to be checked company code.
     * @return 'true' when it fulfills the given requirements.
     */
    private fun validPlantCode(checkCode: String): Boolean {
        return checkCode.length == 2 && checkCode[0].isDigit() && checkCode[1].isDigit()
    }

    /**
     * Checks if a [Int] is a period range.
     * To be valid is has to consist of only six characters.
     * The first four digits have to be a valid year between '0000' and '9999'.
     * The last two digits have a be a valid month between '01' and '12'.
     * @param checkPeriod the to be checked company code.
     * @return 'true' when it fulfills the given requirements.
     */
    private fun validPeriodRange(checkPeriod: Int): Boolean {
        val res = checkPeriod.toString()
        return if (res.length == 6) {
            val month = "${res[4]}${res[5]}".toInt()
            month in 1..12
        } else {
            false;
        }
    }
}


