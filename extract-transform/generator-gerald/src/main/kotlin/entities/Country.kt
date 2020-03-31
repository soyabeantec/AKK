package eu.akkalytics.et.gen.entities

import eu.akkalytics.et.gen.ANSI_RED
import eu.akkalytics.et.gen.ANSI_RESET
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import java.io.File

const val COUNTRIES_PATH = "./src/main/resources/countries.json"
val COUNTRIES = readCountriesFromJSONFile()

@Serializable
data class Country (
    @SerialName("Code") val code: String,
    @SerialName("Name") val name: String
)

/**
 * Validates the country code by checking
 * if the code is an existing one in COUNTRIES.
 * @return true if it is a legal country code
 */
fun String.validCountryCode(): Boolean {
    return COUNTRIES.any{it.code == this}
}

/**
 * Retrieves countries from a file which holds
 * the list of countries in a JSON format.
 * @return
 */
private fun readCountriesFromJSONFile(): List<Country> {
    val jsonSerializer = Json(JsonConfiguration.Stable)
    val res = mutableListOf<Country>()
    var jsonString: String? = null

    // Reads the file containing the countries
    try {
        jsonString = File(COUNTRIES_PATH).readText(Charsets.UTF_8)
    } catch (e: Exception) {
        println("$ANSI_RED! Could not find or read the file !$ANSI_RESET")
        println("   ERROR: $e")
    }

    // Parse the JSON string
    if (jsonString != null) {
        try {
            jsonString = jsonString.replace("[", "")
            jsonString = jsonString.replace("]", "")

            val jsonStringElements = jsonString.split("} ,").toTypedArray()
            jsonStringElements.forEachIndexed { index, s ->
                when {
                    index < jsonStringElements.size - 1 -> res.add(jsonSerializer.parse(Country.serializer(), "$s}"))
                    else -> res.add(jsonSerializer.parse(Country.serializer(), s))
                }
            }
        } catch (e: Exception) {
            println("$ANSI_RED! Invalid JSON format !$ANSI_RESET")
            println("   ERROR: $e")
            println("   Content of jsonString: $jsonString")
        }
    }

    return res
}