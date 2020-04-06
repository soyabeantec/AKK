package eu.akkalytics.et.gen.entities

import eu.akkalytics.et.gen.makeRandomDateWithinRange
import java.util.*
import kotlin.math.round

/**
 * Represents the data that is being hold in
 * one invoice line.
 */
data class InvoiceLine(
    val frightCosts: Float,
    val insuranceCosts: Float,
    val additionalCosts: Float,
    val grossWeight: Float,
    val netWeight: Float,
    val hsCode: String,
    val value: Float,
    val quantity: Int,
    val customValue: Float,
    val vat: Float,
    val duties: Float,
    val preferentialCode: String,
    /**
     * Date when the invoice line
     * has been last modified
     */
    val lastModified: Date
)

/**
 * Used to generate one [InvoiceLine]
 */
class InvoiceLineGenerator(
    private val shipmentDate: Date,
    private val minDate: Date,
    private val todayDate: Date,
    private val sent: Boolean
) {
    companion object {
        /**
         * The maximal weight that a ISO container can carry.
         */
        const val MAX_ISO_CONTAINER_WEIGHT = 28230f
        /**
         * The possible VAT values in order to
         * calculate the VAT value in the 'genVat' function.
         */
        val POSSIBLE_VAT_VALUES = arrayOf(
            0f,
            10f,
            20f
        )
        /**
         * The possible preferential codes for the
         * 'genPreferentialCode' function.
         */
        val POSSIBLE_PREFERENTIAL_CODES = arrayOf(
            "preferential: 103",
            "non-preferential: 142"
        )
    }

    private var netValue: Float = 0.0f
    private var frightCosts: Float = 0.0f
    private var insuranceCosts: Float = 0.0f
    private var additionalCosts: Float = 0.0f
    private var netWeight: Float = 0.0f
    private var customValue: Float = 0.0f

    /**
     * @return
     */
    fun makeNewInvoiceLine(): InvoiceLine {
        // Values that have to be generated before the others due to dependencies.
        netValue = genValue()
        frightCosts = genFrightCosts()
        insuranceCosts = genInsuranceCosts()
        additionalCosts = genAdditionalCosts()
        netWeight = genNetWeight()
        customValue = genCustomValue()


        return InvoiceLine(
            frightCosts = frightCosts,
            insuranceCosts = insuranceCosts,
            additionalCosts = additionalCosts,
            grossWeight = genGrossWeight(),
            netWeight = netWeight,
            hsCode = genHSCode(),
            value = netValue,
            quantity = genQuantity(),
            customValue = customValue,
            vat = genVat(),
            duties = genDuties(),
            preferentialCode = genPreferentialCode(),
            lastModified = genLastModified()
        )
    }

    // region Helper Functions

    /**
     * Float extension function that:
     * Rounds a number to a given decimal position.
     * @param decimals the definied decimal position.
     * @return the rounded float.
     */
    private fun Float.round(decimals: Int): Float {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return (round(this * multiplier) / multiplier).toFloat()
    }

    // endregion

    /**
     * Randomly chooses a percentage from 1% to 5% in order to calculate
     * the fright cost for one item relative to its value.
     * @return the fright cost only without the value as a Float rounded to two decimals.
     */
    private fun genFrightCosts(): Float {
        val percentageOfNetValue = (1..5).random().toFloat() / 100
        return (netValue * percentageOfNetValue).round(2)
    }

    /**
     * Randomly chooses a percentage from 0.5% to 1.5% in order to calculate
     * the insurance cost based on the fright cost.
     * @return the insurance cost as a Float rounded to two decimals.
     */
    private fun genInsuranceCosts(): Float {
        val percentageOfFrightCosts = (5..15).random().toFloat() / 1000
        return (frightCosts * percentageOfFrightCosts).round(2)
    }

    /**
     * Randomly chooses a percentage from 0% to 10% in order to calculate
     * the cost that comes on top of all other ones combined (excl. taxes)
     * @return the additional cost as a Float rounded to two decimals.
     */
    private fun genAdditionalCosts(): Float {
        val percentageOfAdditionalCosts = (0..10).random().toFloat() / 100
        val allCosts = netValue + frightCosts + insuranceCosts
        return (allCosts * percentageOfAdditionalCosts).round(2)
    }

    /**
     * Adds five percent to the net weight,
     * this should resemble the weight of the packaging.
     * @return the gross weight as a Float rounded to two decimals.
     */
    private fun genGrossWeight(): Float {
        val res = netWeight + netWeight * 0.05f
        return res.round(2)
    }

    /**
     * Randomly generates a weight for the item which takes the cost of the
     * shipment into consideration, also the weight of one item can not
     * exceed the max. weight a ISO-container which can hold 28.230kg.
     * @return the weight of the item as a Float rounded to two decimals.
     */
    private fun genNetWeight(): Float {
        var res: Float
        do {
            res = (1..1000).random().times(frightCosts / 10)
        }while (res > MAX_ISO_CONTAINER_WEIGHT)
        return res.round(2)
    }

    /**
     * Randomly generates a code (InvoiceLineHSCode) with a 10 digit number.
     * @return the generated code as a String.
     */
    private fun genHSCode(): String {
        return ((1..1000000000).random() + 1000000000).toString()
    }

    /**
     * Generates a random item value within the range of 1.99 to 10,000.99.
     * @return the generated value as a Float.
     */
    private fun genValue(): Float {
        return (1..10000).random() + 0.99f
    }

    /**
     * Generates a random quantity within the range of 1 to 10,000.
     * @return the generated quantity as a Int.
     */
    private fun genQuantity(): Int {
        return (1..10000).random()
    }

    /**
     * Calculates the custom value by using the value + the additional costs.
     * @return the generated custom value as a Float rounded to two decimals.
     */
    private fun genCustomValue(): Float {
        return (netValue + additionalCosts).round(2)
    }

    /**
     * Randomly chooses one of the possible vat values.
     * @return the randomly chosen value as a Float.
     */
    private fun genVat(): Float {
        val randomIndex = (POSSIBLE_VAT_VALUES.indices).random()
        return POSSIBLE_VAT_VALUES[randomIndex]
    }

    /**
     * Randomly chooses a percentage from 1% to 30% in order
     * to calculate the duties based on the 'customValue'.
     * @return the value of the duties as a Float rounded to two decimals..
     */
    private fun genDuties(): Float {
        val percentageOfDuties = (1..30).random().toFloat() / 100
        return (customValue * percentageOfDuties).round(2)
    }

    /**
     * Randomly chooses one of the possible preferential codes.
     * @return the string which holds the information about the preferential code (name and number)
     */
    private fun genPreferentialCode(): String {
        val randomIndex = (POSSIBLE_PREFERENTIAL_CODES.indices).random()
        return POSSIBLE_PREFERENTIAL_CODES[randomIndex]
    }

    /**
     * Generates a day between the first day of the year and declaration date.
     * @return the day of the last modification as a Date obj.
     */
    private fun genLastModified(): Date {
        val minDate = minDate
        val maxDate = if (sent) { shipmentDate } else { todayDate }
        return makeRandomDateWithinRange(minDate, maxDate)
    }
}