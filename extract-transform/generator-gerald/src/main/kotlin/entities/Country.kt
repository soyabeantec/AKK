package eu.akkalytics.et.gen.entities

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.util.*

val COUNTRIES = loadCountries()

@Serializable
data class Country (
    @SerialName("Code") val code: String,
    @SerialName("Name") val name: String
)

/**
 * Validates the country code by checking
 * if the code is an existing one in COUNTRIES.
 * @return 'true' when the [String] it is a real country code
 */
fun String.validCountryCode(): Boolean {
    return COUNTRIES.any{it.code == this}
}

/**
 * Retrieves all the countries from the
 * [java.util.Locale] class as List of [Country] objects.
 *  @return a list of all countries worldwide
 */
private fun loadCountries(): List<Country> {
    val countries = mutableListOf<Country>()

    Locale.getISOCountries().forEach {
        val iso = it;
        val locale = Locale("", iso)
        countries.add(Country(iso, locale.displayCountry))
    }

    return countries
}